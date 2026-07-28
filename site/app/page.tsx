import Link from "next/link";

const concepts = [
  { href: "/living-valley", number: "01", title: "The Living Valley", note: "Warm, immersive, game-first" },
  { href: "/field-journal", number: "02", title: "Field Journal", note: "Tactile, storied, handcrafted" },
  { href: "/modern-cinematic", number: "03", title: "Modern Cinematic", note: "Bold, minimal, premium" },
];

export default function Home() {
  return (
    <main className="index-page">
      <div className="index-brand"><img src="/images/pangea_logo.png" alt="Pangea Games" /></div>
      <div className="index-copy">
        <p className="eyebrow">The Outpost · Visual exploration</p>
        <h1>Three ways into<br />the same world.</h1>
        <p>Explore each full-page direction. The content stays consistent so you can compare the feeling, hierarchy, and presentation.</p>
      </div>
      <nav className="concept-list" aria-label="Design concepts">
        {concepts.map((concept) => (
          <Link href={concept.href} key={concept.href}>
            <span>{concept.number}</span><strong>{concept.title}</strong><em>{concept.note}</em><b aria-hidden="true">↗</b>
          </Link>
        ))}
      </nav>
    </main>
  );
}
