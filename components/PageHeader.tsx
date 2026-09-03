export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-ink/10">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="font-serif text-3xl font-semibold text-heading sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl leading-loose text-ink-soft">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
