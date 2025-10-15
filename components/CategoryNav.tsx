import Link from "next/link";

const cats = [
  { name: "Templates", desc: "Excel, Sheets & Word" },
  { name: "Journals", desc: "Daily logs & records" },
  { name: "E-Books", desc: "Guides & SOPs" },
  { name: "Tools", desc: "Dashboards & utilities" },
];

export function CategoryNav() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cats.map((c) => (
        <Link
          key={c.name}
          href={`/categories/${encodeURIComponent(c.name)}`}
          aria-label={`Browse ${c.name}`}
          className="surface p-5 transition-shadow hover:shadow-hover focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <div className="font-semibold">{c.name}</div>
          <div className="text-sm text-gray-500 mt-1">{c.desc}</div>
        </Link>
      ))}
    </div>
  );
}
