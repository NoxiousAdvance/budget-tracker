import { useState, useEffect } from "react";

const FOOD_BUDGET = 400;
const ENT_BUDGET = 300;
const FORTNIGHT_MS = 14 * 24 * 60 * 60 * 1000;

const QUICK_MERCHANTS = {
  food: ["New World", "Gilmours", "Eggs", "Paparangi Mkt", "One Stop"],
  entertainment: ["Golding's", "Abandoned", "Barrel2Bottle", "Garage Project", "Shed 22"],
};

function getFortnight(date = new Date()) {
  const anchor = new Date("2026-05-13");
  const ms = date - anchor;
  const n = Math.floor(ms / FORTNIGHT_MS);
  const start = new Date(anchor.getTime() + n * FORTNIGHT_MS);
  const end = new Date(start.getTime() + FORTNIGHT_MS - 1);
  return {
    id: `pp-${n + 20}`,
    label: `PP${n + 20}`,
    start,
    end,
    n,
  };
}

function formatDate(d) {
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
}

function daysLeft(fn) {
  const now = new Date();
  const diff = fn.end - now;
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function StatusBar({ spent, budget, label, color, days }) {
  const pct = Math.min((spent / budget) * 100, 100);
  const over = spent > budget;
  const remaining = budget - spent;
  const overage = spent - budget;
  const status = spent < budget * 0.75 ? "good" : spent < budget ? "caution" : "over";

  // Return-to-budget: what fraction of total spend is covered by the budget (0–100%)
  // Goal is 100% — meaning spend has come back down to budget. Shows how far you still need to recover.
  const recoveryPct = over ? Math.round((budget / spent) * 100) : 100;

  const colors = {
    good: { bar: color, text: "#2d6a4f", bg: "#d8f3dc" },
    caution: { bar: "#e9c46a", text: "#7b5e1a", bg: "#fef3c7" },
    over: { bar: "#e63946", text: "#7f1d1d", bg: "#fee2e2" },
  };
  const c = colors[status];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>{label}</span>
        <span style={{ fontSize: 13, color: c.text, fontWeight: 600, background: c.bg, padding: "2px 10px", borderRadius: 20 }}>
          {over ? `$${overage.toFixed(0)} over` : `$${remaining.toFixed(0)} left`}
        </span>
      </div>
      <div style={{ background: "#f1f0ec", borderRadius: 6, height: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: c.bar, height: "100%", borderRadius: 6, transition: "width 0.4s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>${spent.toFixed(0)} spent</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>of ${budget}</span>
      </div>

      {/* ── Return to budget ── */}
      {over && (
        <div style={{ marginTop: 10, padding: "12px 14px", background: "#fff1f2", borderRadius: 10, border: "1px solid #fecdd3" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#881337", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              🎯 Return to budget
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#be123c" }}>
              {recoveryPct}% recovered
            </span>
          </div>

          {/* Bar: fill = within-budget portion; background = overage zone */}
          <div style={{ position: "relative", background: "#fecdd3", borderRadius: 6, height: 10, overflow: "visible", marginBottom: 6 }}>
            <div style={{
              width: `${recoveryPct}%`,
              background: "#f43f5e",
              height: "100%",
              borderRadius: 6,
              transition: "width 0.4s ease",
            }} />
            {/* Target line at 100% */}
            <div style={{
              position: "absolute",
              right: 0,
              top: -3,
              bottom: -3,
              width: 2,
              background: "#9f1239",
              borderRadius: 2,
            }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#fda4af" }}>$0 (target)</span>
            <span style={{ fontSize: 11, color: "#be123c", fontWeight: 600 }}>+${overage.toFixed(0)} over</span>
          </div>

          <p style={{ margin: 0, fontSize: 12, color: "#9f1239", lineHeight: 1.5 }}>
            {days === 0
              ? `Fortnight closed $${overage.toFixed(0)} over budget.`
              : days === 1
              ? `Last day — hold at $0 to stop the bleed.`
              : `Hold at $0/day for the next ${days} days to prevent further overspend.`}
          </p>
        </div>
      )}
    </div>
  );
}

function EntryModal({ cat, onSave, onClose }) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [note, setNote] = useState("");

  const handle = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    onSave({ cat, amount: a, merchant: merchant || "Other", note, date: new Date().toISOString() });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Add {cat === "food" ? "Food & Drink" : "Entertainment"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Amount ($)</label>
          <input
            autoFocus
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ width: "100%", fontSize: 28, fontWeight: 600, border: "none", borderBottom: "2px solid #e5e7eb", outline: "none", padding: "8px 0", color: "#111", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Merchant</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {QUICK_MERCHANTS[cat].map(m => (
              <button key={m} onClick={() => setMerchant(m)}
                style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${merchant === m ? "#1d3557" : "#e5e7eb"}`, background: merchant === m ? "#1d3557" : "#fff", color: merchant === m ? "#fff" : "#374151", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                {m}
              </button>
            ))}
          </div>
          <input
            placeholder="Or type merchant name..."
            value={merchant}
            onChange={e => setMerchant(e.target.value)}
            style={{ width: "100%", fontSize: 14, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", outline: "none", boxSizing: "border-box", color: "#111" }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Note (optional)</label>
          <input
            placeholder="e.g. Monday session"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ width: "100%", fontSize: 14, border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", outline: "none", boxSizing: "border-box", color: "#111" }}
          />
        </div>

        <button onClick={handle}
          style={{ width: "100%", padding: "14px", background: "#1d3557", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em" }}>
          Save Entry
        </button>
      </div>
    </div>
  );
}

function HistoryRow({ fn, entries }) {
  const food = entries.filter(e => e.cat === "food" && e.fnId === fn.id).reduce((s, e) => s + e.amount, 0);
  const ent = entries.filter(e => e.cat === "entertainment" && e.fnId === fn.id).reduce((s, e) => s + e.amount, 0);
  const foodDelta = food - FOOD_BUDGET;
  const entDelta = ent - ENT_BUDGET;
  const totalDelta = foodDelta + entDelta;

  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid #f1f0ec" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{fn.label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: totalDelta > 0 ? "#e63946" : "#2d6a4f" }}>
          {totalDelta > 0 ? `+$${totalDelta.toFixed(0)} over` : `-$${Math.abs(totalDelta).toFixed(0)} under`}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        {formatDate(fn.start)} – {formatDate(fn.end)} &nbsp;·&nbsp;
        Food ${food.toFixed(0)} &nbsp;·&nbsp; Ent ${ent.toFixed(0)}
      </div>
    </div>
  );
}

export default function App() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("budget-entries") || "[]"); } catch { return []; }
  });
  const [modal, setModal] = useState(null);
  const [view, setView] = useState("tracker");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fn = getFortnight();
  const days = daysLeft(fn);

  useEffect(() => {
    localStorage.setItem("budget-entries", JSON.stringify(entries));
  }, [entries]);

  const save = entry => {
    setEntries(prev => [...prev, { ...entry, id: Date.now(), fnId: fn.id }]);
  };

  const remove = id => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setDeleteConfirm(null);
  };

  const currentEntries = entries.filter(e => e.fnId === fn.id);
  const foodSpent = currentEntries.filter(e => e.cat === "food").reduce((s, e) => s + e.amount, 0);
  const entSpent = currentEntries.filter(e => e.cat === "entertainment").reduce((s, e) => s + e.amount, 0);

  const foodRemaining = FOOD_BUDGET - foodSpent;
  const entRemaining = ENT_BUDGET - entSpent;
  const dailyFoodSafe = days > 0 ? foodRemaining / days : 0;
  const dailyEntSafe = days > 0 ? entRemaining / days : 0;

  const pastFns = [];
  const seen = new Set();
  entries.forEach(e => {
    if (e.fnId !== fn.id && !seen.has(e.fnId)) {
      seen.add(e.fnId);
      const n = parseInt(e.fnId.replace("pp-", "")) - 20;
      const anchor = new Date("2026-05-13");
      const start = new Date(anchor.getTime() + n * FORTNIGHT_MS);
      const end = new Date(start.getTime() + FORTNIGHT_MS - 1);
      pastFns.push({ id: e.fnId, label: `PP${n + 20}`, start, end });
    }
  });
  pastFns.sort((a, b) => b.start - a.start);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#fafaf8" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ background: "#1d3557", padding: "28px 24px 24px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, letterSpacing: "-0.01em" }}>Budget Tracker</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#a8d8ea", opacity: 0.85 }}>
              {fn.label} · {formatDate(fn.start)} – {formatDate(fn.end)} · {days}d left
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["tracker", "history"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid rgba(255,255,255,0.3)", background: view === v ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500, textTransform: "capitalize" }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === "tracker" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
            {[
              { label: "Safe/day food", val: dailyFoodSafe, ok: foodSpent <= FOOD_BUDGET },
              { label: "Safe/day ent", val: dailyEntSafe, ok: entSpent <= ENT_BUDGET },
            ].map(({ label, val, ok }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ margin: 0, fontSize: 11, color: "#a8d8ea", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: ok ? "#a8d8ea" : "#ff6b6b" }}>
                  {val > 0 ? `$${val.toFixed(0)}` : "Over!"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "24px" }}>
        {view === "tracker" ? (
          <>
            <StatusBar spent={foodSpent} budget={FOOD_BUDGET} label="Food & Drink" color="#457b9d" days={days} />
            <StatusBar spent={entSpent} budget={ENT_BUDGET} label="Entertainment" color="#e76f51" days={days} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "24px 0" }}>
              {[
                { cat: "food", label: "Add Food", color: "#457b9d" },
                { cat: "entertainment", label: "Add Entertainment", color: "#e76f51" },
              ].map(({ cat, label, color }) => (
                <button key={cat} onClick={() => setModal(cat)}
                  style={{ padding: "16px", background: color, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer", letterSpacing: "0.01em" }}>
                  + {label}
                </button>
              ))}
            </div>

            {currentEntries.length > 0 && (
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>This fortnight</h3>
                {[...currentEntries].reverse().map(e => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f0ec" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.cat === "food" ? "#457b9d" : "#e76f51", flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#111" }}>{e.merchant}</p>
                        {e.note && <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{e.note}</p>}
                        <p style={{ margin: 0, fontSize: 11, color: "#d1d5db" }}>{new Date(e.date).toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>${e.amount.toFixed(2)}</span>
                      {deleteConfirm === e.id ? (
                        <button onClick={() => remove(e.id)}
                          style={{ fontSize: 11, padding: "3px 8px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                          Confirm
                        </button>
                      ) : (
                        <button onClick={() => setDeleteConfirm(e.id)}
                          style={{ fontSize: 16, background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: "0 4px" }}>
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentEntries.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <p style={{ fontSize: 32, margin: "0 0 8px" }}>🟢</p>
                <p style={{ margin: 0, fontSize: 14 }}>Nothing entered yet — clean slate for {fn.label}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>Fortnight history</h3>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>Budget: Food $400 · Entertainment $300</p>
            <HistoryRow fn={fn} entries={entries} />
            {pastFns.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 20, textAlign: "center" }}>No history yet — past fortnights will appear here.</p>
            )}
            {pastFns.map(pf => <HistoryRow key={pf.id} fn={pf} entries={entries} />)}
          </>
        )}
      </div>

      {modal && <EntryModal cat={modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
