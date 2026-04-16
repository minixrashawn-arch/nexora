"use client";

import { motion } from "framer-motion";

const items = [
  "Community First",
  "Web3 Utility",
  "Nexora Token",
  "TGE Coming Soon",
  "Secure Infrastructure",
  "Real-Time Insights",
];

const Ticker = () => {
  return (
    <div className="w-full overflow-hidden py-4 bg-white/40 backdrop-blur-md border-y border-gray-200">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
      >
        {/* 🔁 Duplicate content for seamless loop */}
        {[...items, ...items].map((text, i) => (
          <span
            key={i}
            className="text-sm md:text-base text-gray-700 font-medium tracking-wide"
          >
            {text} ✦
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Ticker;
