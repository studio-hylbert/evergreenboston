import type { SocialKey } from "@/components/SocialIcon";
import type { Localized } from "./i18n";
import site from "@/content/site.json";

/**
 * The order the channels appear in, and what to call each one.
 *
 * Instagram leads because it is where the church posts most often and what
 * they asked to have shown clearly. Brand names are left untranslated; only
 * the two that are a description rather than a name have a Korean form.
 */
export type SocialLink = {
  key: SocialKey;
  href: string;
  label: Localized;
};

export const socialLinks: SocialLink[] = [
  {
    key: "instagram",
    href: site.social.instagram,
    label: { ko: "Instagram", en: "Instagram" },
  },
  {
    key: "youtube",
    href: site.social.youtube,
    label: { ko: "YouTube", en: "YouTube" },
  },
  {
    key: "facebook",
    href: site.social.facebook,
    label: { ko: "Facebook", en: "Facebook" },
  },
  {
    key: "linktree",
    href: site.social.linktree,
    label: { ko: "Linktree", en: "Linktree" },
  },
  {
    key: "kakaotalk",
    href: site.social.kakaoOpenChat,
    label: { ko: "오픈카톡", en: "KakaoTalk" },
  },
  {
    key: "strava",
    href: site.social.strava,
    label: { ko: "Runner's Club", en: "Runner's Club" },
  },
];
