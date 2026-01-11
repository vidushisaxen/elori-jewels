import productFragment from '../fragments/product';
import seoFragment from '../fragments/seo';

const collectionFragment = /* GraphQL */ `
  fragment collection on Collection {
    handle
    title
    description
    seo {
      ...seo
    }
    updatedAt
  }
  ${seoFragment}
`;

export const getCollectionsQuery = `
  query {
    collections(first: 250) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          seo {
            title
            description
          }
          updatedAt
        }
      }
    }
  }
`;

export const getCollectionQuery = `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
        altText
      }
      seo {
        title
        description
      }
      updatedAt
    }
  }
`;

export const getCollectionProductsQuery = `
  query getCollectionProducts(
    $handle: String!
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
        altText
      }
      products(first: 100, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            tags
            seo {
              title
              description
            }
          }
        }
      }
    }
  }
`;

