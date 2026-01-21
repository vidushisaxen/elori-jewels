import { NextRequest, NextResponse } from "next/server";
import { customerAccountGraphQL, jsonError } from "../_customerAccountApi";

// Mirrors the SessionData shape used by /api/auth/session
interface SessionData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  idToken?: string;
  customer: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

// NOTE:
// Update these fields to match your Customer Account API schema.
const VERIFY_OTP_MUTATION = /* GraphQL */ `
  mutation VerifyOtp($email: String!, $code: String!) {
    verifyOtp(email: $email, code: $code) {
      accessToken
      expiresIn
      customer {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body?.email || "").toString().trim().toLowerCase();
    const code = (body?.code || "").toString().trim();

    if (!email || !email.includes("@")) {
      return jsonError("Email is required", 400);
    }
    if (!code) {
      return jsonError("OTP code is required", 400);
    }

    const result = await customerAccountGraphQL<{
      verifyOtp?: {
        accessToken?: string;
        expiresIn?: number;
        customer?: { id: string; email?: string; firstName?: string; lastName?: string };
      };
    }>(VERIFY_OTP_MUTATION, { email, code });

    if (result.errors?.length) {
      return NextResponse.json(
        { ok: false, error: result.errors[0].message, errors: result.errors },
        { status: 400 }
      );
    }

    const payload = result.data?.verifyOtp;
    const accessToken = payload?.accessToken;

    if (!accessToken) {
      return jsonError("OTP verification failed (no access token returned)", 400);
    }

    const expiresIn = typeof payload?.expiresIn === "number" ? payload!.expiresIn! : 60 * 60;
    const expiresAt = Date.now() + expiresIn * 1000;

    const session: SessionData = {
      accessToken,
      expiresAt,
      customer: {
        id: payload?.customer?.id || "unknown",
        email: payload?.customer?.email || email,
        firstName: payload?.customer?.firstName,
        lastName: payload?.customer?.lastName,
      },
    };

    const encoded = Buffer.from(JSON.stringify(session)).toString("base64");

    const res = NextResponse.json({ ok: true });
    res.cookies.set("shopify_customer_token", encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });
    res.cookies.set("customer_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    return res;
  } catch (e) {
    console.error("[verify-otp] error", e);
    return jsonError("Failed to verify OTP", 500);
  }
}

