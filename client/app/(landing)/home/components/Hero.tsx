"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Hero = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleRoute = () => {
    router.push("/login");
  };
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ebf5ff 0%, #c2e2ff 100%)",
      }}
    >
      {/* 🔥 SUBTLE GLOW ORBS (no bg override) */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-300/20 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* 🔹 Badge */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm bg-[#B0DAFF] text-[#004B8C] mx-auto max-w-xl rounded-md p-2 mb-4"
        >
          Built for transparent distribution
        </motion.p>

        {/* 🔥 Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
        >
          Invest Smarter in Crypto with{" "}
          <span className="text-[#0089FF]">Nexora</span>
        </motion.h1>

        {/* ✍️ Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Track markets, invest confidently, and grow your portfolio with
          real-time insights and a seamless experience.
        </motion.p>

        {/* 🚀 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleRoute}
            className="px-6 py-3 rounded-full bg-[#0089FF] text-white hover:bg-blue-400 transition shadow-lg cursor-pointer"
          >
            Get Started
          </button>

          <button
            onClick={() => setOpen(true)}
            className="px-6 py-3 rounded-full border cursor-pointer border-gray-300 text-gray-800 hover:bg-white/70 backdrop-blur transition"
          >
            Download Whitepaper
          </button>
        </motion.div>

        {/* 📊 DASHBOARD + FLOATING CARDS */}
        <div className="relative mt-20 flex justify-center">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className=" rounded-2xl p-6"
          >
            <Image src={"/10.png"} alt="Image" width={800} height={400} />
          </motion.div>

          {/* Floating Card Left */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="hidden md:block absolute -left-16 top-10 bg-white shadow-lg border border-gray-200 rounded-xl p-4 text-sm"
          >
            <p className="text-gray-500">Profit</p>
            <p className="text-green-500 font-semibold">+12.4%</p>
          </motion.div>

          {/* Floating Card Right */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="hidden md:block absolute -right-16 bottom-10 bg-white shadow-lg border border-gray-200 rounded-xl p-4 text-sm"
          >
            <p className="text-gray-500">Top Asset</p>
            <p className="font-semibold text-slate-500">$NEX</p>
          </motion.div>
        </div>
      </div>

      {/* 📄 Whitepaper Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Nexora Whitepaper
            </h2>

            <p className="text-gray-600 mt-3 text-sm">
              Learn how Nexora is redefining crypto investing with smart,
              transparent infrastructure.
            </p>

            <input
              type="email"
              placeholder="Enter your email (optional)"
              className="mt-5 w-full px-4 py-2 border rounded-lg text-sm outline-none"
            />

            <button className="mt-4 cursor-pointer w-full py-2 rounded-full bg-[#0089FF] text-white hover:bg-blue-400 transition">
              Download PDF
            </button>

            <button
              onClick={() => setOpen(false)}
              className="mt-3 cursor-pointer text-sm bg-[#E6F3FF] text-[#004B8C] w-full py-2 px-2 rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
