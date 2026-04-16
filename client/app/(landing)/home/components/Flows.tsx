"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Create an Account",
    desc: "Sign up and set up your secure Nexora account.",
  },
  {
    title: "Fund Your Wallet",
    desc: "Deposit crypto or connect your wallet seamlessly.",
  },
  {
    title: "Start Investing",
    desc: "Explore markets and invest in top-performing assets.",
  },
  {
    title: "Track & Grow",
    desc: "Monitor performance and grow your portfolio over time.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-gray-900"
        >
          Start Investing in Minutes
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 mt-4"
        >
          Get started with Nexora in just a few simple steps.
        </motion.p>

        {/* Steps */}
        <div className="relative mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white/70 backdrop-blur-md  rounded-2xl p-6 text-center shadow-sm hover:-translate-y-2 transition"
            >
              {/* Step Number */}
              <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-[#0089FF] text-white font-semibold mb-4">
                {i + 1}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mt-2">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
