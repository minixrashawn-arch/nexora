"use client";

import { motion } from "framer-motion";
import {
  Shield,
  LineChart,
  Wallet,
  Zap,
  TrendingUp,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Real-Time Market Data",
    desc: "Stay ahead with accurate and up-to-date crypto market insights.",
  },
  {
    icon: Shield,
    title: "Secure Infrastructure",
    desc: "Built with security-first architecture to protect your assets.",
  },
  {
    icon: Zap,
    title: "Automated Insights",
    desc: "Get intelligent suggestions to optimize your investments.",
  },
  {
    icon: Layers,
    title: "Seamless Experience",
    desc: "Clean, intuitive interface for beginners and pros.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-gray-900"
        >
          Powerful Tools for Smarter Crypto Investing
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 mt-4 max-w-2xl mx-auto"
        >
          Nexora provides everything you need to track, manage, and grow your
          digital assets with confidence.
        </motion.p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-14">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white/60 backdrop-blur-md rounded-2xl p-6 text-left transition hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#B0DAFF] text-[#0089FF] mb-4 group-hover:scale-110 transition">
                  <Icon size={20} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mt-2">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
