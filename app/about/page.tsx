import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";
import { loadPage } from "@/lib/content";
import site from "@/content/site.json";

const page = loadPage("about");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader title={page.title} description={page.description} />
      <div className="mx-auto max-w-5xl px-6 py-14">
        <Prose html={page.html} />

        <dl className="mt-14 max-w-2xl divide-y divide-ink/10 border-t border-ink/10 text-sm">
          <div className="flex gap-6 py-4">
            <dt className="w-24 shrink-0 text-ink-soft">교단</dt>
            <dd>
              <a
                href={site.denomination.url}
                target="_blank"
                rel="noreferrer"
                className="text-forest underline underline-offset-4"
              >
                {site.denomination.name}
              </a>
            </dd>
          </div>
          <div className="flex gap-6 py-4">
            <dt className="w-24 shrink-0 text-ink-soft">예배 장소</dt>
            <dd>
              {site.address.street}, {site.address.city}, {site.address.state} {site.address.zip}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
