/**
 * Navigation lives in code rather than in `content/`, because each entry pairs a
 * label with a route that only exists if a matching directory does. A CMS
 * editor renaming a route would produce a dead link with no warning; renaming a
 * label is a one-line change here.
 */
export type NavItem = { href: string; label: string };

export const nav: NavItem[] = [
  { href: "/about", label: "교회 소개" },
  { href: "/worship", label: "예배" },
  { href: "/sermons", label: "설교 영상" },
  { href: "/community", label: "공동체" },
  { href: "/visit", label: "찾아오시는 길" },
];
