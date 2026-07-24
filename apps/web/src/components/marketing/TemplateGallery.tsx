"use client";

import { Modal, Tabs } from "@heroui/react";
import { ResumePreview } from "@/components/marketing/ResumePreview";
import { Cta } from "@/components/ui/Cta";
import {
  templateCategories,
  templates,
  type Template,
} from "@/lib/content/templates";
import { site } from "@/lib/site";

/**
 * Template gallery: HeroUI Tabs filter categories (React Aria — arrow-key
 * navigable, RTL-aware), and each card opens a HeroUI Modal with a larger
 * preview. Both components verified to mirror correctly under the fa-IR locale.
 */
export function TemplateGallery() {
  return (
    <Tabs defaultSelectedKey="all">
      <Tabs.List
        aria-label="دسته‌بندی قالب‌ها"
        className="mb-8 inline-flex flex-wrap gap-2 rounded-full border border-ink-10 bg-tint p-1"
      >
        {templateCategories.map((c) => (
          <Tabs.Tab
            key={c.id}
            id={c.id}
            className="cursor-pointer rounded-full px-4 py-1.5 text-p3 font-semibold text-ink-60 outline-none data-[selected]:bg-foreground data-[selected]:text-background"
          >
            {c.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {templateCategories.map((c) => (
        <Tabs.Panel key={c.id} id={c.id}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {templates
              .filter((t) => c.id === "all" || t.category === c.id)
              .map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
          </div>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <div className="group">
      <Modal>
        <Modal.Trigger>
          <button
            type="button"
            aria-label={`پیش‌نمایش قالب ${template.name}`}
            className="block w-full rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ResumePreview
              variant={template.variant}
              accent={template.accent}
              className="transition-transform group-hover:-translate-y-1"
            />
          </button>
        </Modal.Trigger>
        <Modal.Backdrop className="fixed inset-0 z-50 bg-[rgba(11,9,7,0.4)] backdrop-blur-sm">
          <Modal.Container
            placement="center"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Modal.Dialog className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-[0_10px_40px_rgba(11,9,7,0.18)] outline-none">
              <Modal.Header className="mb-4 flex items-center justify-between">
                <Modal.Heading className="text-h4 font-bold text-ink">
                  قالب {template.name}
                </Modal.Heading>
                <Modal.CloseTrigger className="rounded-full p-1 text-ink-40 hover:text-ink" />
              </Modal.Header>
              <Modal.Body>
                <div className="mx-auto max-w-[260px]">
                  <ResumePreview
                    variant={template.variant}
                    accent={template.accent}
                  />
                </div>
                <p className="mt-4 text-p3 leading-7 text-ink-60">
                  {template.desc}
                </p>
              </Modal.Body>
              <Modal.Footer className="mt-6">
                <Cta
                  href={site.studioUrl}
                  external
                  variant="primary"
                  className="w-full"
                >
                  استفاده از این قالب
                </Cta>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <div className="mt-3 flex items-center justify-between px-1">
        <p className="text-p3 font-bold text-ink">{template.name}</p>
        <span className="text-p3 text-ink-40">
          {template.category === "simple"
            ? "ساده"
            : template.category === "column"
              ? "ستونی"
              : "رنگی"}
        </span>
      </div>
    </div>
  );
}
