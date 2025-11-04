"use client";

import { motion } from "framer-motion";
import jsPDF from "jspdf";

export default function PlanDisplay({ plan }) {
  if (!plan) return null;

  // 🗣️ Read plan aloud
  const handleReadPlan = () => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support Text-to-Speech.");
      return;
    }

    const text = `
      ${plan.summary}.
      Workouts include: ${plan.workouts
        .map(
          (w) =>
            `${w.name}, ${w.sets} sets of ${w.reps} reps with ${w.rest} rest`
        )
        .join(". ")}.
      Meals include: ${plan.meals
        .map((m) => `${m.meal}: ${m.items}`)
        .join(". ")}.
    `;

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  // ⏹ Stop reading
  const handleStopReading = () => {
    window.speechSynthesis.cancel();
  };

  // 📄 Export as PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Personalized Fitness Plan", 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(plan.summary, 10, y);
    y += 20;

    doc.setFontSize(14);
    doc.text("🏋️ Workouts:", 10, y);
    y += 10;
    doc.setFontSize(12);

    plan.workouts.forEach((w, i) => {
      doc.text(
        `${i + 1}. ${w.name} — ${w.sets} sets × ${w.reps} reps (${w.rest} rest)`,
        10,
        y
      );
      y += 8;
    });

    y += 10;
    doc.setFontSize(14);
    doc.text("🍎 Diet:", 10, y);
    y += 10;
    doc.setFontSize(12);

    plan.meals.forEach((m, i) => {
      doc.text(`${m.meal}: ${m.items}`, 10, y);
      y += 8;
    });

    doc.save(`Fitness_Plan_${plan.name || "User"}.pdf`);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-2xl p-8 mt-10 max-w-3xl mx-auto text-gray-800"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h2 className="text-3xl font-bold mb-4 text-center text-indigo-700">
        Personalized Plan
      </h2>

      <p className="mb-6 text-lg leading-relaxed">{plan.summary}</p>

      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-3 text-blue-700">🏋️ Workout</h3>
        <ul className="list-disc ml-6 space-y-2">
          {plan.workouts.map((w, i) => (
            <li key={i}>
              <strong>{w.name}</strong> — {w.sets} sets × {w.reps} reps (
              {w.rest} rest)
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-3 text-green-700">🍎 Diet</h3>
        <ul className="list-disc ml-6 space-y-2">
          {plan.meals.map((m, i) => (
            <li key={i}>
              <strong>{m.meal}</strong> — {m.items}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleReadPlan}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          🔊 Read My Plan
        </button>
        <button
          onClick={handleStopReading}
          className="bg-gray-600 text-white px-5 py-2 rounded-lg shadow hover:bg-gray-700 transition"
        >
          ⏹ Stop Reading
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          ⬇ Export PDF
        </button>
      </div>
    </motion.div>
  );
}
