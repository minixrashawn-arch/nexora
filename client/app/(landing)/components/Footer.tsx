"use client";

import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-[#0B0F1A] text-gray-300 px-6 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-xl font-semibold text-white">Nexora</h2>
          <p className="mt-4 text-sm text-gray-400">
            Nexora is a modern crypto investment platform designed to simplify
            how users track, manage, and grow their digital assets.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-medium mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#home" className="hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-white">
                Features
              </a>
            </li>
            <li>
              <a href="#tokenomics" className="hover:text-white">
                Tokenomics
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white font-medium mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <button className="hover:text-white">Whitepaper</button>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Docs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Terms
              </a>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-white font-medium mb-4">Community</h3>
          <div className="flex gap-4"></div>
        </div>
      </div>

      {/* Bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-gray-500"
      >
        © {new Date().getFullYear()} Nexora. All rights reserved.
      </motion.div>
    </footer>
  );
};

export default Footer;
