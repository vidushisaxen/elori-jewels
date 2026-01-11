'use client';

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

        <h1 className="text-7xl  font-extralight! font-heading! uppercase">
          EAR ALCHEMY
        </h1>

        <p className="text-md tracking-widest opacity-80 font-heading!">
          Your Signature Ear Starts Here
        </p>

        <Link href="/collections/earrings" className="pt-8">
          <div className="mt-4 px-5 py-4 text-xs font-light text-calibre uppercase tracking-wide bg-black/30 hover:bg-black transition-all duration-300">
            Shop Now
          </div>
        </Link>

      </div>

    </section>
  );
}
