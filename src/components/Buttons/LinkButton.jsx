import Link from 'next/link'
import React from 'react'

const LinkButton = ({href,text}) => {
  return (
    <>
    <div className="text-center mt-6 flex items-center justify-center ">
          <Link
            href={href}
            className="cursor-pointer! h-fit group space-y-1 relative w-fit"
          >
            <div className="uppercase overflow-hidden relative z-10 text-xs min-w-25 tracking-widest ">
              <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300 ">{text}</p>
              <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300 ">{text}</span>
            </div>
            <span className="w-full rounded-full relative block h-[1px] bg-transparent ">
              <span className="w-0 h-full bg-black absolute left-0 top-0 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </span>
          </Link>
        </div>
    </>
  )
}

export default LinkButton