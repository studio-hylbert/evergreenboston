/**
 * Renders markdown converted to HTML. The spacing is set here rather than with
 * a typography plugin so the Korean line height matches the rest of the site.
 */
export default function Prose({ html }: { html: string }) {
  return (
    <div
      className="
        max-w-2xl leading-loose text-ink
        [&_h2]:mt-12 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-forest-deep
        [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-forest
        [&_p]:mt-4
        [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1.5
        [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-4
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
