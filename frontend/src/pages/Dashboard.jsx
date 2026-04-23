import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { expenseAPI } from "../api";

const CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: "🍜", color: "#22C55E" },
  { id: "transport", label: "Transport", icon: "🚌", color: "#60A5FA" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#F97316" },
  { id: "health", label: "Health", icon: "💊", color: "#A78BFA" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#FB923C" },
  { id: "utilities", label: "Utilities", icon: "💡", color: "#FBBF24" },
  { id: "other", label: "Other", icon: "📦", color: "#94A3B8" },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ── Donut Chart ──────────────────────────────────────────────
function DonutChart({ slices, total, small }) {
  const size = small ? 80 : 200;
  const cx = size / 2,
    cy = size / 2,
    r = small ? 28 : 72,
    sw = small ? 12 : 28;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const arcs = (slices?.length ? slices : [{ color: "#F1F5F9", pct: 100 }]).map(
    (s) => {
      const dash = (Math.max(s.pct, 0) / 100) * circ;
      const a = { ...s, dash, gap: circ - dash, off };
      off += dash;
      return a;
    },
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#F1F5F9"
        strokeWidth={sw}
      />
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={a.color}
          strokeWidth={sw}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={-a.off}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dasharray 0.6s ease",
          }}
        />
      ))}
      {!small && (
        <>
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fill="#1E293B"
            fontSize="15"
            fontWeight="800"
            fontFamily="'Darker Grotesque',sans-serif"
          >
            R
            {total >= 1000
              ? (total / 1000).toFixed(1) + "k"
              : (total || 0).toFixed(0)}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="9.5"
            fontFamily="'Plus Jakarta Sans',sans-serif"
          >
            total spent
          </text>
        </>
      )}
    </svg>
  );
}

