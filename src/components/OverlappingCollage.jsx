"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function JewelryOverlappingCollage() {
  return (
    <div className="bg-white">
      {/* First Section - Left text, Right image */}
      <section className="min-h-screen w-full relative">
        <Advantage />
      </section>

      {/* Second Section - Left image, Right text */}
      <section className="relative w-full min-h-screen">
        <Diversify />
      </section>
    </div>
  );
}

const Advantage = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        {
          scale: 1.3,
          y: -100,
        },
        {
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-[#f1efea] overflow-hidden h-screen">
      <div className="flex items-center h-full">
        {/* Left - Text */}
        <div className=" w-1/2 px-16 flex flex-col justify-center">
          <h2 className="text-6xl font-light mb-8">Advantage</h2>
          <div className="space-y-6 mb-8">
            <p className="text-lg leading-relaxed">
              A light-catching pendant made of marquise and round diamonds. The
              organic clustered shape features 11 white diamonds. Perfectly
              dainty to layer with other necklaces.
            </p>
          </div>
          <Link
            href="/collections/earrings"
            className=" flex items-center w-[20vw] justify-between gap-3 px-2 py-2 rounded-full bg-white text-black text-xs font-light uppercase tracking-wide transition-all duration-300 hover:bg-gray-100 group"
          >
            <div className="flex pl-[1vw] flex-col relative items-start justify-center w-fit overflow-hidden h-[1.2em]">
              <span className="font-medium transition-transform duration-300 group-hover:-translate-y-full">
                Shop Now
              </span>
              <span className="font-medium absolute top-full left-[1vw] transition-transform duration-300 group-hover:-translate-y-full">
                Shop Now
              </span>
            </div>

            <div className="size-[2vw] p-2 rounded-full  overflow-hidden bg-[#3b3b3b]">
              <span className="size-full  relative flex items-center justify-center">
                <div className="size-full -rotate-45  group-hover:translate-x-[150%] group-hover:translate-y-[-150%] transition-all duration-300 flex items-center justify-center">
                  <ArrowRight color="white" />
                </div>
                <div className="size-full -rotate-45 absolute top-0 duration-300 translate-x-[-150%] translate-y-[150%] left-0 flex items-center justify-center group-hover:translate-x-[0%] group-hover:translate-y-[0%]">
                  <ArrowRight color="white" />
                </div>
              </span>
            </div>
          </Link>
        </div>

        {/* Right - Image */}
        <div className="w-1/2 h-full overflow-hidden">
          <img
            ref={imageRef}
            className="object-cover w-full h-full"
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"
            alt="advantage image"
          />
        </div>
      </div>
    </section>
  );
};

const Diversify = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        {
          scale: 1.3,
          y: -100,
        },
        {
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-[#F2F2E9] overflow-hidden h-screen">
      <div className="flex items-center h-full">
        {/* Left - Image */}
        <div className="w-1/2 h-full overflow-hidden">
          <img
            ref={imageRef}
            className="object-cover w-full h-full"
            src="https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=800&q=80"
            alt="diversify image"
          />
        </div>

        {/* Right - Text */}
        <div className="text-gray-900 w-1/2 px-16 flex flex-col justify-center">
          <h3 className="text-6xl font-light mb-8 leading-tight">Diversify</h3>
          <div className="space-y-6 mb-8">
            <p className="text-lg leading-relaxed">
              A light-catching pendant made of marquise and round diamonds. The
              organic clustered shape features 11 white diamonds. Perfectly
              dainty to layer with other necklaces.
            </p>
          </div>
          <Link
            href="/collections/earrings"
            className=" flex items-center w-[20vw] justify-between gap-3 px-2 py-2 rounded-full bg-white text-black text-xs font-light uppercase tracking-wide transition-all duration-300 hover:bg-gray-100 group"
          >
            <div className="flex pl-[1vw] flex-col relative items-start justify-center w-fit overflow-hidden h-[1.2em]">
              <span className="font-medium transition-transform duration-300 group-hover:-translate-y-full">
                Shop Now
              </span>
              <span className="font-medium absolute top-full left-[1vw] transition-transform duration-300 group-hover:-translate-y-full">
                Shop Now
              </span>
            </div>

            <div className="size-[2vw] p-2 rounded-full  overflow-hidden bg-[#3b3b3b]">
              <span className="size-full  relative flex items-center justify-center">
                <div className="size-full -rotate-45  group-hover:translate-x-[150%] group-hover:translate-y-[-150%] transition-all duration-300 flex items-center justify-center">
                  <ArrowRight color="white" />
                </div>
                <div className="size-full -rotate-45 absolute top-0 duration-300 translate-x-[-150%] translate-y-[150%] left-0 flex items-center justify-center group-hover:translate-x-[0%] group-hover:translate-y-[0%]">
                  <ArrowRight color="white" />
                </div>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
