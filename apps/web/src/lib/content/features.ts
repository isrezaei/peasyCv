/** Icon keys map to inline SVGs in components/ui/Icon.tsx (no icon-font dep). */
export type IconKey =
  | "rtl"
  | "template"
  | "preview"
  | "pdf"
  | "ats"
  | "palette"
  | "dashboard"
  | "shield"
  | "bilingual"
  | "spark";

export type Feature = {
  icon: IconKey;
  title: string;
  desc: string;
  tone: "brand" | "orange" | "lavender" | "turquoise" | "red";
};

/** The real, shipped feature set (home highlights + /features grid). */
export const features: Feature[] = [
  {
    icon: "rtl",
    title: "فارسی و راست‌به‌چپ، از پایه",
    desc: "چیدمان راست‌به‌چپ، اعداد و تاریخ فارسی، و ترکیب درست واژه‌های انگلیسی درون متن فارسی — بدون به‌هم‌ریختگی.",
    tone: "brand",
  },
  {
    icon: "template",
    title: "قالب‌های حرفه‌ای",
    desc: "چند قالب متنوع از ساده و مینیمال تا ستونی و رنگی؛ همه برای فارسی و انگلیسی بهینه شده‌اند.",
    tone: "lavender",
  },
  {
    icon: "preview",
    title: "پیش‌نمایش زنده",
    desc: "هر تغییری که می‌دهید بی‌درنگ روی صفحهٔ A4 دیده می‌شود؛ دیگر لازم نیست حدس بزنید خروجی چطور می‌شود.",
    tone: "turquoise",
  },
  {
    icon: "pdf",
    title: "خروجی PDF باکیفیت چاپ",
    desc: "PDF برداری با متن قابل‌انتخاب و حاشیهٔ استاندارد A4؛ آمادهٔ ارسال به کارفرما یا چاپ.",
    tone: "orange",
  },
  {
    icon: "ats",
    title: "حالت سازگار با ATS",
    desc: "ساختار متنی تمیز و عناوین استاندارد تا رزومه‌تان از فیلترهای خودکار استخدام عبور کند.",
    tone: "brand",
  },
  {
    icon: "palette",
    title: "رنگ و تم دلخواه",
    desc: "رنگ تأکیدی، فاصله‌ها و سبک بخش‌ها را متناسب با حرفه و سلیقهٔ خود تنظیم کنید.",
    tone: "red",
  },
  {
    icon: "dashboard",
    title: "داشبورد چند رزومه‌ای",
    desc: "برای هر موقعیت شغلی یک نسخهٔ جداگانه بسازید و همه را از یک داشبورد مدیریت کنید.",
    tone: "lavender",
  },
  {
    icon: "bilingual",
    title: "دوزبانه (فارسی/انگلیسی)",
    desc: "رزومهٔ فارسی راست‌به‌چپ یا CV انگلیسی چپ‌به‌راست؛ یا هر دو نسخه در کنار هم.",
    tone: "turquoise",
  },
];
