"use client";

import { Accordion } from "@heroui/react";
import type { QA } from "@/lib/content/faq";

/**
 * FAQ accordion (HeroUI Accordion → React Aria Disclosure group). Accessible
 * keyboard/screen-reader behaviour out of the box; the chevron Indicator is a
 * directional icon that mirrors correctly under the fa-IR RTL locale.
 */
export function FaqAccordion({ items }: { items: QA[] }) {
  return (
    <Accordion className="divide-y divide-ink-10 border-y border-ink-10">
      {items.map((it, i) => (
        <Accordion.Item key={i} id={`faq-${i}`} className="py-1">
          <Accordion.Heading>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-4 py-5 text-start text-h4 font-semibold text-ink">
              <span>{it.q}</span>
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="pb-5 text-p2 leading-8 text-ink-60">
              {it.a}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
