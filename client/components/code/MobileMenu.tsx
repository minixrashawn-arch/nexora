"use client";

import { motion, AnimatePresence } from "framer-motion";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
};

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Markets", href: "#markets" },
  { label: "How it Works", href: "#how-it-works" },
];

const MobileMenu = ({ isOpen, onClose, onNavigate }: MobileMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 🔥 BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 h-screen z-40"
          />

          {/* 🔥 SIDEBAR */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed top-0 right-0 h-full w-[75%] max-w-sm z-50
             bg-[#B0DAFF] h-screen  backdrop-blur-xl
              p-6 flex flex-col gap-8"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Nexora</h2>
              <button
                onClick={onClose}
                className="text-black hover:text-slate-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex flex-col gap-6 mt-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    onNavigate(link.href); // scroll
                    onClose();
                  }}
                  className="text-lg cursor-pointer text-black hover:text-slate-700 transition text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Bottom CTA (optional but 🔥) */}
            <div className="mt-auto flex flex-col gap-4">
              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/login";
                }}
                className="w-full py-2 rounded-full bg-white text-black transition"
              >
                Login
              </button>

              <button
                onClick={() => {
                  onClose();
                  window.location.href = "/signup";
                }}
                className="w-full py-2 rounded-full bg-[#0089FF] hover:bg-blue-700 text-white transition"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
