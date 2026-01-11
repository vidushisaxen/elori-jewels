'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementBar() {
  const messages = [
    {
      text: "YOUR SIGNATURE EAR STARTS HERE | SHOP EARRINGS",
      link: "/collections/earrings"
    },
    {
      text: "EAR ALCHEMY PIERCING | BOOK APPOINTMENT",
      link: "/pages/piercing-ear-alchemy"
    },
    {
      text: "SHOP GARNET, JANUARY'S BIRTHSTONE",
      link: "/collections/birthstone-jewellery"
    }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#000000] text-white/90 py-2.5 overflow-hidden text-center relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <a 
            href={messages[index].link} 
            className="text-[0.8rem] font-calibre tracking-wide hover:text-primary transition-colors duration-300"
          >
            {messages[index].text}
          </a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}