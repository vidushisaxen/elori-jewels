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
        {/* Mobile: Contact Us and Brand Profile side by side */}
        <div className="md:hidden flex gap-10">
          {/* COLUMN 1 - Policies */}
          <div className="flex flex-col gap-3 text-xs uppercase tracking-widest flex-1">
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
          <div className="flex flex-col gap-3 text-xs uppercase tracking-widest flex-1">
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
        </div>

        {/* Desktop: COLUMN 1 - Policies */}
        <div className="hidden md:flex flex-col gap-3 text-xs uppercase tracking-widest">
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

        {/* Desktop: COLUMN 2 */}
        <div className="hidden md:flex flex-col gap-3 text-xs uppercase tracking-widest">
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
          <h4 className="font-semibold uppercase tracking-widest text-xs">
            About Elori Jewels
          </h4>
          <p className="text-sm opacity-80  leading-snug">
           Elori Jewels brings together timeless elegance and modern sophistication in every piece. Our curated collections celebrate individuality and craftsmanship, offering jewelry that resonates with your personal style and elevates every moment. 
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