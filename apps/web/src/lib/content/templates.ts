export type TemplateCategory = "simple" | "column" | "colorful";

export type Template = {
  id: string;
  name: string;
  category: TemplateCategory;
  variant: "minimal" | "column" | "band";
  accent: string;
  desc: string;
};

export const templateCategories: { id: "all" | TemplateCategory; label: string }[] =
  [
    { id: "all", label: "همه" },
    { id: "simple", label: "ساده" },
    { id: "column", label: "ستونی" },
    { id: "colorful", label: "رنگی" },
  ];

export const templates: Template[] = [
  {
    id: "roshan",
    name: "روشن",
    category: "simple",
    variant: "minimal",
    accent: "#2677ff",
    desc: "قالب مینیمال و تک‌ستونه؛ بهترین انتخاب برای رزومهٔ سازگار با ATS.",
  },
  {
    id: "matn",
    name: "متن",
    category: "simple",
    variant: "minimal",
    accent: "#3c3a39",
    desc: "کاملاً متنی و بدون رنگ اضافه؛ تمیز و رسمی برای مشاغل سنتی.",
  },
  {
    id: "sotoon",
    name: "ستون",
    category: "column",
    variant: "column",
    accent: "#817fff",
    desc: "دوستونه با نوار کناری برای مهارت‌ها و اطلاعات تماس.",
  },
  {
    id: "kenareh",
    name: "کناره",
    category: "column",
    variant: "column",
    accent: "#79deeb",
    desc: "نوار کناری رنگی و بخش اصلی جادار برای سابقهٔ شغلی.",
  },
  {
    id: "sarband",
    name: "سربند",
    category: "colorful",
    variant: "band",
    accent: "#ff7300",
    desc: "سربرگ رنگی چشم‌نواز؛ مناسب مشاغل خلاق و بازاریابی.",
  },
  {
    id: "goltcheh",
    name: "گلچه",
    category: "colorful",
    variant: "band",
    accent: "#f49eff",
    desc: "ترکیب رنگ ملایم و مدرن برای رزومه‌ای متمایز.",
  },
];
