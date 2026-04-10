import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { expenseAPI } from "../api";

const CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: "🍜", color: "#FF6B6B" },
  { id: "transport", label: "Transport", icon: "🚌", color: "#4ECDC4" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#FFE66D" },
  { id: "health", label: "Health", icon: "💊", color: "#A8E6CF" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#C3B1E1" },
  { id: "utilities", label: "Utilities", icon: "💡", color: "#FFB347" },
  { id: "other", label: "Other", icon: "📦", color: "#B0BEC5" },
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .et-root { min-height: 100vh; background: #0A0A0F; color: #F0EDE8; font-family: 'Syne', sans-serif; padding: 2rem 1rem; }
  .et-header { max-width: 900px; margin: 0 auto 2.5rem; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #1E1E2A; padding-bottom: 1.5rem; }
  .et-header h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
  .et-header h1 span { color: #7C6AF5; }
  .et-header-right { display: flex; align-items: center; gap: 1rem; }
  .et-user { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #555; text-align: right; }
  .et-user strong { display: block; color: #888; font-size: 0.75rem; }
  .et-logout { background: none; border: 1px solid #1E1E2A; color: #555; border-radius: 6px; padding: 0.35rem 0.7rem; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; cursor: pointer; transition: all 0.2s; }
  .et-logout:hover { border-color: #FF6B6B; color: #FF6B6B; }
  .et-main { max-width: 900px; margin: 0 auto; display: grid; gap: 1.5rem; }
  .et-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .et-card { background: #111118; border: 1px solid #1E1E2A; border-radius: 16px; padding: 1.25rem 1.5rem; position: relative; overflow: hidden; }
  .et-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); }
  .et-card-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: #555; margin-bottom: 0.5rem; }
  .et-card-value { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.04em; color: var(--accent); }
  .et-card-sub { font-size: 0.7rem; color: #444; margin-top: 0.2rem; font-family: 'JetBrains Mono', monospace; }
  .et-form { background: #111118; border: 1px solid #1E1E2A; border-radius: 16px; padding: 1.5rem; }
  .et-form-title { font-size: 0.7rem; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.12em; color: #555; margin-bottom: 1rem; }
  .et-form-grid { display: grid; grid-template-columns: 1fr 1fr 2fr auto; gap: 0.75rem; align-items: end; }
  .et-field { display: flex; flex-direction: column; gap: 0.4rem; }
  .et-label { font-size: 0.65rem; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #555; }
  .et-input, .et-select { background: #0A0A0F; border: 1px solid #1E1E2A; border-radius: 8px; padding: 0.6rem 0.8rem; color: #F0EDE8; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; outline: none; transition: border-color 0.2s; width: 100%; }
  .et-input:focus, .et-select:focus { border-color: #7C6AF5; }
  .et-select option { background: #111118; }
  .et-btn-add { background: #7C6AF5; color: #fff; border: none; border-radius: 8px; padding: 0.6rem 1.2rem; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
  .et-btn-add:hover { background: #6354D4; }
  .et-btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
  .et-cats { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .et-cat-chip { background: #111118; border: 1px solid #1E1E2A; border-radius: 999px; padding: 0.3rem 0.75rem; font-size: 0.7rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.3rem; font-family: 'JetBrains Mono', monospace; }
  .et-cat-chip:hover { border-color: #7C6AF5; }
  .et-cat-chip.active { background: var(--cat-color, #7C6AF5); border-color: transparent; color: #000; font-weight: 500; }
  .et-list { display: flex; flex-direction: column; }
  .et-item { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem; border-top: 1px solid #111118; border-radius: 10px; transition: background 0.15s; animation: fadeSlide 0.25s ease; }
  .et-item:hover { background: #111118; }
  @keyframes fadeSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  .et-item-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; background: var(--cat-bg, #1E1E2A); flex-shrink: 0; }
  .et-item-desc { font-size: 0.875rem; font-weight: 600; }
  .et-item-date { font-size: 0.65rem; color: #444; font-family: 'JetBrains Mono', monospace; margin-top: 0.15rem; }
  .et-item-amount { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 500; text-align: right; color: #FF6B6B; }
  .et-item-del { background: none; border: none; color: #333; cursor: pointer; font-size: 0.8rem; padding: 0.25rem; border-radius: 4px; transition: color 0.15s; line-height: 1; }
  .et-item-del:hover { color: #FF6B6B; }
  .et-breakdown { background: #111118; border: 1px solid #1E1E2A; border-radius: 16px; padding: 1.5rem; }
  .et-breakdown-title { font-size: 0.7rem; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.12em; color: #555; margin-bottom: 1rem; }
  .et-bar-row { margin-bottom: 0.75rem; }
  .et-bar-meta { display: flex; justify-content: space-between; margin-bottom: 0.3rem; font-size: 0.75rem; }
  .et-bar-meta span:last-child { font-family: 'JetBrains Mono', monospace; color: #888; font-size: 0.7rem; }
  .et-bar-track { height: 6px; background: #1E1E2A; border-radius: 999px; overflow: hidden; }
  .et-bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
  .et-empty { text-align: center; padding: 2rem; color: #333; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; }
  .et-budget-row { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.75rem; }
  .et-budget-input { background: #0A0A0F; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.3rem 0.6rem; color: #F0EDE8; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; outline: none; width: 100px; }
  .et-budget-input:focus { border-color: #7C6AF5; }
  .et-budget-btn { background: #1E1E2A; border: none; color: #F0EDE8; border-radius: 6px; padding: 0.3rem 0.7rem; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; cursor: pointer; }
  .et-budget-btn:hover { background: #2A2A3A; }
  .et-loading { text-align: center; padding: 3rem; color: #333; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
  @media (max-width: 640px) { .et-summary { grid-template-columns: 1fr 1fr; } .et-form-grid { grid-template-columns: 1fr 1fr; } .et-form-grid > *:nth-child(3) { grid-column: span 2; } }
`;

export default function Dashboard() {
  const { user, logout, updateBudget } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    desc: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().slice(0, 10),
  });
  const [adding, setAdding] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);

  const now = new Date();
  const monthName = MONTHS[now.getMonth()] + " " + now.getFullYear();

  useEffect(() => {
    expenseAPI
      .getAll()
      .then((data) => {
        if (Array.isArray(data)) setExpenses(data);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? expenses
        : expenses.filter((e) => e.category === filter),
    [expenses, filter],
  );

  const total = useMemo(
    () => expenses.reduce((s, e) => s + parseFloat(e.amount), 0),
    [expenses],
  );
  const catTotals = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + parseFloat(e.amount);
    });
    return map;
  }, [expenses]);

  const budget = user?.budget || 1000;
  const spent_pct = Math.min((total / budget) * 100, 100).toFixed(1);

  const addExpense = async () => {
    if (!form.desc.trim() || !form.amount || +form.amount <= 0) return;
    setAdding(true);
    const data = await expenseAPI.add({
      description: form.desc,
      amount: +form.amount,
      category: form.category,
      date: form.date,
    });
    if (data.id) {
      setExpenses((prev) => [data, ...prev]);
      setForm((f) => ({ ...f, desc: "", amount: "" }));
    }
    setAdding(false);
  };

  const del = async (id) => {
    await expenseAPI.delete(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const saveBudget = async () => {
    if (!budgetInput || isNaN(budgetInput) || +budgetInput <= 0) return;
    const data = await expenseAPI.updateBudget(+budgetInput);
    if (data.budget) {
      updateBudget(data.budget);
      setEditingBudget(false);
      setBudgetInput("");
    }
  };

  if (loadingData)
    return (
      <>
        <style>{styles}</style>
        <div className="et-loading">// loading your expenses...</div>
      </>
    );

  return (
    <>
      <style>{styles}</style>
      <div className="et-root">
        <div className="et-header">
          <div>
            <h1>
              Expense<span>.</span>
            </h1>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.7rem",
                color: "#555",
                marginTop: "0.25rem",
              }}
            >
              {monthName}
            </div>
          </div>
          <div className="et-header-right">
            <div className="et-user">
              <strong>{user?.name}</strong>
              {user?.email}
            </div>
            <button className="et-logout" onClick={logout}>
              logout
            </button>
          </div>
        </div>

        <div className="et-main">
          {/* Summary */}
          <div className="et-summary">
            <div className="et-card" style={{ "--accent": "#FF6B6B" }}>
              <div className="et-card-label">Total Spent</div>
              <div className="et-card-value">R{total.toFixed(2)}</div>
              <div className="et-card-sub">{expenses.length} transactions</div>
            </div>
            <div className="et-card" style={{ "--accent": "#4ECDC4" }}>
              <div className="et-card-label">Remaining</div>
              <div className="et-card-value">
                R{Math.max(budget - total, 0).toFixed(2)}
              </div>
              <div className="et-card-sub">
                of R{budget} budget
                {!editingBudget ? (
                  <button
                    className="et-budget-btn"
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => setEditingBudget(true)}
                  >
                    edit
                  </button>
                ) : (
                  <span className="et-budget-row">
                    <input
                      className="et-budget-input"
                      type="number"
                      placeholder={budget}
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                    />
                    <button className="et-budget-btn" onClick={saveBudget}>
                      save
                    </button>
                  </span>
                )}
              </div>
            </div>
            <div className="et-card" style={{ "--accent": "#7C6AF5" }}>
              <div className="et-card-label">Budget Used</div>
              <div className="et-card-value">{spent_pct}%</div>
              <div className="et-card-sub">
                avg R
                {expenses.length
                  ? (total / expenses.length).toFixed(2)
                  : "0.00"}{" "}
                / item
              </div>
            </div>
          </div>

          {/* Add Form */}
          <div className="et-form">
            <div className="et-form-title">// Add Expense</div>
            <div className="et-form-grid">
              <div className="et-field">
                <label className="et-label">Amount (R)</label>
                <input
                  className="et-input"
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && addExpense()}
                />
              </div>
              <div className="et-field">
                <label className="et-label">Category</label>
                <select
                  className="et-select"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="et-field">
                <label className="et-label">Description</label>
                <input
                  className="et-input"
                  type="text"
                  placeholder="What did you spend on?"
                  value={form.desc}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, desc: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && addExpense()}
                />
              </div>
              <button
                className="et-btn-add"
                onClick={addExpense}
                disabled={adding}
              >
                {adding ? "..." : "+ Add"}
              </button>
            </div>
          </div>

          {/* Breakdown */}
          {expenses.length > 0 && (
            <div className="et-breakdown">
              <div className="et-breakdown-title">// Breakdown by category</div>
              {CATEGORIES.filter((c) => catTotals[c.id]).map((c) => (
                <div className="et-bar-row" key={c.id}>
                  <div className="et-bar-meta">
                    <span>
                      {c.icon} {c.label}
                    </span>
                    <span>R{catTotals[c.id]?.toFixed(2)}</span>
                  </div>
                  <div className="et-bar-track">
                    <div
                      className="et-bar-fill"
                      style={{
                        width: `${((catTotals[c.id] || 0) / total) * 100}%`,
                        background: c.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List */}
          <div>
            <div className="et-cats" style={{ marginBottom: "0.75rem" }}>
              <button
                className={`et-cat-chip ${filter === "all" ? "active" : ""}`}
                style={{ "--cat-color": "#7C6AF5" }}
                onClick={() => setFilter("all")}
              >
                All ({expenses.length})
              </button>
              {CATEGORIES.filter((c) => catTotals[c.id]).map((c) => (
                <button
                  key={c.id}
                  className={`et-cat-chip ${filter === c.id ? "active" : ""}`}
                  style={{ "--cat-color": c.color }}
                  onClick={() => setFilter(filter === c.id ? "all" : c.id)}
                >
                  {c.icon} {c.label.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="et-list">
              {filtered.length === 0 && (
                <div className="et-empty">no expenses yet — add one above</div>
              )}
              {filtered.map((e) => {
                const cat =
                  CATEGORIES.find((c) => c.id === e.category) || CATEGORIES[6];
                return (
                  <div className="et-item" key={e.id}>
                    <div
                      className="et-item-icon"
                      style={{ "--cat-bg": cat.color + "22" }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <div className="et-item-desc">{e.description}</div>
                      <div className="et-item-date">
                        {e.date?.slice(0, 10)} · {cat.label}
                      </div>
                    </div>
                    <div className="et-item-amount">
                      −R{parseFloat(e.amount).toFixed(2)}
                    </div>
                    <button className="et-item-del" onClick={() => del(e.id)}>
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
