"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/assets/videos/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay (to make text readable) */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Center Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white gap-4 px-4 text-center">
        <h1 className="text-9xl  font-medium! font-bold uppercase">
          EAR ALCHEMY
        </h1>

        <p className="text-md tracking-widest opacity-80  uppercase font-light">
          Your Signature Ear Starts Here
        </p>

        <Link
          href="/collections/earrings" 
          className="mt-8 flex items-center w-[20vw] justify-between gap-3 px-2 py-2 rounded-full bg-white text-black text-xs font-light uppercase tracking-wide transition-all duration-300 hover:bg-gray-100 group"
        >
          <div className="flex pl-[1vw] flex-col relative items-start justify-center w-fit overflow-hidden h-[1.2em]">
            <span className="font-medium transition-transform duration-300 group-hover:-translate-y-full">Shop Now</span>
            <span className="font-medium absolute top-full left-[1vw] transition-transform duration-300 group-hover:-translate-y-full">Shop Now</span>
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
    </section>
  );
}
