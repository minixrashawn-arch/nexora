"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

type StatProps = {
  label: string;
  value: number;
  suffix?: string;
};

const StatCard = ({ label, value, suffix = "" }: StatProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (val) =>
    Math.floor(val).toLocaleString(),
  );

  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [inView, spring, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/70 backdrop-blur-md rounded-2xl p-6 text-center shadow-sm"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
        <motion.span>{display}</motion.span>
        {suffix}
      </h2>
      <p className="text-gray-600 mt-2 text-sm md:text-base">{label}</p>
    </motion.div>
  );
};

const StatsSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-gray-900"
        >
          Trusted by Investors Worldwide
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 mt-3"
        >
          Real-time growth, real adoption, real impact.
        </motion.p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <StatCard label="Active Users" value={52000} suffix="+" />
          <StatCard label="Assets Tracked" value={12000000} suffix="+" />
          <StatCard label="Transactions" value={240000} suffix="+" />
          <StatCard label="Uptime Reliability" value={99} suffix="%" />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
