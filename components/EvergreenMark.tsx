/**
 * A stylised evergreen, standing in for the wordmark until the church supplies
 * a logo. Drawn rather than imported so it inherits `currentColor` and stays
 * crisp at every size.
 */
export default function EvergreenMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.5 7.5 9h2.6L6.4 14.2h3.2L5.8 19.5h12.4l-3.8-5.3h3.2L13.9 9h2.6z" />
      <path d="M12 19.5v2" />
    </svg>
  );
}
