"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Nexora?",
    answer:
      "Nexora is a crypto investment platform that helps users track, manage, and grow their digital assets with real-time insights.",
  },
  {
    question: "Is Nexora secure?",
    answer:
      "Yes, Nexora is built with a security-first architecture to ensure user funds and data remain protected.",
  },
  {
    question: "When is the token launch (TGE)?",
    answer:
      "The Nexora Token Generation Event (TGE) is coming soon. Stay tuned for official announcements.",
  },
  {
    question: "How can I buy Nexora tokens?",
    answer:
      "You can purchase Nexora by creating account, buying with usdc, usdc and btc",
  },
  {
    question: "Is there a minimum investment?",
    answer:
      "No strict minimum, but transaction fees may apply depending on the network.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 mt-4">
            Everything you need to know about Nexora.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-12"
        >
          <Accordion className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl px-4 bg-white/70 backdrop-blur-md"
              >
                <AccordionTrigger className="text-left text-gray-900 font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-sm pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
