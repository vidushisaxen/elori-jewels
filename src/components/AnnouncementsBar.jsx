'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementBar() {
  const messages = [
    {
      text: "FREE SHIPPING ON ORDERS OVER $100",
      link: "/collections/all"
    },
    {
      text: "15% OFF YOUR FIRST ORDER | USE CODE: WELCOME15",
      link: "/collections/all"
    },
    {
      text: "BUY 2 GET 1 FREE ON SELECTED ITEMS",
      link: "/collections/sale"
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
          <p
            // href={messages[index].link} 
            className="text-[0.8rem] font-calibre tracking-wide hover:text-primary transition-colors duration-300"
          >
            {messages[index].text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}