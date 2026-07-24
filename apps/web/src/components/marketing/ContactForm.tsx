"use client";

import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { site } from "@/lib/site";

/**
 * Contact form — HeroUI form controls (React Aria: labels auto-associate,
 * required/validation announced, RTL from the fa-IR locale). The marketing site
 * is intentionally stateless (§5), so submit composes a mailto: to the support
 * address and shows a confirmation rather than posting to a backend.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = encodeURIComponent(`تماس از سایت — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${site.contactEmail}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-ink-10 bg-tint p-8 text-center"
      >
        <h2 className="text-h4 font-bold text-ink">پیام شما آماده شد</h2>
        <p className="mt-2 text-p2 text-ink-60">
          برنامهٔ ایمیل شما باز شد تا پیام را ارسال کنید. اگر باز نشد، مستقیم به{" "}
          <a
            className="text-brand underline underline-offset-2"
            href={`mailto:${site.contactEmail}`}
          >
            {site.contactEmail}
          </a>{" "}
          بنویسید.
        </p>
      </div>
    );
  }

  return (
    <Form onSubmit={onSubmit} className="space-y-5">
      <TextField name="name" type="text" isRequired className="w-full">
        <Label className="mb-1.5 block text-p3 font-semibold text-ink">
          نام و نام خانوادگی
        </Label>
        <Input
          placeholder="نام شما"
          className="w-full rounded-xl border border-ink-10 bg-surface px-4 py-2.5 text-p2 outline-none focus-visible:border-brand"
        />
      </TextField>

      <TextField name="email" type="email" isRequired className="w-full">
        <Label className="mb-1.5 block text-p3 font-semibold text-ink">
          ایمیل
        </Label>
        <Input
          dir="ltr"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-ink-10 bg-surface px-4 py-2.5 text-p2 outline-none focus-visible:border-brand"
        />
      </TextField>

      <TextField name="message" isRequired className="w-full">
        <Label className="mb-1.5 block text-p3 font-semibold text-ink">
          پیام
        </Label>
        <TextArea
          rows={5}
          placeholder="چطور می‌توانیم کمک کنیم؟"
          className="w-full resize-y rounded-xl border border-ink-10 bg-surface px-4 py-2.5 text-p2 outline-none focus-visible:border-brand"
        />
      </TextField>

      <Button type="submit" variant="primary" size="lg" className="w-full">
        ارسال پیام
      </Button>
    </Form>
  );
}
