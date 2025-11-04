"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";

interface Workout {
  name: string;
  sets: number;
  reps: number;
  rest: string;
}

interface Meal {
  meal: string;
  items: string[];
}

interface Plan {
  name?: string;
  summary: string;
  workouts: Workout[];
  meals: Meal[];
}

export default function UserForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    gender: "",
    goal: "",
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  let utterance: SpeechSynthesisUtterance | null = null;

  // 🧠 Load saved plan when the app starts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlan = localStorage.getItem("fitnessPlan");
      if (savedPlan) {
        try {
          setPlan(JSON.parse(savedPlan));
        } catch (err) {
          console.error("Failed to load saved plan:", err);
        }
      }
    }
  }, []);

  // 💾 Save plan when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && plan) {
      try {
        localStorage.setItem("fitnessPlan", JSON.stringify(plan));
      } catch (err) {
        console.error("Failed to save plan:", err);
      }
    }
  }, [plan]);

  // Handle input
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Read plan aloud
  const handleReadPlan = () => {
    if (!plan) return;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const text = `${plan.summary}. Workouts include ${plan.workouts
      .map((w) => `${w.name}, ${w.sets} sets of ${w.reps} reps`)
      .join(", ")}. Meals include ${plan.meals
      .map((m) => `${m.meal}: ${m.items.join(", ")}`)
      .join(", ")}.`;

    utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const handleStopReading = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Export PDF
  const handleDownloadPDF = async () => {
    if (!plan) {
      alert("No plan available to export!");
      return;
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    let y = 20;
    const lineHeight = 8;
    const maxWidth = 180;
    const pageHeight = 297;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Personalized Fitness Plan", 10, y);
    y += 10;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${plan.name || "User"}`, 10, y);
    y += 10;

    const splitSummary = doc.splitTextToSize(plan.summary, maxWidth);
    doc.text(splitSummary, 10, y);
    y += splitSummary.length * 7 + 10;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Workouts:", 10, y);
    y += 10;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    plan.workouts.forEach((w: any) => {
      const text = `• ${w.name} — ${w.sets} sets × ${w.reps} reps (${w.rest} rest)`;
      const splitText = doc.splitTextToSize(text, maxWidth);

      if (y + splitText.length * lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(splitText, 10, y);
      y += splitText.length * lineHeight;
    });

    y += 10;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Meals:", 10, y);
    y += 10;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    plan.meals.forEach((m: any) => {
      const text = `• ${m.meal} — ${m.items.join(", ")}`;
      const splitText = doc.splitTextToSize(text, maxWidth);

      if (y + splitText.length * lineHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.text(splitText, 10, y);
      y += splitText.length * lineHeight;
    });

    const filename = `${plan?.name?.trim() || "fitness"}_plan.pdf`;
    doc.save(filename);
  };

  // Generate AI image
  const handleGenerateImage = async (prompt: string) => {
    try {
      const res = await fetch("/api/imageGen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert("Failed to generate image");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("Image generation failed");
    }
  };

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.age || !form.goal) {
      alert("Please fill all fields!");
      return;
    }

    setLoading(true);
    setPlan(null);

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setPlan({
        ...data.plan,
        name: form.name,
      });
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Something went wrong! Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-3xl font-bold text-center text-blue-600">💪 AI Fitness Coach</h1>
        <h2 className="text-sm text-center text-gray-500 mb-4">
          Get your personalized workout & meal plan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none" />
          <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none" />
          <input type="number" name="height" placeholder="Height (cm)" value={form.height} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none" />
          <input type="number" name="weight" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none" />
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select name="goal" value={form.goal} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">Select Goal</option>
            <option value="muscle gain">Muscle Gain</option>
            <option value="fat loss">Fat Loss</option>
            <option value="general fitness">General Fitness</option>
          </select>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-60">
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </form>

        {plan && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h3 className="font-bold text-lg mb-2">💪 Personalized Plan</h3>
            <p className="text-sm mb-2">{plan.summary}</p>

            <h4 className="font-semibold mt-3">🏋️ Workout</h4>
            <ul className="space-y-2 text-sm">
              {plan.workouts?.map((w, i) => (
                <li key={i} className="flex justify-between items-center border-b pb-1">
                  <span>
                    {w.name} — {w.sets} sets × {w.reps} reps ({w.rest} rest)
                  </span>
                  <button onClick={() => handleGenerateImage(w.name)} className="text-blue-600 hover:underline text-xs">
                    🖼️ Image
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold mt-3">🍎 Diet</h4>
            <ul className="space-y-2 text-sm">
              {plan.meals?.map((m, i) => (
                <li key={i} className="flex justify-between items-center border-b pb-1">
                  <span>
                    {m.meal} — {m.items.join(", ")}
                  </span>
                  <button onClick={() => handleGenerateImage(`${m.meal} meal with ${m.items.join(", ")}`)} className="text-blue-600 hover:underline text-xs">
                    🖼️ Image
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 mt-4">
              {!isSpeaking ? (
                <button onClick={handleReadPlan} className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
                  🔊 Read My Plan
                </button>
              ) : (
                <button onClick={handleStopReading} className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition">
                  🛑 Stop Reading
                </button>
              )}

              <button onClick={handleDownloadPDF} className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition">
                ⬇ Export PDF
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("fitnessPlan");
                  setPlan(null);
                }}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
              >
                🗑️ Clear Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
