export default function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-xs font-medium tracking-[0.2em] text-brass uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 font-serif text-2xl font-semibold text-heading sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 leading-loose text-ink-soft">{description}</p>
      ) : null}
    </div>
  );
}
