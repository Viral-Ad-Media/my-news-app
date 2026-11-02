"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";

const defaults = { textSize: "standard", width: "comfortable", lowData: false, history: false };
const Context = createContext({ ...defaults, ready: false });
function normalize(value) {
  return { textSize: ["standard", "large", "largest"].includes(value?.textSize) ? value.textSize : "standard",
    width: value?.width === "wide" ? "wide" : "comfortable", lowData: value?.lowData === true, history: value?.history === true };
}
export function useReadingPreferences() { return useContext(Context); }
export default function ReadingPreferences({ children, showControls = true }) {
  const [preferences, setPreferences] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    function sync() {
      try { setPreferences(normalize(JSON.parse(localStorage.getItem("aboki-reading") || "{}"))); } catch {}
      setReady(true);
    }
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.readingSize = preferences.textSize;
    document.documentElement.dataset.readingWidth = preferences.width;
    document.documentElement.dataset.lowData = String(preferences.lowData);
  }, [preferences]);
  function update(key, value) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    try { localStorage.setItem("aboki-reading", JSON.stringify(next)); setStorageError(""); }
    catch { setStorageError("These settings will last for this visit. Your browser could not save them."); }
  }
  return <Context.Provider value={{ ...preferences, ready }}>
    {showControls && <div className="reading-toolbar"><details><summary>Reading settings</summary><div className="reading-options">
      <label>Article text size<select value={preferences.textSize} onChange={e => update("textSize", e.target.value)}><option value="standard">Standard</option><option value="large">Large</option><option value="largest">Extra large</option></select></label>
      <label>Article width<select value={preferences.width} onChange={e => update("width", e.target.value)}><option value="comfortable">Comfortable</option><option value="wide">Wide</option></select></label>
      <label><input type="checkbox" checked={preferences.lowData} onChange={e => update("lowData", e.target.checked)} />Low-data mode — hide news images</label>
      <label><input type="checkbox" checked={preferences.history} onChange={e => update("history", e.target.checked)} />Remember reading history when signed in</label>
      <p>Settings are saved on this browser. Turning history off stops new entries; you can <Link href="/history">view or clear existing history</Link>.</p>
      {storageError && <p role="status">{storageError}</p>}
    </div></details></div>}
    {children}
  </Context.Provider>;
}
