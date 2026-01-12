import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query, variables } = await request.json();

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Shopify API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Shopify' }, { status: 500 });
  }
}