require("dotenv").config();

// ── CHAT FUNCTION ───────────────────────────────────────────
const chat = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { message, expenses = [], budget = 0, userName } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Calculate totals
    const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const remaining = budget - total;

    // Category totals
    const catTotals = {};
    expenses.forEach((e) => {
      catTotals[e.category] =
        (catTotals[e.category] || 0) + parseFloat(e.amount || 0);
    });

    // Build prompt
    const prompt = `You are SpendWise AI, a friendly South African Rand personal finance assistant.
Budget: R${budget}
Total Spent: R${total.toFixed(2)}
Remaining: R${remaining.toFixed(2)}
Spending by category: ${
      Object.entries(catTotals)
        .map(([k, v]) => `${k}: R${v.toFixed(2)}`)
        .join(", ") || "No spending yet"
    }

Instructions:
- Use South African Rand only, always prefix amounts with R.
- Be concise: 2-4 sentences.
- Include each category and amount spent per category in your response.
- Answer using only the data provided here and the user's question.
- If the user asks where they are overspending, identify the highest spending category and give a saving suggestion.
- Do not invent or contradict any spending data.

User question: ${message}`;

    console.log("Calling Ollama (tinyllama)...");

    // Call Ollama API locally
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tinyllama",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}. Make sure Ollama is running on http://localhost:11434`,
      );
    }

    const data = await response.json();
    const reply = data.response?.trim();

    if (!reply) {
      throw new Error("No response from Ollama");
    }

    console.log("✅ Ollama reply:", reply);
    res.json({ reply });
  } catch (err) {
    console.error("🔥 FULL ERROR:", err.message || err);
    res.status(500).json({
      error: err.message || "Something went wrong",
    });
  }
};

// ── INSIGHTS (placeholder) ──────────────────────────────────
const getInsights = async (req, res) => {
  res.json([]);
};

// ✅ VERY IMPORTANT EXPORT (this fixes your crash)
module.exports = { getInsights, chat };
