/** Primary navigation shown in the header and echoed in the footer. */
export const primaryNav = [
  { href: "/features", label: "امکانات" },
  { href: "/templates", label: "قالب‌ها" },
  { href: "/resume-samples", label: "نمونه رزومه" },
  { href: "/pricing", label: "تعرفه" },
  { href: "/blog", label: "وبلاگ" },
] as const;

/** Footer column groups. */
export const footerNav = [
  {
    title: "محصول",
    links: [
      { href: "/features", label: "امکانات" },
      { href: "/templates", label: "قالب‌ها" },
      { href: "/pricing", label: "تعرفه" },
      { href: "/resume-ats", label: "رزومهٔ سازگار با ATS" },
    ],
  },
  {
    title: "کاربردها",
    links: [
      { href: "/persian-resume", label: "ساخت رزومهٔ فارسی" },
      { href: "/english-resume", label: "ساخت رزومهٔ انگلیسی" },
      { href: "/resume-templates-persian", label: "قالب رزومهٔ فارسی" },
      { href: "/resume-samples", label: "نمونه رزومه بر اساس شغل" },
    ],
  },
  {
    title: "یادگیری",
    links: [
      { href: "/blog", label: "وبلاگ" },
      { href: "/faq", label: "پرسش‌های متداول" },
      { href: "/about", label: "دربارهٔ ما" },
      { href: "/contact", label: "تماس با ما" },
    ],
  },
  {
    title: "اعتماد",
    links: [
      { href: "/privacy", label: "حریم خصوصی" },
      { href: "/terms", label: "قوانین و مقررات" },
    ],
  },
] as const;
