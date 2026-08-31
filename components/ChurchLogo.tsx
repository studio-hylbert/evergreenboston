import { asset } from "@/lib/asset";

/**
 * The church's own mark: a tree whose trunk is a cross, rooted in an open
 * Bible. Taken from their YouTube channel avatar — see README.md, which notes
 * that the original artwork should replace it.
 *
 * The white ground has been keyed out, so the outlined leaves read as the page
 * behind them. That works on either scheme.
 */
export default function ChurchLogo({ className }: { className?: string }) {
  return (
    <img
      src={asset("/images/logo.png")}
      alt=""
      width={256}
      height={256}
      className={className}
    />
  );
}
