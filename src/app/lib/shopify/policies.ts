// lib/shopify/policies.ts
import { shopifyFetch } from './index';
import { ShopPolicies } from './types';

const POLICIES_QUERY = `
  query GetPolicies {
    shop {
      privacyPolicy {
        id
        title
        body
        handle
      }
      refundPolicy {
        id
        title
        body
        handle
      }
      shippingPolicy {
        id
        title
        body
        handle
      }
      termsOfService {
        id
        title
        body
        handle
      }
    }
  }
`;

interface ShopifyPoliciesResponse {
  body: {
    data: {
      shop: ShopPolicies;
    };
  };
}

export async function getShopPolicies(): Promise<ShopPolicies> {
  const res = await shopifyFetch({
    query: POLICIES_QUERY,
  }) as ShopifyPoliciesResponse;

  return res.body.data.shop;
}