import { NextResponse } from "next/server";

const SHOPIFY_STORE_ID = process.env.SHOPIFY_STORE_ID || "97678459179";

export function getCustomerAccountApiUrl() {
  return `https://shopify.com/${SHOPIFY_STORE_ID}/account/customer/api/2025-07/graphql`;
}

export type CustomerAccountGraphQLResult<TData> = {
  data?: TData;
  errors?: Array<{ message: string; extensions?: any }>;
};

export async function customerAccountGraphQL<TData>(
  
  query: string,
  variables?: Record<string, any>,
  headers?: Record<string, string>
): Promise<CustomerAccountGraphQLResult<TData>> {
  const res = await fetch(getCustomerAccountApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as CustomerAccountGraphQLResult<TData>;

  // Normalize non-200 responses into GraphQL-like error shape
  if (!res.ok && !json.errors) {
    return { errors: [{ message: `Customer Account API HTTP ${res.status}` }] };
  }

  return json;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
