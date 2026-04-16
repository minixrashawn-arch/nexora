"use client";

import { motion } from "framer-motion";
import { Wallet, CreditCard, Link, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
  {
    icon: Wallet,
    title: "Create an Account",
    desc: "Create an Account with Nexora.",
  },
  {
    icon: CreditCard,
    title: "Buy NXR Token",
    desc: "Purchase NXR with BTC, USDT, USDC.",
  },
  {
    icon: Link,
    title: "Receive Tokens",
    desc: "Receive Tokens in your wallet dashboard",
  },
  {
    icon: Repeat,
    title: "See Live Metrics",
    desc: "See and Monitor the latest market rates for nexora.",
  },
];

const HowToBuy = () => {
  const router = useRouter();

  const handleRoute = () => {
    router.push("/login");
  };
  return (
    <section id="how-to-buy" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-gray-900"
        >
          How to Buy Nexora
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 mt-4 max-w-2xl mx-auto"
        >
          Follow these simple steps to purchase Nexora tokens and start your
          investment journey.
        </motion.p>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-14">
          {steps.map((step, i) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white/70 backdrop-blur-md  rounded-2xl p-6 text-center transition hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Icon */}
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-lg bg-[#B0DAFF] text-[#0089FF] mb-4 group-hover:scale-110 transition">
                  <Icon size={20} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mt-2">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <button
            onClick={handleRoute}
            className="px-6 py-3 rounded-full bg-[#0089FF] text-white hover:bg-blue-700 transition shadow-lg"
          >
            Buy Nexora Now
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowToBuy;
