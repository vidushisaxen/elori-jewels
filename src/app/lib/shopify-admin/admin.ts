// src/lib/shopify-admin/admin.ts
// (If your project uses a different path, keep the contents the same and adjust the location.)
// This file is SERVER-ONLY and safe to import from route handlers / server actions.

import "server-only";
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";

/**
 * ENV REQUIRED (runtime):
 * - SHOPIFY_STORE_DOMAIN = https://your-store.myshopify.com
 * - SHOPIFY_ADMIN_API_ACCESS_TOKEN = shpat_...
 * - SHOPIFY_API_SECRET_KEY = shpss_... (app secret key, NOT the admin token)
 *
 * NOTE:
 * Do NOT throw at module scope based on env vars in Next.js.
 * Validate lazily at runtime when a request actually hits your server.
 */

type GraphqlClient = InstanceType<
  ReturnType<typeof shopifyApi>["clients"]["Graphql"]
>;

let cachedClient: GraphqlClient | null = null;

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function createAdminGraphqlClient(): GraphqlClient {
  const SHOPIFY_STORE_DOMAIN = getRequiredEnv("SHOPIFY_STORE_DOMAIN");
  const SHOPIFY_ADMIN_API_ACCESS_TOKEN = getRequiredEnv(
    "SHOPIFY_ADMIN_API_ACCESS_TOKEN"
  );
  const SHOPIFY_API_SECRET_KEY = getRequiredEnv("SHOPIFY_API_SECRET_KEY");

  // Use the newest ApiVersion enum that exists in YOUR installed @shopify/shopify-api.
  // Your TS error earlier showed ApiVersion.January23 exists, so we use that.
  const shopify = shopifyApi({
    apiSecretKey: SHOPIFY_API_SECRET_KEY,
    apiVersion: ApiVersion.January23,
    isCustomStoreApp: true,
    adminApiAccessToken: SHOPIFY_ADMIN_API_ACCESS_TOKEN,
    isEmbeddedApp: false,
    hostName: SHOPIFY_STORE_DOMAIN.replace("https://", ""),
  });

  const session = shopify.session.customAppSession(SHOPIFY_STORE_DOMAIN);
  return new shopify.clients.Graphql({ session });
}

export function getShopifyAdminClient(): GraphqlClient {
  if (!cachedClient) cachedClient = createAdminGraphqlClient();
  return cachedClient;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

type ShopifyUserError = { field?: string[]; message: string };

function extractUserErrors(payload: any): ShopifyUserError[] {
  // Common shapes returned by Shopify mutations: { mutationName: { userErrors: [...] } }
  if (!payload || typeof payload !== "object") return [];
  for (const key of Object.keys(payload)) {
    const userErrors = payload?.[key]?.userErrors;
    if (Array.isArray(userErrors)) return userErrors;
  }
  return [];
}

function throwIfUserErrors(body: any, context: string) {
  const userErrors = extractUserErrors(body?.data);
  if (userErrors.length) {
    const msg = userErrors.map((e) => e.message).join("; ");
    throw new Error(`Shopify userErrors (${context}): ${msg}`);
  }
}

// -----------------------------------------------------------------------------
// Customer helpers
// -----------------------------------------------------------------------------

export async function createShopifyCustomer(
  email: string,
  firstName?: string,
  lastName?: string,
  note?: string
) {
  const client = getShopifyAdminClient();

  const mutation = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
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

  const variables = {
    input: {
      email,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      note: note ?? "",
      tags: ["storefront-user"],
    },
  };

  const response = await client.query({
    data: { query: mutation, variables },
  });

  // Keep your existing behavior (return response.body), but fail fast on errors.
  const body: any = response.body;
  throwIfUserErrors(body, "customerCreate");

  return body;
}

type CustomersByEmailResult = {
  data: {
    customers: {
      edges: Array<{
        node: {
          id: string;
          email: string;
        };
      }>;
    };
  };
};

export async function getShopifyCustomerByEmail(
  email: string
): Promise<CustomersByEmailResult> {
  const client = getShopifyAdminClient();

  const query = `
    query getCustomerByEmail($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
          }
        }
      }
    }
  `;

  const response = await client.query({
    data: {
      query,
      variables: { query: `email:${email}` },
    },
  });

  // ✅ GUARANTEE a return value (never undefined)
  return (
    response.body ?? {
      data: {
        customers: {
          edges: [],
        },
      },
    }
  );
}

// -----------------------------------------------------------------------------
// Metafield helpers
// -----------------------------------------------------------------------------

export async function updateCustomerMetafield(
  customerId: string,
  namespace: string,
  key: string,
  value: string,
  type: string = "json"
) {
  const client = getShopifyAdminClient();

  const mutation = `
    mutation updateCustomerMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    metafields: [
      {
        ownerId: customerId,
        namespace,
        key,
        value,
        type,
      },
    ],
  };

  const response = await client.query({
    data: { query: mutation, variables },
  });

  const body: any = response.body;
  throwIfUserErrors(body, "metafieldsSet");

  return body;
}

export async function getCustomerMetafield(
  customerId: string,
  namespace: string,
  key: string
) {
  const client = getShopifyAdminClient();

  const query = `
    query getCustomerMetafield($id: ID!, $namespace: String!, $key: String!) {
      customer(id: $id) {
        metafield(namespace: $namespace, key: $key) {
          value
          type
        }
      }
    }
  `;

  const variables = {
    id: customerId,
    namespace,
    key,
  };

  const response = await client.query({
    data: { query, variables },
  });

  return (response.body ?? {}) as any;
}
