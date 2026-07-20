import Link from "next/link";

const posts = [
  {
    slug: "getting-started-with-mzbs",
    title: "Getting started with mzbs",
    excerpt: "A quick guide to setting up your school on the platform.",
    date: "2026-07-15",
  },
  {
    slug: "why-schools-are-switching-to-modern-management",
    title: "Why schools are switching to modern management",
    excerpt: "How technology is transforming school administration.",
    date: "2026-07-10",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl text-ink">Blog</h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-slate">
            Insights and updates from the mzbs team
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="border-b border-line/30 pb-8 last:border-0">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-display text-ink hover:text-accent transition">
                    {post.title}
                  </h2>
                </Link>
                <p className="mt-2 text-sm text-slate">{post.excerpt}</p>
                <p className="mt-2 text-xs text-slate">{new Date(post.date).toLocaleDateString()}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
