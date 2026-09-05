import Link from "next/link";
import ChurchLogo from "./ChurchLogo";
import site from "@/content/site.json";
import worship from "@/content/worship.json";
import { navFor } from "@/lib/nav";
import { freshnessFor } from "@/lib/freshness";
import { formatDateTime } from "@/lib/format";
import { ui } from "@/lib/ui";
import { t, type Locale } from "@/lib/i18n";
import SocialIcon from "./SocialIcon";
import { socialLinks } from "@/lib/social";

export default function SiteFooter({ locale }: { locale: Locale }) {
  const strings = ui[locale];
  const freshness = freshnessFor(locale);

  return (
    <footer className="mt-24 bg-deep text-on-deep">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <ChurchLogo className="h-7 w-7" />
            <span className="font-serif text-lg">{t(site.name, locale)}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-sage/70">
            {t(site.denomination.name, locale)}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-sage">{strings.footer.visit}</h2>
          <address className="mt-3 text-sm not-italic leading-relaxed text-sage/80">
            {site.address.street}
            <br />
            {site.address.city}, {site.address.state} {site.address.zip}
          </address>
          {site.contact.phone ? (
            <a
              href={`tel:${site.contact.phoneDial}`}
              className="mt-3 block text-sm text-sage/80 hover:text-white"
            >
              {site.contact.phone}
            </a>
          ) : null}
          <a
            href={site.address.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-sage underline underline-offset-4 hover:text-white"
          >
            {strings.footer.mapLink}
          </a>
        </div>

        <div>
          <h2 className="text-sm font-medium text-sage">{strings.footer.times}</h2>
          <ul className="mt-3 space-y-2 text-sm text-sage/80">
            {worship.services.map((service) => (
              <li key={service.id}>
                {t(service.name, locale)} · {t(service.day, locale)} {t(service.time, locale)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium text-sage">{strings.footer.browse}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {navFor(locale).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sage/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/*
        When each outside source last changed. It is here for whoever looks
        after the site: if a sermon went up on Sunday and this still reads three
        weeks ago, the automation has stopped and the page says so without
        anyone opening a workflow log. See lib/freshness.ts for why this is the
        date the content changed rather than the date it was last checked.
      */}
      {freshness.length > 0 ? (
        <div className="border-t border-sage/15">
          <div className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-4 text-xs text-sage/45">
            <span>{strings.footer.updated}</span>
            {freshness.map((source) => (
              <span key={source.label}>
                {source.label} {formatDateTime(source.at, locale)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="border-t border-sage/15">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 text-sm text-sage/60 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-3">
            {socialLinks.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white"
                >
                  <SocialIcon name={link.key} className="h-4 w-4" />
                  {t(link.label, locale)}
                </a>
              </li>
            ))}
          </ul>
          <p>© {new Date().getFullYear()} {site.name.en}</p>
        </div>
      </div>
    </footer>
  );
}
