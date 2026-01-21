import { NextRequest, NextResponse } from "next/server";
import { customerAccountGraphQL, jsonError } from "../_customerAccountApi";

const SEND_OTP_MUTATION = `
  mutation SendOTP($email: String!) {
    customerSendVerificationCode(email: $email) {
      customerUserErrors {
        code
        message
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    if (!email || !email.includes("@")) {
      return jsonError("Email is required", 400);
    }

    const result = await customerAccountGraphQL(SEND_OTP_MUTATION, { email });

    if (result.errors?.length) {
      return NextResponse.json(
        {
          ok: false,
          error: result.errors[0].message,
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-otp]", err);
    return jsonError("Failed to send OTP", 500);
  }
}
