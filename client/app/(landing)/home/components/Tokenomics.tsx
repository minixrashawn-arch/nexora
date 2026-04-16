"use client";

import { motion } from "framer-motion";

const allocations = [
  { label: "Community & Rewards", value: 40 },
  { label: "Liquidity", value: 20 },
  { label: "Team", value: 15 },
  { label: "Ecosystem Growth", value: 15 },
  { label: "Marketing", value: 10 },
];

const Tokenomics = () => {
  return (
    <section id="tokenomics" className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Nexora Tokenomics
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mt-4"
          >
            A transparent and sustainable token distribution designed for
            long-term growth.
          </motion.p>

          {/* Token Details */}
          <div className="mt-6 space-y-2 text-gray-700">
            <p>
              <strong>Token Name:</strong> Nexora Token
            </p>
            <p>
              <strong>Symbol:</strong> NXR
            </p>
            <p>
              <strong>Total Supply:</strong> 1,000,000,000
            </p>
            <p>
              <strong>Network:</strong> BTC, USDT, USDC
            </p>
          </div>
        </div>

        {/* Right Allocation Bars */}
        <div className="space-y-4">
          {allocations.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{item.label}</span>
                <span className="text-gray-500">{item.value}%</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.value}%` }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className="h-2 rounded-full bg-[#0089FF]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tokenomics;