// ── Spending Trend Chart ─────────────────────────────────────
function SpendingTrendChart({ expenses }) {
  const W = 560,
    H = 200,
    pad = { t: 20, r: 20, b: 40, l: 55 };
  const monthlyData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const m = e.date?.slice(0, 7);
      if (m) map[m] = (map[m] || 0) + parseFloat(e.amount);
    });
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { label: MONTHS[d.getMonth()], value: map[key] || 0 };
    });
  }, [expenses]);

  const maxVal = Math.max(...monthlyData.map((d) => d.value), 1);
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const barW = (chartW / monthlyData.length) * 0.45;

  const pts = monthlyData.map((d, i) => ({
    x: pad.l + (i + 0.5) * (chartW / monthlyData.length),
    y: pad.t + (1 - d.value / maxVal) * chartH,
    ...d,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");
  const fillPath = `${linePath} L ${pts[pts.length - 1].x},${pad.t + chartH} L ${pts[0].x},${pad.t + chartH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    y: pad.t + (1 - p) * chartH,
    label:
      maxVal > 1000
        ? `R${((maxVal * p) / 1000).toFixed(1)}k`
        : `R${(maxVal * p).toFixed(0)}`,
  }));

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.l}
            y1={t.y}
            x2={W - pad.r}
            y2={t.y}
            stroke="#F1F5F9"
            strokeWidth="1"
          />
          <text
            x={pad.l - 8}
            y={t.y + 4}
            textAnchor="end"
            fill="#CBD5E1"
            fontSize="9"
            fontFamily="'Plus Jakarta Sans',sans-serif"
          >
            {t.label}
          </text>
        </g>
      ))}
      {pts.map((p, i) => (
        <rect
          key={i}
          x={p.x - barW / 2}
          y={pad.t + chartH - (p.value / maxVal) * chartH}
          width={barW}
          height={(p.value / maxVal) * chartH}
          fill="#DCFCE7"
          rx="4"
        />
      ))}
      <path d={fillPath} fill="url(#trendGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#fff"
            stroke="#22C55E"
            strokeWidth="2"
          />
          <text
            x={p.x}
            y={H - pad.b + 16}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="10"
            fontFamily="'Plus Jakarta Sans',sans-serif"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Insights ─────────────────────────────────────────────────
function Insights({ expenses, budget }) {
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const remaining = Math.max(budget - total, 0);
  const catTotals = {};
  expenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount);
  });

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const thisMCats = {},
    lastMCats = {};
  expenses.forEach((e) => {
    if (e.date?.startsWith(thisMonth))
      thisMCats[e.category] =
        (thisMCats[e.category] || 0) + parseFloat(e.amount);
    if (e.date?.startsWith(lastMonth))
      lastMCats[e.category] =
        (lastMCats[e.category] || 0) + parseFloat(e.amount);
  });

  const insights = [];

  if (remaining > budget * 0.4) {
    insights.push({
      icon: "💰",
      color: "#16A34A",
      bg: "#F0FDF4",
      border: "#DCFCE7",
      title: `You have R${remaining.toFixed(2)} spare`,
      desc: `You've only used ${((total / budget) * 100).toFixed(0)}% of your budget. Consider saving R${(remaining * 0.5).toFixed(2)} or investing it this month.`,
    });
  } else if (remaining < budget * 0.1 && expenses.length > 0) {
    insights.push({
      icon: "⚠️",
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
      title: "Budget almost exhausted!",
      desc: `Only R${remaining.toFixed(2)} left. Avoid non-essential spending for the rest of the month.`,
    });
  }

  Object.entries(thisMCats).forEach(([cat, amt]) => {
    const last = lastMCats[cat] || 0;
    if (last > 0 && ((amt - last) / last) * 100 > 20) {
      const catLabel = CATEGORIES.find((c) => c.id === cat)?.label || cat;
      const pct = (((amt - last) / last) * 100).toFixed(0);
      insights.push({
        icon: CATEGORIES.find((c) => c.id === cat)?.icon || "📊",
        color: "#EA580C",
        bg: "#FFF7ED",
        border: "#FED7AA",
        title: `${pct}% more on ${catLabel}`,
        desc: `R${amt.toFixed(2)} this month vs R${last.toFixed(2)} last month. Try to cut back here.`,
      });
    }
  });

  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCat && total > 0) {
    const cat = CATEGORIES.find((c) => c.id === topCat[0]);
    const pct = ((topCat[1] / total) * 100).toFixed(0);
    const count = expenses.filter((e) => e.category === topCat[0]).length;
    insights.push({
      icon: cat?.icon || "📊",
      color: "#7C3AED",
      bg: "#F5F3FF",
      border: "#DDD6FE",
      title: `${cat?.label} is your top spend`,
      desc: `${pct}% of spending — R${topCat[1].toFixed(2)} across ${count} transactions this month.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: "✅",
      color: "#16A34A",
      bg: "#F0FDF4",
      border: "#DCFCE7",
      title: "Add transactions to see insights",
      desc: "Once you log your spending, we'll give you personalized money tips here.",
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {insights.slice(0, 3).map((ins, i) => (
        <div
          key={i}
          style={{
            background: ins.bg,
            borderRadius: "12px",
            padding: "0.85rem 1rem",
            border: `1px solid ${ins.border}`,
            animation: "fadeUp 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.65rem",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "1px" }}
            >
              {ins.icon}
            </span>
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: ins.color,
                  marginBottom: "0.2rem",
                  fontFamily: "'Darker Grotesque',sans-serif",
                }}
              >
                {ins.title}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#64748B",
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                {ins.desc}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI Chat ──────────────────────────────────────────────────
function AIAdvisor({ expenses, budget, user, aiOpen, setAiOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const remaining = Math.max(budget - total, 0);
  const catTotals = {};
  expenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount);
  });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCatName = topCat
    ? CATEGORIES.find((c) => c.id === topCat[0])?.label
    : "None";

  const systemPrompt = `You are SpendWise AI, a friendly personal finance assistant inside the SpendWise app.
User: ${user?.name} | Budget: R${budget} | Spent: R${total.toFixed(2)} | Remaining: R${remaining.toFixed(2)} | Budget used: ${Math.min((total / budget) * 100, 100).toFixed(1)}%
Top category: ${topCatName} (R${topCat?.[1]?.toFixed(2) || 0})
Breakdown: ${Object.entries(catTotals)
    .map(([k, v]) => `${k}: R${v.toFixed(2)}`)
    .join(", ")}
Transactions: ${expenses.length} | Recent: ${expenses
    .slice(0, 5)
    .map((e) => `${e.description} R${parseFloat(e.amount).toFixed(2)}`)
    .join(", ")}
Rules: Give personalized advice based ONLY on this data. Use South African Rand (R). Be concise (2-4 sentences). Tell user when they have spare money or are overspending. Never make up data.`;

  useEffect(() => {
    if (aiOpen && messages.length === 0) {
      const pct = Math.min((total / budget) * 100, 100).toFixed(1);
      const name = user?.name?.split(" ")[0];
      let greeting;
      if (remaining > budget * 0.5)
        greeting = `Hey ${name} 👋 Great news — you've only used ${pct}% of your budget! You have **R${remaining.toFixed(2)}** spare. Consider saving at least half of that. Ask me anything!`;
      else if (remaining < budget * 0.1 && expenses.length > 0)
        greeting = `Hey ${name} 👋 Heads up — you've used ${pct}% of your budget and only **R${remaining.toFixed(2)}** remains. Your biggest spend is **${topCatName}**. Want tips to cut back?`;
      else
        greeting = `Hey ${name} 👋 You've used ${pct}% of your budget with **R${remaining.toFixed(2)}** left. Your top spending is **${topCatName}**. Want saving tips or a spending breakdown?`;
      setMessages([{ role: "assistant", text: greeting }]);
    }
  }, [aiOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token being sent:", token);
      const aiRes = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMsg,
            expenses,
            budget,
            userName: user?.name,
          }),
        },
      );
      const data = await aiRes.json();
      const reply = data.reply || "Sorry, I couldn't respond. Try again!";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Connection error. Please try again." },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setAiOpen((o) => !o)}
        title="AI Finance Advisor"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#22C55E,#16A34A)",
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(34,197,94,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          transition: "transform 0.2s",
        }}
      >
        {aiOpen ? "✕" : "🤖"}
      </button>

      {aiOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "5.5rem",
            right: "1.5rem",
            width: "340px",
            height: "min(490px, calc(100vh - 8rem))",
            maxHeight: "calc(100vh - 8rem)",
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            border: "1.5px solid #DCFCE7",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#22C55E,#16A34A)",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
              }}
            >
              🤖
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  fontFamily: "'Darker Grotesque',sans-serif",
                }}
              >
                SpendWise AI
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                }}
              >
                Your personal finance advisor
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "84%",
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg,#22C55E,#16A34A)"
                        : "#F0FDF4",
                    color: m.role === "user" ? "#fff" : "#1E293B",
                    borderRadius:
                      m.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    padding: "0.65rem 0.9rem",
                    fontSize: "0.78rem",
                    lineHeight: 1.6,
                    fontWeight: 500,
                    border:
                      m.role === "assistant" ? "1px solid #DCFCE7" : "none",
                  }}
                >
                  {m.text
                    .split("**")
                    .map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
                    )}
                </div>
              </div>
            ))}
            {loading && (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  padding: "0.6rem 0.85rem",
                  background: "#F0FDF4",
                  borderRadius: "16px 16px 16px 4px",
                  width: "fit-content",
                  border: "1px solid #DCFCE7",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#22C55E",
                      animation: `bounce 1s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div
              style={{
                padding: "0 1rem 0.5rem",
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
              }}
            >
              {[
                "How can I save?",
                "Where am I overspending?",
                "Do I have spare money?",
                "Analyse my spending",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  style={{
                    background: "#F0FDF4",
                    border: "1px solid #DCFCE7",
                    borderRadius: "999px",
                    padding: "0.25rem 0.65rem",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: "#16A34A",
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid #F0FDF4",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about your finances..."
              style={{
                flex: 1,
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "10px",
                padding: "0.55rem 0.8rem",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontSize: "0.78rem",
                color: "#1E293B",
                outline: "none",
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg,#22C55E,#16A34A)",
                border: "none",
                borderRadius: "10px",
                width: "38px",
                cursor: "pointer",
                color: "#fff",
                fontSize: "0.9rem",
                opacity: loading ? 0.5 : 1,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </>
  );
}

// ── Add Modal ────────────────────────────────────────────────
function AddModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    desc: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().slice(0, 10),
  });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  const submit = async () => {
    if (!form.desc.trim()) return setFormError("Please enter a description.");
    if (!form.amount || +form.amount <= 0)
      return setFormError("Please enter a valid amount.");
    setFormError("");
    setAdding(true);
    await onAdd(form);
    setAdding(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 500,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "2rem",
          width: "420px",
          maxWidth: "95vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          animation: "fadeUp 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "'Darker Grotesque',sans-serif",
              fontSize: "1.3rem",
              fontWeight: 900,
              color: "#1E293B",
            }}
          >
            Add Transaction
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "none",
              borderRadius: "8px",
              padding: "0.3rem 0.65rem",
              cursor: "pointer",
              color: "#64748B",
              fontSize: "0.85rem",
            }}
          >
            ✕
          </button>
        </div>
        {[
          {
            label: "Description",
            key: "desc",
            type: "text",
            placeholder: "e.g. Grocery Store",
          },
          {
            label: "Amount (R)",
            key: "amount",
            type: "number",
            placeholder: "0.00",
          },
          { label: "Date", key: "date", type: "date", placeholder: "" },
        ].map((f) => (
          <div key={f.key} style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.35rem",
              }}
            >
              {f.label}
            </label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) =>
                setForm((p) => ({ ...p, [f.key]: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={{
                width: "100%",
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "10px",
                padding: "0.65rem 0.9rem",
                fontSize: "0.85rem",
                color: "#1E293B",
                outline: "none",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
          </div>
        ))}
        <div style={{ marginBottom: "1.25rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.35rem",
            }}
          >
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
            style={{
              width: "100%",
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "10px",
              padding: "0.65rem 0.9rem",
              fontSize: "0.85rem",
              color: "#1E293B",
              outline: "none",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>
        {formError && (
          <div
            style={{
              color: "#EF4444",
              fontSize: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            {formError}
          </div>
        )}
        <button
          onClick={submit}
          disabled={adding}
          style={{
            width: "100%",
            background: "linear-gradient(135deg,#22C55E,#16A34A)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "0.8rem",
            fontFamily: "'Darker Grotesque',sans-serif",
            fontWeight: 900,
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
            opacity: adding ? 0.6 : 1,
          }}
        >
          {adding ? "Adding..." : "+ Add Transaction"}
        </button>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Darker+Grotesque:wght@400;500;600;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F1F5F9; margin: 0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .db { min-height: 100vh; background: #F1F5F9; font-family: 'Plus Jakarta Sans', sans-serif; color: #1E293B; }

  .db-nav { background:#fff; border-bottom:1.5px solid #E2E8F0; padding:0 2rem; height:66px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow:0 1px 6px rgba(0,0,0,0.05); }
  .db-logo { display:flex; align-items:center; gap:0.6rem; font-family:'Darker Grotesque',sans-serif; font-size:1.35rem; font-weight:900; color:#1E293B; letter-spacing:-0.03em; }
  .db-logo-icon { width:36px; height:36px; background:linear-gradient(135deg,#22C55E,#16A34A); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; box-shadow:0 2px 8px rgba(34,197,94,0.3); }
  .db-search-wrap { display:flex; align-items:center; gap:0.5rem; background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:12px; padding:0.5rem 1rem; width:300px; transition:border-color 0.2s; }
  .db-search-wrap:focus-within { border-color:#22C55E; }
  .db-search-wrap input { background:none; border:none; outline:none; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.83rem; color:#1E293B; width:100%; }
  .db-search-wrap input::placeholder { color:#94A3B8; }
  .db-icon-btn { background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:10px; padding:0.4rem 0.65rem; cursor:pointer; color:#64748B; font-size:1rem; transition:all 0.15s; }
  .db-icon-btn:hover { background:#F0FDF4; border-color:#22C55E; }
  .db-avatar { width:36px; height:36px; background:linear-gradient(135deg,#22C55E,#16A34A); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:0.85rem; box-shadow:0 2px 8px rgba(34,197,94,0.25); }
  .db-logout { background:none; border:1.5px solid #E2E8F0; border-radius:8px; padding:0.35rem 0.8rem; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.72rem; font-weight:600; color:#94A3B8; cursor:pointer; transition:all 0.2s; }
  .db-logout:hover { border-color:#FCA5A5; color:#EF4444; }

  .db-main { max-width:1300px; margin:0 auto; padding:2rem; }

  .db-welcome { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.75rem; }
  .db-welcome h2 { font-family:'Darker Grotesque',sans-serif; font-size:1.8rem; font-weight:900; letter-spacing:-0.03em; }
  .db-welcome p { font-size:0.82rem; color:#94A3B8; margin-top:0.2rem; font-weight:500; }
  .db-add-btn { background:linear-gradient(135deg,#22C55E,#16A34A); color:#fff; border:none; border-radius:12px; padding:0.72rem 1.3rem; font-family:'Darker Grotesque',sans-serif; font-weight:900; font-size:0.98rem; cursor:pointer; box-shadow:0 4px 14px rgba(34,197,94,0.3); transition:all 0.2s; white-space:nowrap; }
  .db-add-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(34,197,94,0.4); }

  .db-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
  .db-stat { background:#fff; border-radius:16px; padding:1.3rem 1.4rem; border:1.5px solid #E2E8F0; transition:all 0.2s; }
  .db-stat:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.07); }
  .db-stat-top { display:flex; justify-content:space-between; align-items:flex-start; }
  .db-stat-label { font-size:0.7rem; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:0.45rem; }
  .db-stat-val { font-family:'Darker Grotesque',sans-serif; font-size:1.9rem; font-weight:900; letter-spacing:-0.04em; color:#1E293B; line-height:1.1; margin-bottom:0.35rem; }
  .db-stat-val.red { color:#EF4444; }
  .db-stat-val.green { color:#22C55E; }
  .db-stat-badge { display:inline-flex; align-items:center; gap:0.2rem; padding:0.18rem 0.5rem; border-radius:999px; font-size:0.68rem; font-weight:700; }
  .db-stat-badge.up { background:#DCFCE7; color:#16A34A; }
  .db-stat-badge.dn { background:#FEE2E2; color:#EF4444; }
  .db-stat-icon { width:50px; height:50px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0; }

  .db-mid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; }
  .db-card { background:#fff; border-radius:16px; padding:1.5rem; border:1.5px solid #E2E8F0; }
  .db-card-hd { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
  .db-card-title { font-family:'Darker Grotesque',sans-serif; font-size:1.05rem; font-weight:900; letter-spacing:-0.02em; color:#1E293B; }

  .db-bottom { display:grid; grid-template-columns:1fr 320px; gap:1rem; }

  .db-export-btn { background:#F0FDF4; border:1.5px solid #DCFCE7; border-radius:8px; padding:0.35rem 0.85rem; font-size:0.75rem; font-weight:700; color:#16A34A; cursor:pointer; transition:all 0.15s; }
  .db-export-btn:hover { background:#DCFCE7; }

  .db-filter-row { display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap; }
  .db-filter-pill { background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:8px; padding:0.35rem 0.8rem; font-size:0.75rem; font-weight:600; color:#64748B; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.15s; }
  .db-filter-pill:hover { border-color:#22C55E; color:#22C55E; }

  .db-table { width:100%; border-collapse:collapse; }
  .db-table th { text-align:left; font-size:0.67rem; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.08em; padding:0.5rem 0.75rem; border-bottom:1.5px solid #F1F5F9; }
  .db-table td { padding:0.75rem; border-bottom:1px solid #F8FAFC; font-size:0.82rem; vertical-align:middle; }
  .db-table tr:hover td { background:#F8FAFC; }
  .db-table tr:last-child td { border-bottom:none; }
  .db-tx-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0; }
  .db-tx-name { font-weight:600; color:#1E293B; }
  .db-cat-pill { display:inline-flex; align-items:center; gap:0.25rem; padding:0.2rem 0.6rem; border-radius:999px; font-size:0.68rem; font-weight:700; }
  .db-tx-amt { font-family:'Darker Grotesque',sans-serif; font-weight:700; font-size:0.92rem; color:#EF4444; }
  .db-del-btn { background:none; border:none; color:#E2E8F0; cursor:pointer; padding:0.2rem 0.4rem; border-radius:6px; transition:all 0.15s; font-size:0.8rem; }
  .db-del-btn:hover { background:#FEE2E2; color:#EF4444; }

  .db-budget-bar { height:8px; background:#F1F5F9; border-radius:999px; overflow:hidden; margin:0.35rem 0; }
  .db-budget-bar-fill { height:100%; border-radius:999px; transition:width 0.5s ease; }

  @media(max-width:1100px){ .db-bottom{grid-template-columns:1fr;} }
  @media(max-width:900px){ .db-mid{grid-template-columns:1fr;} }
  @media(max-width:768px){ .db-stats{grid-template-columns:repeat(2,1fr);} .db-main{padding:1rem;} .db-search-wrap{display:none;} }
  @media(max-width:480px){ .db-stats{grid-template-columns:1fr;} }
`;

// ── Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, updateBudget } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [budgetInput, setBudgetInput] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [txPage, setTxPage] = useState(1);
  const TX_PER_PAGE = 10;

  useEffect(() => {
    expenseAPI
      .getAll()
      .then((data) => {
        if (Array.isArray(data)) setExpenses(data);
      })
      .catch(() => setLoadError("Failed to load transactions. Please refresh."))
      .finally(() => setLoadingData(false));
  }, []);

  const budget = user?.budget || 1000;
  const total = useMemo(
    () => expenses.reduce((s, e) => s + parseFloat(e.amount), 0),
    [expenses],
  );
  const remaining = Math.max(budget - total, 0);
  const budgetPct = Math.min((total / budget) * 100, 100);

  const catTotals = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + parseFloat(e.amount);
    });
    return map;
  }, [expenses]);

  const donutSlices = useMemo(
    () =>
      CATEGORIES.filter((c) => catTotals[c.id]).map((c) => ({
        color: c.color,
        label: c.label,
        value: catTotals[c.id],
        pct: total > 0 ? (catTotals[c.id] / total) * 100 : 0,
      })),
    [catTotals, total],
  );

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthCount = expenses.filter((e) =>
    e.date?.startsWith(thisMonth),
  ).length;
  const lastMonthCount = expenses.filter((e) =>
    e.date?.startsWith(lastMonth),
  ).length;
  const countUp = thisMonthCount >= lastMonthCount;

  const filtered = useMemo(
    () =>
      expenses.filter((e) => {
        const ms = e.description?.toLowerCase().includes(search.toLowerCase());
        const mc = catFilter === "all" || e.category === catFilter;
        return ms && mc;
      }),
    [expenses, search, catFilter],
  );

  useEffect(() => setTxPage(1), [search, catFilter]);

  const addExpense = async (form) => {
    const data = await expenseAPI.add({
      description: form.desc,
      amount: +form.amount,
      category: form.category,
      date: form.date,
    });
    if (data.id) setExpenses((prev) => [data, ...prev]);
  };

  const del = async (id) => {
    if (!window.confirm("Delete this transaction? This cannot be undone."))
      return;
    await expenseAPI.delete(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const saveBudget = async () => {
    if (!budgetInput || +budgetInput <= 0) return;
    const data = await expenseAPI.updateBudget(+budgetInput);
    if (data.budget) {
      updateBudget(data.budget);
      setEditingBudget(false);
      setBudgetInput("");
    }
  };

  const exportCSV = () => {
    const rows = [
      "Description,Category,Date,Amount",
      ...expenses.map(
        (e) =>
          `"${e.description}","${e.category}",${e.date?.slice(0, 10)},${parseFloat(e.amount).toFixed(2)}`,
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    a.download = "spendwise.csv";
    a.click();
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  const firstName = user?.name?.split(" ")[0] || "there";

  if (loadingData)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94A3B8",
          fontFamily: "sans-serif",
          fontSize: "0.9rem",
        }}
      >
        Loading SpendWise...
      </div>
    );

  return (
    <>
      <style>{styles}</style>
      <div className="db">
        {/* NAV */}
        <nav className="db-nav">
          <div
            style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
          >
            <div className="db-logo">
              <div className="db-logo-icon">🏠</div>
              SpendWise
            </div>
            <div className="db-search-wrap">
              <span style={{ color: "#94A3B8", fontSize: "0.9rem" }}>🔍</span>
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div className="db-avatar">{initials}</div>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1E293B",
                }}
              >
                {user?.name}
              </span>
            </div>
            <button className="db-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </nav>

        <div className="db-main">
          {/* WELCOME */}
          <div className="db-welcome">
            <div>
              <h2>Welcome back, {firstName} 👋</h2>
              <p>Here's your financial overview.</p>
            </div>
            <button className="db-add-btn" onClick={() => setShowModal(true)}>
              + Add Transaction
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="db-stats">
            <div className="db-stat">
              <div className="db-stat-top">
                <div>
                  <div className="db-stat-label">Total Balance</div>
                  <div className="db-stat-val green">
                    R
                    {remaining.toLocaleString("en-ZA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <span className="db-stat-badge up">
                    ↑ {(100 - budgetPct).toFixed(0)}% remaining
                  </span>
                </div>
                <div className="db-stat-icon" style={{ background: "#F0FDF4" }}>
                  👛
                </div>
              </div>
            </div>

            <div className="db-stat">
              <div className="db-stat-top">
                <div>
                  <div className="db-stat-label">Total Expenses</div>
                  <div className="db-stat-val red">
                    R
                    {total.toLocaleString("en-ZA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <span className="db-stat-badge dn">
                    ↓ {budgetPct.toFixed(0)}% of budget
                  </span>
                </div>
                <div className="db-stat-icon" style={{ background: "#FEF2F2" }}>
                  📉
                </div>
              </div>
            </div>

            <div className="db-stat">
              <div className="db-stat-top">
                <div>
                  <div className="db-stat-label">Transactions</div>
                  <div className="db-stat-val">{expenses.length}</div>
                  <span className={`db-stat-badge ${countUp ? "up" : "dn"}`}>
                    {countUp ? "↑" : "↓"}{" "}
                    {Math.abs(thisMonthCount - lastMonthCount)} this month
                  </span>
                </div>
                <div className="db-stat-icon" style={{ background: "#EFF6FF" }}>
                  💳
                </div>
              </div>
            </div>

            <div className="db-stat">
              <div className="db-stat-top">
                <div style={{ flex: 1 }}>
                  <div className="db-stat-label">Monthly Budget</div>
                  <div className="db-stat-val">R{budget}</div>
                  {editingBudget ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.35rem",
                        marginTop: "0.35rem",
                      }}
                    >
                      <input
                        type="number"
                        placeholder={budget}
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveBudget()}
                        style={{
                          width: "80px",
                          background: "#F8FAFC",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "6px",
                          padding: "0.2rem 0.4rem",
                          fontSize: "0.72rem",
                          outline: "none",
                          color: "#1E293B",
                        }}
                      />
                      <button
                        onClick={saveBudget}
                        style={{
                          background: "#22C55E",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.2rem 0.5rem",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBudget(false)}
                        style={{
                          background: "#F1F5F9",
                          color: "#64748B",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.2rem 0.5rem",
                          fontSize: "0.68rem",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#22C55E",
                        fontWeight: 600,
                        cursor: "pointer",
                        marginTop: "0.25rem",
                      }}
                      onClick={() => setEditingBudget(true)}
                    >
                      {budgetPct.toFixed(0)}% used · R{remaining.toFixed(2)}{" "}
                      left · Edit budget
                    </div>
                  )}
                </div>
                <DonutChart
                  small
                  slices={[
                    { color: "#22C55E", pct: 100 - budgetPct },
                    { color: "#FEE2E2", pct: budgetPct },
                  ]}
                  total={remaining}
                />
              </div>
            </div>
          </div>

          {/* MIDDLE */}
          <div className="db-mid">
            <div className="db-card">
              <div className="db-card-hd">
                <div className="db-card-title">Expenses by Category</div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <DonutChart slices={donutSlices} total={total} />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.7rem",
                    minWidth: "160px",
                  }}
                >
                  {donutSlices.length === 0 && (
                    <div style={{ color: "#CBD5E1", fontSize: "0.82rem" }}>
                      Add transactions to see breakdown
                    </div>
                  )}
                  {donutSlices.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: s.color,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.83rem",
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          color: "#1E293B",
                          fontFamily: "'Darker Grotesque',sans-serif",
                        }}
                      >
                        {s.pct.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-hd">
                <div className="db-card-title">
                  Spending Trend · Last 6 Months
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#22C55E",
                    background: "#F0FDF4",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "999px",
                    border: "1px solid #DCFCE7",
                  }}
                >
                  Live
                </span>
              </div>
              <SpendingTrendChart expenses={expenses} />
            </div>
          </div>

          {/* BOTTOM */}
          <div className="db-bottom">
            <div className="db-card">
              <div className="db-card-hd">
                <div className="db-card-title">Recent Transactions</div>
                <button className="db-export-btn" onClick={exportCSV}>
                  ⬇ Export CSV
                </button>
              </div>

              <div className="db-filter-row">
                <select
                  className="db-filter-pill"
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {loadError && (
                <div
                  style={{
                    color: "#EF4444",
                    padding: "1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  {loadError}
                </div>
              )}

              {filtered.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2.5rem",
                    color: "#CBD5E1",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  No transactions found
                </div>
              ) : (
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, txPage * TX_PER_PAGE).map((e) => {
                      const cat =
                        CATEGORIES.find((c) => c.id === e.category) ||
                        CATEGORIES[6];
                      return (
                        <tr
                          key={e.id}
                          style={{ animation: "fadeUp 0.2s ease" }}
                        >
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.65rem",
                              }}
                            >
                              <div
                                className="db-tx-icon"
                                style={{ background: cat.color + "20" }}
                              >
                                {cat.icon}
                              </div>
                              <span className="db-tx-name">
                                {e.description}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className="db-cat-pill"
                              style={{
                                background: cat.color + "18",
                                color: cat.color,
                              }}
                            >
                              {cat.label}
                            </span>
                          </td>
                          <td style={{ color: "#94A3B8", fontWeight: 500 }}>
                            {e.date?.slice(0, 10)}
                          </td>
                          <td>
                            <span className="db-tx-amt">
                              −R{parseFloat(e.amount).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="db-del-btn"
                              onClick={() => del(e.id)}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {filtered.length > txPage * TX_PER_PAGE && (
                <button
                  onClick={() => setTxPage((p) => p + 1)}
                  className="db-export-btn"
                >
                  Show more
                </button>
              )}
            </div>

            {/* Insights */}
            <div className="db-card">
              <div className="db-card-hd">
                <div className="db-card-title">Insights</div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#22C55E",
                    background: "#F0FDF4",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "999px",
                    border: "1px solid #DCFCE7",
                  }}
                >
                  Live
                </span>
              </div>
              <Insights expenses={expenses} budget={budget} />
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.9rem",
                  background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
                  borderRadius: "12px",
                  border: "1px solid #DCFCE7",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#16A34A",
                    marginBottom: "0.3rem",
                  }}
                >
                  🤖 AI Finance Advisor
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "#64748B",
                    lineHeight: 1.55,
                    marginBottom: "0.5rem",
                  }}
                >
                  Get personalized money tips based on your real spending data.
                </div>
                <button
                  onClick={() => setAiOpen(true)}
                  style={{
                    background: "#22C55E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.4rem 0.9rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  Chat with AI →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AddModal onAdd={addExpense} onClose={() => setShowModal(false)} />
      )}
      <AIAdvisor
        expenses={expenses}
        budget={budget}
        user={user}
        aiOpen={aiOpen}
        setAiOpen={setAiOpen}
      />
    </>
  );
}
