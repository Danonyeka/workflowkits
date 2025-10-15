export const metadata = { title: "Blog — WorkflowKits" };

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <p className="text-gray-600">
        Tips, templates, and case studies for project and construction management.
      </p>

      {/* Replace with a CMS or markdown later */}
      <article className="p-5 border rounded-2xl">
        <h2 className="text-xl font-semibold mb-2">Kickstart your project with a ready RFI tracker</h2>
        <p className="text-sm text-gray-600">3 min read • Templates</p>
        <p className="mt-3">
          A lightweight RFI tracker can cut weekly reporting time by 30–40%. Here’s how to set one up…
        </p>
      </article>
    </div>
  );
}
