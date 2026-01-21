import { NextResponse } from "next/server";

const DEFAULT_CUSTOMER_ACCOUNT_API_URL = "https://shopify.com/api/customer_accounts/graphql";

export function getCustomerAccountApiUrl() {
  return process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL || DEFAULT_CUSTOMER_ACCOUNT_API_URL;
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

