/**
 * A row of cards that scrolls sideways instead of wrapping.
 *
 * A grid solves overflow by growing downwards, so three sermons become three
 * stacked cards on a phone and the page below them is pushed off the screen.
 * Whatever the church has posted, this section stays the same height, and a
 * fourth item costs a swipe rather than a scroll past everything else.
 *
 * The rail bleeds past its container's padding so a card can sit half-visible
 * at the edge — which is what tells a reader there is more to the right without
 * having to draw an arrow saying so.
 */
export default function CardRail({
  label,
  children,
}: {
  /** Names the scrollable region, which is otherwise unlabelled to a screen reader. */
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      /*
       * `tabIndex` because a scroll container that cannot be focused cannot be
       * scrolled from the keyboard: without it the arrow keys have nothing to
       * act on and the cards past the edge are unreachable.
       */
      tabIndex={0}
      role="region"
      aria-label={label}
      className="-mx-6 overflow-x-auto px-6 pb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
    >
      <ul className="flex snap-x snap-mandatory gap-6">{children}</ul>
    </div>
  );
}

/**
 * One card in the rail.
 *
 * The width is fixed rather than fractional: cards that divide the viewport
 * would leave nothing peeking at the edge, and the rail would read as a grid
 * that had lost its second row.
 */
export function RailItem({ children }: { children: React.ReactNode }) {
  return <li className="w-[16rem] shrink-0 snap-start sm:w-[19rem]">{children}</li>;
}
