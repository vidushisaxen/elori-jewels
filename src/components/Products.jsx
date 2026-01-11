// app/page.jsx  (or app/shop/page.jsx)
import Link from "next/link";

export const revalidate = 60; 

export default async function Products() {
  const products = await getAllProducts();

  return (
    <>
      <section className="bg-black px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium tracking-[0.25em] uppercase text-zinc-400">
              Featured pieces
            </h2>
            <Link
              href="/shop"
              className="text-xs text-zinc-400 hover:text-zinc-100"
            >
              View all
            </Link>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => {
              const image = product.images?.[0]?.edges?.[0]?.node;
              const price = product.priceRange?.minVariantPrice;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/70">
                    {image && (
                      <div className="aspect-4/5 w-full overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.altText || product.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="px-4 py-4">
                      <p className="text-sm text-zinc-100">
                        {product.title}
                      </p>
                      {price && (
                        <p className="mt-1 text-xs text-zinc-400">
                          {price.amount} {price.currencyCode}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
