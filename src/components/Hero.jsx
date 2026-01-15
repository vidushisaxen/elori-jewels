"use client";

import Link from "next/link";
import PrimaryButton from "./Buttons/PrimaryButton";

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
        <h1 className="text-9xl  font-medium!  uppercase">
          EAR ALCHEMY
        </h1>

        <p className="text-md tracking-widest opacity-80  uppercase font-light">
          Your Signature Ear Starts Here
        </p>

        <PrimaryButton text={"Shop Now"} href={"/products"} border={false}/>
      </div>
    </section>
  );
}
