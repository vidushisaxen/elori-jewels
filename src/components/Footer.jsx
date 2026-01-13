// components/Footer.jsx
import Link from "next/link";
import { getShopPolicies } from "../app/lib/shopify/policies";

export default async function Footer() {
  const policies = await getShopPolicies();

  return (
    <footer className="w-full bg-white text-black border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* COLUMN 1 - Policies */}
        <div className="flex flex-col gap-3 text-xs uppercase tracking-widest">
          <h4 className="font-semibold mb-2">Contact Us</h4>

          {policies.shippingPolicy && (
            <Link href={`/policies/${policies.shippingPolicy.handle}`}>
              Shipping
            </Link>
          )}
          {policies.refundPolicy && (
            <Link href={`/policies/${policies.refundPolicy.handle}`}>
              Returns & Refunds
            </Link>
          )}
          {policies.termsOfService && (
            <Link href={`/policies/${policies.termsOfService.handle}`}>
              Terms & Conditions
            </Link>
          )}
          {policies.privacyPolicy && (
            <Link href={`/policies/${policies.privacyPolicy.handle}`}>
              Privacy Policy
            </Link>
          )}
          
        </div>


        {/* COLUMN 2 */}
        <div className="flex flex-col gap-3 text-xs uppercase tracking-widest">
          <h4 className="font-semibold mb-2">Brand Profile</h4>

          <Link href="/brand-profile">Stores</Link>
          <Link href="/philanthropy">Philanthropy</Link>
          <Link href="/recycling">Recycling</Link>
          <Link href="/care-guide">Care Guide</Link>
          <Link href="/careers">Careers</Link>
        </div>


        {/* COLUMN 3 */}
        <div className="flex flex-col gap-3 text-xs uppercase tracking-widest">
          <h4 className="font-semibold mb-2">Social</h4>

          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
            Pinterest
          </a>
        </div>


        {/* COLUMN 4 – JOIN THE LIST */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-light uppercase tracking-[0.2em]">
            Join The List
          </h4>

          <p className="text-xs opacity-70 leading-relaxed">
            Receive updates on new arrivals, exclusive events, store openings, news and more.
          </p>

          <div className="flex items-end border-b border-zinc-300 pb-2">
            <input
              type="email"
              placeholder="Email address"
              className="w-full text-xs outline-none placeholder:text-zinc-400 tracking-widest"
            />
            <button className="text-zinc-400 hover:text-black transition-colors duration-300">
              →
            </button>
          </div>

          <p className="text-sm opacity-80 mt-6 leading-snug">
            ELORI JEWELS is an ethically crafted conceptual fine jewellery studio.  
            Explore ethically sourced natural diamonds and gemstones, bespoke engagement & bridal pieces and more.  
            Shop online or visit us in-store.
          </p>
        </div>

      </div>


      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs border-t border-zinc-200 gap-4">

        <p className="uppercase tracking-widest opacity-70">
          © Elori Jewels
        </p>
      </div>

    </footer>
  );
}