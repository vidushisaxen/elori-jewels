import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { customerAccountGraphQL } from "../../auth/_customerAccountApi";

type SessionData = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  idToken?: string;
  email?: string;
};

function parseSessionToken(token: string): SessionData | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString());
  } catch {
    return null;
  }
}

type UpdateCustomerResult = {
  customerUpdate?: {
    customer?: {
      id: string;
      firstName?: string;
      lastName?: string;
    };
    userErrors?: Array<{ field?: string[]; message: string }>;
  };
};

export async function POST(req: Request) {
  try {
    const { firstName, lastName } = (await req.json()) as {
      firstName?: string;
      lastName?: string;
    };

    const nextFirstName = (firstName || "").trim();
    const nextLastName = (lastName || "").trim();

    if (!nextFirstName && !nextLastName) {
      return NextResponse.json(
        { ok: false, error: "firstName_or_lastName_required" },
        { status: 400 }
      );
    }

    if (nextFirstName.length > 60 || nextLastName.length > 60) {
      return NextResponse.json({ ok: false, error: "name_too_long" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("shopify_customer_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
    }

    const session = parseSessionToken(sessionToken);
    if (!session?.accessToken || !session.accessToken.startsWith("shcat_")) {
      return NextResponse.json({ ok: false, error: "invalid_customer_access_token" }, { status: 401 });
    }

    const mutation = `
      mutation updateCustomer($input: CustomerUpdateInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://elori-jewels.vercel.app/";
    const origin = baseUrl ? new URL(baseUrl).origin : undefined;

    const headers: Record<string, string> = {
      // Customer Account API expects the raw token (shcat_...) in Authorization,
      // not the usual "Bearer " prefix.
      Authorization: session.accessToken,
      "Content-Type": "application/json",
      "user-agent": "Mozilla/5.0 (compatible; Next.js)",
    };
    if (origin) {
      headers["origin"] = origin;
    }

    const result = await customerAccountGraphQL<UpdateCustomerResult>(
      mutation,
      {
        input: {
          ...(nextFirstName ? { firstName: nextFirstName } : {}),
          ...(nextLastName ? { lastName: nextLastName } : {}),
        },
      },
      headers
    );

    if (result.errors?.length) {
      console.error("[account/update-name] Customer Account API errors:", result.errors);
      return NextResponse.json(
        { ok: false, error: "update_failed", apiErrors: result.errors },
        { status: 400 }
      );
    }

    const userErrors = result.data?.customerUpdate?.userErrors || [];
    if (userErrors.length > 0) {
      return NextResponse.json(
        { ok: false, error: "update_failed", userErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      customer: result.data?.customerUpdate?.customer,
    });
  } catch (e) {
    console.error("[account/update-name] error", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

