"use client";
import { useEffect, useState } from "react";
import products from "@/data/products.json";

export default function AdminPage() {
  const [pwd, setPwd] = useState("");
  const [auth, setAuth] = useState(false);
  const [list, setList] = useState<any[]>(products as any);
  const [status, setStatus] = useState("");

  const save = async () => {
    setStatus("Saving...");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin": pwd },
      body: JSON.stringify({ products: list })
    });
    const data = await res.json();
    setStatus(data.ok ? "Saved ✅" : `Error: ${data.error || "unknown"}`);
  };

  if (!auth) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Admin Sign-In</h1>
        <input
          type="password"
          placeholder="Admin password"
          value={pwd}
          onChange={(e)=>setPwd(e.target.value)}
          className="w-full border rounded-xl p-3"
        />
        <button onClick={()=>setAuth(true)} className="px-5 py-3 bg-black text-white rounded-xl">Enter</button>
        <p className="text-sm text-gray-500">Set <code>ADMIN_PASSWORD</code> in env.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button onClick={()=>setList([...list, {slug:"", title:"", price:0, currency:"NGN", category:"Templates", short:"", downloadFile:"", features:[], testimonials:[], cover:""}])} className="px-3 py-2 border rounded-xl">+ Add</button>
        <button onClick={save} className="px-3 py-2 bg-brand text-white rounded-xl">Save</button>
        <span className="text-sm text-gray-600">{status}</span>
      </div>
      <div className="space-y-6">
        {list.map((p, idx)=> (
          <div key={idx} className="p-4 border rounded-xl space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm">Slug<input className="w-full border rounded p-2" value={p.slug} onChange={e=>{const v=[...list]; v[idx].slug=e.target.value; setList(v)}} /></label>
              <label className="block text-sm">Title<input className="w-full border rounded p-2" value={p.title} onChange={e=>{const v=[...list]; v[idx].title=e.target.value; setList(v)}} /></label>
              <label className="block text-sm">Price (NGN)<input type="number" className="w-full border rounded p-2" value={p.price} onChange={e=>{const v=[...list]; v[idx].price=Number(e.target.value||0); setList(v)}} /></label>
              <label className="block text-sm">Category<select className="w-full border rounded p-2" value={p.category} onChange={e=>{const v=[...list]; v[idx].category=e.target.value; setList(v)}}>
                {["Templates","Journals","E-Books","Tools"].map(c=><option key={c} value={c}>{c}</option>)}
              </select></label>
              <label className="block text-sm col-span-2">Short<input className="w-full border rounded p-2" value={p.short} onChange={e=>{const v=[...list]; v[idx].short=e.target.value; setList(v)}} /></label>
              <label className="block text-sm col-span-2">Download File<input className="w-full border rounded p-2" value={p.downloadFile} onChange={e=>{const v=[...list]; v[idx].downloadFile=e.target.value; setList(v)}} /></label>
              <label className="block text-sm col-span-2">Cover<input className="w-full border rounded p-2" value={p.cover} onChange={e=>{const v=[...list]; v[idx].cover=e.target.value; setList(v)}} /></label>
            </div>
            <div className="text-sm">Features (comma-separated)
              <input className="w-full border rounded p-2" value={(p.features||[]).join(", ")} onChange={e=>{const v=[...list]; v[idx].features=e.target.value.split(",").map(s=>s.trim()).filter(Boolean); setList(v)}} />
            </div>
            <button onClick={()=>{const v=[...list]; v.splice(idx,1); setList(v)}} className="text-red-600 text-sm">Delete</button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Changes overwrite <code>data/products.json</code>. Ensure file permissions.</p>
    </div>
  );
}
