// components/Footer.jsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white text-black border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* COLUMN 1 */}
        <div className="flex flex-col gap-3 text-xs uppercase tracking-widest">
          <h4 className="font-semibold mb-2">Contact Us</h4>

          <Link href="/contact">Shipping</Link>
          <Link href="/returns">Returns & Repairs</Link>
          <Link href="/faqs">FAQs</Link>
          <Link href="/warranty">Warranty Policy</Link>
          <Link href="/terms">Terms & Conditions</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/cookies">Cookies Policy</Link>
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

          <a href="https://instagram.com">Instagram</a>
          <a href="https://facebook.com">Facebook</a>
          <a href="https://pinterest.com">Pinterest</a>
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
            NOIR JEWELS is an ethically crafted conceptual fine jewellery studio.  
            Explore ethically sourced natural diamonds and gemstones, bespoke engagement & bridal pieces and more.  
            Shop online or visit us in-store.
          </p>
        </div>

      </div>


      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs border-t border-zinc-200 gap-4">

        <p className="uppercase tracking-widest opacity-70">
          © NOIR JEWELS
        </p>

        <div className="flex items-center gap-6 uppercase tracking-widest">
          <span>$/USD</span>

          <div className="text-lg font-semibold">
            NJ
          </div>
        </div>

      </div>

    </footer>
  );
}
