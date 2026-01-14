import { NextResponse } from 'next/server';

const getProductByHandleQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    if (!handle) {
      return NextResponse.json({ error: 'Missing handle parameter' }, { status: 400 });
    }

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: getProductByHandleQuery,
          variables: { handle },
        }),
      }
    );

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: data.errors[0].message }, { status: 500 });
    }

    if (!data.data?.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Reshape the product data
    const product = data.data.product;
    return NextResponse.json({
      id: product.id,
      handle: product.handle,
      title: product.title,
      variants: product.variants.edges.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        availableForSale: edge.node.availableForSale,
        price: edge.node.price,
      })),
    });
  } catch (error) {
    console.error('Shopify API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Shopify' }, { status: 500 });
  }
}

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