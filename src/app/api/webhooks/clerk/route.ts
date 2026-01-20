// src/app/api/webhooks/clerk/route.ts
// Adjust the path if your route lives elsewhere.

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import {
  createShopifyCustomer,
  getShopifyCustomerByEmail,
} from "../../../lib/shopify-admin/route"; // change if your alias/path differs

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
  }

  // ✅ In your Next version, headers() is async
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  // ✅ Prefer raw body for Svix signature verification
  const body = await req.text();

  let evt: WebhookEvent;

  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Parse JSON AFTER verification
  const payload = JSON.parse(body) as WebhookEvent;
  const eventType = payload.type;

  if (eventType === "user.created") {
    const data: any = payload.data;

    const clerkUserId: string | undefined = data?.id;
    const email_addresses: any[] = Array.isArray(data?.email_addresses)
      ? data.email_addresses
      : [];
    const primary_email_address_id: string | undefined =
      data?.primary_email_address_id;

    const first_name: string | undefined = data?.first_name ?? undefined;
    const last_name: string | undefined = data?.last_name ?? undefined;

    const primaryEmail = email_addresses.find(
      (email) => email?.id === primary_email_address_id
    );

    const email = primaryEmail?.email_address as string | undefined;

    if (!email) {
      return NextResponse.json(
        { message: "No primary email found for user.created" },
        { status: 200 }
      );
    }

    try {
      // Check if customer already exists in Shopify
      const existingCustomer = await getShopifyCustomerByEmail(email);

const existingEdgesLen = existingCustomer?.data?.customers?.edges?.length ?? 0;
if (existingEdgesLen > 0) {
  console.log("Customer already exists in Shopify:", email);
  return NextResponse.json({ message: "Customer already exists" });
}


      // Create customer in Shopify
      const result = await createShopifyCustomer(
        email,
        first_name,
        last_name,
        clerkUserId
      );

      if ((result?.data?.customerCreate?.userErrors?.length ?? 0) > 0) {
        console.error(
          "Shopify customer creation errors:",
          result.data.customerCreate.userErrors
        );
        return NextResponse.json(
          { error: "Failed to create customer in Shopify" },
          { status: 500 }
        );
      }

      console.log(
        "Successfully created Shopify customer:",
        result?.data?.customerCreate?.customer
      );

      return NextResponse.json({
        message: "Customer created successfully",
        customer: result?.data?.customerCreate?.customer,
      });
    } catch (error) {
      console.error("Error creating Shopify customer:", error);
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.updated") {
    const data: any = payload.data;
    console.log("User updated:", data?.id);
    // Add Shopify update logic here if you want
    return NextResponse.json({ message: "Webhook processed" });
  }

  // Ignore other event types
  return NextResponse.json({ message: "Webhook processed" });
}
