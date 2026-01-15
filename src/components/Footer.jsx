// components/Footer.jsx
import Link from "next/link";
import { getShopPolicies } from "../app/lib/shopify/policies";


const brandProfile = [
  {
    text:"Stores",
    link:"#"
  },
  {
    text:"Philanthropy",
    link:"#"
  },
  {
    text:"Recycling",
    link:"#"
  },
  {
    text:"Care Guide",
    link:"#"
  },
  {
    text:"Careers",
    link:"#"
  },

]
const social=[
  {
    text:"Instagram",
    link:"#"
  },
  {
    text:"Facebook",
    link:"#"
  },
  {
    text:"Pinterest",
    link:"#"
  },
]
export default async function Footer() {
  const policies = await getShopPolicies();

  return (
    <footer className="w-full bg-white text-black border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* COLUMN 1 - Policies */}
        <div className="flex flex-col gap-3 text-xs uppercase tracking-widest">
          <h4 className="font-semibold mb-2">Contact Us</h4>

          {policies.shippingPolicy && (
            <Link
              href={`/policies/${policies.shippingPolicy.handle}`}
              className="cursor-pointer h-fit group space-y-1 relative w-fit"
            >
              <div className="uppercase overflow-hidden relative z-10 text-xs tracking-widest">
                <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
                  Shipping
                </p>
                <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
                  Shipping
                </span>
              </div>
            </Link>
          )}
          {policies.refundPolicy && (
            <Link
              href={`/policies/${policies.refundPolicy.handle}`}
              className="cursor-pointer h-fit group space-y-1 relative w-fit"
            >
              <div className="uppercase overflow-hidden relative z-10 text-xs tracking-widest">
                <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
                  Returns & Refunds
                </p>
                <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
                  Returns & Refunds
                </span>
              </div>
            </Link>
          )}
          {policies.termsOfService && (
            <Link
              href={`/policies/${policies.termsOfService.handle}`}
              className="cursor-pointer h-fit group space-y-1 relative w-fit"
            >
              <div className="uppercase overflow-hidden relative z-10 text-xs tracking-widest">
                <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
                  Terms & Conditions
                </p>
                <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
                  Terms & Conditions
                </span>
              </div>
            </Link>
          )}
          {policies.privacyPolicy && (
            <Link
              href={`/policies/${policies.privacyPolicy.handle}`}
              className="cursor-pointer h-fit group space-y-1 relative w-fit"
            >
              <div className="uppercase overflow-hidden relative z-10 text-xs tracking-widest">
                <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
                  Privacy Policy
                </p>
                <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
                  Privacy Policy
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* COLUMN 2 */}
        <div className="flex flex-col gap-3 text-xs uppercase tracking-widest">
          <h4 className="font-semibold mb-2">Brand Profile</h4>

          {brandProfile.map((item,index)=>(
            
             <Link key={index}
            href={item.link}
            className="cursor-pointer h-fit group space-y-1 relative w-fit"
          >
            <div className="uppercase overflow-hidden relative z-10 text-xs tracking-widest">
              <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
                {item.text}
              </p>
              <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
               {item.text}
              </span>
            </div>
          </Link>
          ))}
        </div>

        {/* COLUMN 3 */}
        <div className="flex flex-col gap-3 text-xs uppercase tracking-widest">
          <h4 className="font-semibold mb-2">Social</h4>


          {social.map((item,index)=>(
            
             <Link key={index}
            href={item.link}
            className="cursor-pointer h-fit group space-y-1 relative w-fit"
          >
            <div className="uppercase overflow-hidden relative z-10 text-xs tracking-widest">
              <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
                {item.text}
              </p>
              <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
               {item.text}
              </span>
            </div>
          </Link>
          ))}
        </div>

        {/* COLUMN 4 – JOIN THE LIST */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-light uppercase tracking-[0.2em]">
            Join The List
          </h4>

          <p className="text-xs opacity-70 leading-relaxed">
            Receive updates on new arrivals, exclusive events, store openings,
            news and more.
          </p>

          <div className="group relative">
            <div className="flex items-end  pb-2 transition-colors duration-300 ">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent text-xs outline-none group-hover:placeholder:text-black placeholder:text-zinc-400 tracking-widest transition-colors duration-500 "
              />
              <span className="text-zinc-400 scale-70 transition-all rounded-full duration-500 size-2 bg-zinc-400 group-hover:bg-black group-hover:scale-100 "></span>
            </div>

            <span className="w-full rounded-full relative block h-[2px] bg-black/20 ">
              <span className="w-0 h-full bg-black absolute left-0 top-0 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </span>
          </div>

          {/* <NewsletterSignup/> */}

          <p className="text-sm opacity-80 mt-6 leading-snug">
            ELORI JEWELS is an ethically crafted conceptual fine jewellery
            studio. Explore ethically sourced natural diamonds and gemstones,
            bespoke engagement & bridal pieces and more. Shop online or visit us
            in-store.
          </p>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs border-t border-zinc-200 gap-4">
        <p className="uppercase tracking-widest opacity-70">© Elori Jewels</p>
      </div>
    </footer>
  );
}
