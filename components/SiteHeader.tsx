"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import EvergreenMark from "./EvergreenMark";
import site from "@/content/site.json";
import { nav } from "@/lib/nav";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /* `trailingSlash` means the current path arrives as `/worship/`. */
  const isCurrent = (href: string) => pathname.replace(/\/$/, "") === href;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-forest"
          onClick={() => setOpen(false)}
        >
          <EvergreenMark className="h-7 w-7" />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-semibold">{site.name.ko}</span>
            <span className="text-[0.68rem] tracking-wide text-ink-soft">
              {site.name.en}
            </span>
          </span>
        </Link>

        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={
                    isCurrent(item.href)
                      ? "text-forest underline decoration-brass decoration-2 underline-offset-8"
                      : "text-ink-soft hover:text-forest"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 p-2 text-forest md:hidden"
        >
          <span className="sr-only">메뉴 {open ? "닫기" : "열기"}</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="주 메뉴" className="border-t border-ink/10 md:hidden">
          <ul className="mx-auto max-w-5xl px-6 py-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={`block py-3 text-sm ${
                    isCurrent(item.href) ? "text-forest" : "text-ink-soft"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
