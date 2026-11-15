"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Appearance = "light" | "dark" | "system";
const options: { value: Appearance; label: string; description: string }[] = [
  { value: "light", label: "Light", description: "A bright, paper-like workspace" },
  { value: "dark", label: "Dark", description: "A softer view in low light" },
  { value: "system", label: "System", description: "Match your device’s appearance" },
];

export default function AppearanceSettings({ onOpen }: { onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const [appearance, setAppearance] = useState<Appearance>("system");
  const [ready, setReady] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstChoice = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wk-appearance");
      if (saved === "light" || saved === "dark" || saved === "system") setAppearance(saved);
    } catch { /* Appearance remains usable when browser storage is unavailable. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = appearance === "dark" || (appearance === "system" && media.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [appearance, ready]);

  useEffect(() => {
    if (!open) return;
    firstChoice.current?.focus();
    const outside = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    container.current?.addEventListener("keydown", escape);
    const element = container.current;
    return () => { document.removeEventListener("pointerdown", outside); element?.removeEventListener("keydown", escape); };
  }, [open]);

  function choose(value: Appearance) {
    setAppearance(value);
    try { localStorage.setItem("wk-appearance", value); } catch { /* Use this selection for the current visit. */ }
  }

  return <div className="appearance-settings" ref={container} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <button ref={trigger} className="settings-toggle" aria-label="Display settings" title="Display settings" aria-expanded={open} aria-controls="appearance-panel" onClick={() => { if (!open) onOpen(); setOpen(!open); }}>
      <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m9.5 3-.6 2.2-1.5.9-2.2-.6-2.5 4.3 1.6 1.6v1.8l-1.6 1.6 2.5 4.3 2.2-.6 1.5.9.6 2.2h5l.6-2.2 1.5-.9 2.2.6 2.5-4.3-1.6-1.6v-1.8l1.6-1.6-2.5-4.3-2.2.6-1.5-.9-.6-2.2z"/><circle cx="12" cy="12.5" r="3"/></svg>
    </button>
    {open && <section id="appearance-panel" className="appearance-panel" aria-labelledby="appearance-heading"><div className="appearance-panel-heading"><div><h2 id="appearance-heading">Display settings</h2><p>Make WorkflowKits feel right for you.</p></div><button className="settings-close" aria-label="Close display settings" onClick={() => { setOpen(false); trigger.current?.focus(); }}>×</button></div><fieldset><legend>UI appearance</legend>{options.map((option, index) => <label key={option.value} className="appearance-choice"><input ref={index === 0 ? firstChoice : undefined} type="radio" name="wk-appearance" value={option.value} checked={appearance === option.value} onChange={() => choose(option.value)} /><span><strong>{option.label}</strong><small>{option.description}</small></span><span className={`appearance-swatch swatch-${option.value}`} aria-hidden="true" /></label>)}</fieldset><nav className="settings-legal-links" aria-label="Website policies"><Link href="/terms" onClick={() => setOpen(false)}>Terms and Conditions <span aria-hidden="true">↗</span></Link><Link href="/privacy" onClick={() => setOpen(false)}>Privacy Notice <span aria-hidden="true">↗</span></Link></nav><p className="appearance-note">Your preference is saved in this browser. This changes the WorkflowKits website; WDT POS keeps its own settings.</p></section>}
  </div>;
}
