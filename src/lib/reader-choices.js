"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
const Context = createContext({ choices: null, ready: false });
export default function ReaderChoicesProvider({ children }) {
  const [choices, setChoices] = useState(null), [ready, setReady] = useState(false), [busy, setBusy] = useState(false);
  const generation = useRef(0), pending = useRef(false);
  useEffect(() => {
    let active = true;
    async function sync() {
      const sequence = ++generation.current;
      setChoices(null); setReady(false);
      try {
        const res = await fetch("/api/reader/reader-choices", { cache: "no-store" });
        const data = res.ok ? await res.json() : null;
        if (active && generation.current === sequence) setChoices(data);
      } catch { if (active && generation.current === sequence) setChoices(null); }
      finally { if (active && generation.current === sequence) setReady(true); }
    }
    sync(); window.addEventListener("news-session", sync);
    return () => { active = false; window.removeEventListener("news-session", sync); };
  }, []);
  async function change(kind, id, enabled) {
    if (pending.current) return;
    pending.current = true; setBusy(true);
    const sequence = generation.current;
    try {
      const res = await fetch(`/api/reader/reader-choices/${kind}/${id}`, { method: enabled ? "PUT" : "DELETE", headers: { "Content-Type": "application/json" }, body: enabled ? "{}" : undefined });
      const data = await res.json();
      if (!res.ok) throw Error([401, 403].includes(res.status) ? "Sign in to manage your feed." : "Could not save your choice. Please retry.");
      if (generation.current === sequence) { setChoices(data); window.dispatchEvent(new Event("news-preferences")); }
    } finally { pending.current = false; setBusy(false); }
  }
  return <Context.Provider value={{ choices, ready, busy, change }}>{children}</Context.Provider>;
}
export function useReaderChoices() { return useContext(Context); }
