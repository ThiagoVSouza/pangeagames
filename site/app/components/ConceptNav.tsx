import Link from "next/link";

export function ConceptNav({ active }: { active: string }) {
  const links = [
    ["living-valley", "Living Valley"],
    ["field-journal", "Field Journal"],
    ["modern-cinematic", "Modern Cinematic"],
  ];
  return (
    <div className="concept-nav">
      <Link className="concept-home" href="/">Pangea concepts</Link>
      <div>
        {links.map(([slug, label], index) => (
          <Link aria-current={active === slug ? "page" : undefined} href={`/${slug}`} key={slug}>
            <span>0{index + 1}</span>{label}
          </Link>
        ))}
      </div>
    </div>
  );
}
