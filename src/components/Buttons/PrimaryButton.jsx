import Link from 'next/link'
import React from 'react'
import { ArrowRight } from "lucide-react";


const PrimaryButton = ({href, text ,border}) => {
  return (
    <div>
        <Link
          href={href} 
          className={`mt-8 max-sm:mt-4 flex items-center min-w-[10vw] justify-between gap-3 px-2 py-2 rounded-full bg-white text-[#111111] text-xs font-light uppercase tracking-wide transition-all duration-300 hover:bg-[#111111] hover:text-white group ${border ? 'border border-black' : ' border-none'} `}
        >
          <div className="flex pl-[1vw] flex-col relative items-start justify-center w-fit overflow-hidden h-[1.2em]">
            <span className="font-medium transition-transform duration-300 group-hover:-translate-y-full">{text}</span>
            <span className="font-medium absolute top-full left-[1vw] transition-transform duration-300 group-hover:-translate-y-full">{text}</span>
          </div>

          <div className="size-[2vw] p-2 max-sm:size-[8vw] rounded-full  overflow-hidden bg-[#111111] group-hover:bg-white transition-all duration-300">
            <span className="size-full  relative flex items-center justify-center">
              <div className="size-full -rotate-45  group-hover:translate-x-[150%] group-hover:translate-y-[-150%] transition-all duration-300 flex items-center justify-center">
                <ArrowRight className="text-white group-hover:text-[#111111] transition-colors duration-300" />
              </div>
              <div className="size-full -rotate-45 absolute top-0 duration-300 translate-x-[-150%] translate-y-[150%] left-0 flex items-center justify-center group-hover:translate-x-[0%] group-hover:translate-y-[0%]">
                <ArrowRight className="text-white group-hover:text-[#111111] transition-colors duration-300" />
              </div>
            </span>
          </div>
        </Link>
    </div>
  )
}

export default PrimaryButton