import { notFound } from "next/navigation";
import Link from "next/link";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = {
    slug: params.slug,
    title: "Blog post",
    content: "This is a placeholder for blog post content.",
    date: "2026-07-15",
  };

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="pt-24 pb-8">
        <div className="mx-auto max-w-3xl px-6">
          <Link href="/blog" className="text-sm text-slate hover:text-ink transition">
            ← Back to blog
          </Link>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="font-display text-4xl text-ink">{post.title}</h1>
          <p className="mt-2 text-sm text-slate">{new Date(post.date).toLocaleDateString()}</p>
          <div className="mt-8 prose prose-slate max-w-none">
            <p>{post.content}</p>
            <p className="text-sm text-slate">
              This is a placeholder. Replace with actual blog content from a CMS or markdown files.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
