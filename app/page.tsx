"use client";

import { motion } from "framer-motion";
import UserForm from "../components/UserForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-8 text-gray-900 text-center"
      >
        💪 AI Fitness Coach
      </motion.h1>

      {/* ✅ The entire logic (form + plan display) lives inside UserForm */}
      <UserForm />
    </div>
  );
}
