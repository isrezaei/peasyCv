import {
  getActiveOccupationCategory,
  type OccupationCategoryId,
} from "./occupationCategories";

/**
 * Per-category default EXAMPLE content — the strings behind every
 * `t.*Placeholder` the resume shows for an empty field. These are placeholders
 * only: they flow through the existing placeholder mechanism (never seeded as
 * real values, cleared by typing, pruned from print), so switching category can
 * never touch anything the user actually typed.
 *
 * Conventions mirror the i18n dictionary exactly: most strings carry the
 * «مثال:» prefix; `personalJobTitle`, `skillGroupName` and `skillName` are bare
 * sample values (personal info and skills drop the prefix by design).
 *
 * «آزاد» (azad) holds the app's original generic defaults, byte-identical to
 * the strings that used to live inline in fa.ts. Adding a category later is
 * data-only: add its id in occupationCategories.ts, its label in fa.ts, and a
 * set here.
 */
export interface OccupationPlaceholderSet {
  personalJobTitle: string;
  summary: string;
  experienceJobTitle: string;
  experienceCompany: string;
  experienceProjectDescription: string;
  experienceResponsibility: string;
  skillGroupName: string;
  skillName: string;
  educationDegree: string;
  educationUniversity: string;
  educationAchievements: string;
  projectName: string;
  projectRole: string;
  projectDescription: string;
  certificationName: string;
  certificationIssuer: string;
  achievementTitle: string;
  achievementDescription: string;
}

const CATEGORY_PLACEHOLDERS: Record<OccupationCategoryId, OccupationPlaceholderSet> = {
  "software-it": {
    personalJobTitle: "توسعه‌دهنده وب",
    summary:
      "مثال: توسعه‌دهندهٔ وب با ۵ سال تجربه در طراحی و پیاده‌سازی سرویس‌های مقیاس‌پذیر و بهینه‌سازی سامانه‌های پرترافیک.",
    experienceJobTitle: "مثال: توسعه‌دهنده فرانت‌اند",
    experienceCompany: "مثال: شرکت نرم‌افزاری دانش‌بنیان",
    experienceProjectDescription:
      "مثال: بازطراحی پنل مدیریت فروشگاه اینترنتی با بیش از ده هزار کاربر فعال.",
    experienceResponsibility: "مثال: توسعه و نگهداری وب‌اپلیکیشن‌های مقیاس‌پذیر.",
    skillGroupName: "فرانت‌اند",
    skillName: "JavaScript",
    educationDegree: "مثال: کارشناسی مهندسی کامپیوتر",
    educationUniversity: "مثال: دانشگاه صنعتی امیرکبیر",
    educationAchievements: "مثال: رتبهٔ اول دوره و دریافت بورسیهٔ تحصیلی.",
    projectName: "مثال: اپلیکیشن مدیریت مالی شخصی",
    projectRole: "مثال: توسعه‌دهنده ارشد",
    projectDescription: "مثال: طراحی و پیاده‌سازی فروشگاه اینترنتی با React و Node.js.",
    certificationName: "مثال: گواهینامه معماری نرم‌افزار",
    certificationIssuer: "مثال: سازمان فنی و حرفه‌ای",
    achievementTitle: "مثال: کاهش ۴۰٪ زمان بارگذاری صفحات محصول",
    achievementDescription: "مثال: بهینه‌سازی کوئری‌ها و کش سمت سرور در سامانهٔ اصلی شرکت.",
  },
  "sales-marketing": {
    personalJobTitle: "کارشناس دیجیتال مارکتینگ",
    summary:
      "مثال: کارشناس فروش و بازاریابی با ۵ سال تجربه در توسعهٔ بازار، مدیریت کمپین‌های تبلیغاتی و رشد فروش سازمانی.",
    experienceJobTitle: "مثال: کارشناس فروش",
    experienceCompany: "مثال: شرکت پخش مواد غذایی",
    experienceProjectDescription:
      "مثال: راه‌اندازی کمپین تبلیغاتی محصول جدید با بازگشت سرمایهٔ سه‌برابری.",
    experienceResponsibility: "مثال: مذاکره با مشتریان سازمانی و عقد قراردادهای فروش.",
    skillGroupName: "بازاریابی دیجیتال",
    skillName: "سئو (SEO)",
    educationDegree: "مثال: کارشناسی مدیریت بازرگانی",
    educationUniversity: "مثال: دانشگاه علامه طباطبایی",
    educationAchievements: "مثال: پروژهٔ پایانی در حوزهٔ رفتار مصرف‌کننده با نمرهٔ عالی.",
    projectName: "مثال: کمپین بازاریابی محتوایی برند",
    projectRole: "مثال: مدیر کمپین",
    projectDescription: "مثال: طراحی قیف فروش و افزایش نرخ تبدیل فروشگاه آنلاین به ۸٪.",
    certificationName: "مثال: گواهینامه بازاریابی دیجیتال",
    certificationIssuer: "مثال: آکادمی بازاریابی دیجیتال",
    achievementTitle: "مثال: افزایش ۳۵٪ فروش سالانه منطقه",
    achievementDescription: "مثال: توسعهٔ شبکهٔ نمایندگی‌ها از ۱۲ به ۳۰ شهر در دو سال.",
  },
  "finance-accounting": {
    personalJobTitle: "کارشناس حسابداری",
    summary:
      "مثال: حسابدار با ۵ سال تجربه در حسابداری مالی، تهیهٔ صورت‌های مالی و امور مالیاتی شرکت‌های بازرگانی.",
    experienceJobTitle: "مثال: کارشناس حسابداری مالی",
    experienceCompany: "مثال: شرکت تولیدی و بازرگانی",
    experienceProjectDescription:
      "مثال: استقرار نرم‌افزار حسابداری جدید و انتقال کامل اسناد دو سال مالی.",
    experienceResponsibility: "مثال: تهیهٔ صورت‌های مالی و گزارش‌های فصلی مدیریت.",
    skillGroupName: "نرم‌افزارهای مالی",
    skillName: "اکسل پیشرفته",
    educationDegree: "مثال: کارشناسی حسابداری",
    educationUniversity: "مثال: دانشگاه شهید بهشتی",
    educationAchievements: "مثال: رتبهٔ برتر دوره و عضویت در انجمن علمی حسابداری.",
    projectName: "مثال: پیاده‌سازی بودجه‌ریزی عملیاتی",
    projectRole: "مثال: کارشناس ارشد مالی",
    projectDescription: "مثال: طراحی داشبورد گزارش‌گیری مالی مدیریت با اکسل و Power BI.",
    certificationName: "مثال: گواهینامه حسابداری مالیاتی",
    certificationIssuer: "مثال: انجمن حسابداران خبره ایران",
    achievementTitle: "مثال: کاهش ۲۰٪ هزینه‌های مالی شرکت",
    achievementDescription:
      "مثال: اصلاح فرایند وصول مطالبات و کاهش میانگین دورهٔ وصول به ۴۵ روز.",
  },
  "admin-hr": {
    personalJobTitle: "کارشناس منابع انسانی",
    summary:
      "مثال: کارشناس اداری و منابع انسانی با ۵ سال تجربه در جذب و استخدام، جبران خدمات و بهبود فرایندهای سازمانی.",
    experienceJobTitle: "مثال: کارشناس جذب و استخدام",
    experienceCompany: "مثال: شرکت خدمات فناوری",
    experienceProjectDescription:
      "مثال: طراحی و اجرای فرایند جدید ارزیابی عملکرد برای ۱۲۰ نفر پرسنل.",
    experienceResponsibility: "مثال: برگزاری مصاحبه‌های استخدامی و مدیریت فرایند جذب.",
    skillGroupName: "نرم‌افزارهای اداری",
    skillName: "Microsoft Office",
    educationDegree: "مثال: کارشناسی مدیریت دولتی",
    educationUniversity: "مثال: دانشگاه تهران",
    educationAchievements: "مثال: پروژهٔ پایانی در حوزهٔ رضایت شغلی کارکنان.",
    projectName: "مثال: استقرار سامانه حضور و غیاب",
    projectRole: "مثال: مسئول پروژه",
    projectDescription: "مثال: دیجیتالی‌کردن پرونده‌های پرسنلی و کاهش زمان پاسخ‌گویی اداری.",
    certificationName: "مثال: گواهینامه مدیریت منابع انسانی",
    certificationIssuer: "مثال: سازمان مدیریت صنعتی",
    achievementTitle: "مثال: کاهش ۳۰٪ نرخ خروج کارکنان",
    achievementDescription: "مثال: طراحی مسیر رشد شغلی و برنامهٔ آموزشی سالانه برای تیم‌ها.",
  },
  "design-creative": {
    personalJobTitle: "طراح رابط کاربری",
    summary:
      "مثال: طراح گرافیک و رابط کاربری با ۵ سال تجربه در طراحی هویت بصری برند و محصولات دیجیتال.",
    experienceJobTitle: "مثال: طراح گرافیک ارشد",
    experienceCompany: "مثال: آژانس تبلیغاتی خلاق",
    experienceProjectDescription:
      "مثال: بازطراحی هویت بصری برند و افزایش تعامل شبکه‌های اجتماعی.",
    experienceResponsibility: "مثال: طراحی رابط کاربری اپلیکیشن موبایل از تحقیق تا تحویل.",
    skillGroupName: "نرم‌افزارهای طراحی",
    skillName: "Figma",
    educationDegree: "مثال: کارشناسی ارتباط تصویری",
    educationUniversity: "مثال: دانشگاه هنر تهران",
    educationAchievements: "مثال: برگزیدهٔ نمایشگاه سالانهٔ دانشجویی.",
    projectName: "مثال: طراحی هویت بصری کافه",
    projectRole: "مثال: طراح ارشد",
    projectDescription: "مثال: طراحی لوگو، پالت رنگی و ست اداری کامل برای برند نوپا.",
    certificationName: "مثال: گواهینامه طراحی تجربه کاربری (UX)",
    certificationIssuer: "مثال: آکادمی طراحی دیجیتال",
    achievementTitle: "مثال: برندهٔ جایزهٔ طراحی سال",
    achievementDescription:
      "مثال: کسب رتبهٔ نخست بخش هویت بصری در جشنوارهٔ طراحی گرافیک.",
  },
  "content-media": {
    personalJobTitle: "کارشناس تولید محتوا",
    summary:
      "مثال: نویسنده و کارشناس تولید محتوا با ۵ سال تجربه در نگارش محتوای تخصصی، سئو و مدیریت شبکه‌های اجتماعی.",
    experienceJobTitle: "مثال: کارشناس تولید محتوا",
    experienceCompany: "مثال: رسانه آنلاین خبری",
    experienceProjectDescription:
      "مثال: راه‌اندازی بلاگ تخصصی برند و رساندن بازدید ماهانه به ۲۰۰ هزار.",
    experienceResponsibility:
      "مثال: نگارش و ویرایش مقالات تخصصی بهینه‌شده برای موتورهای جستجو.",
    skillGroupName: "مهارت‌های محتوایی",
    skillName: "سئو محتوایی",
    educationDegree: "مثال: کارشناسی علوم ارتباطات",
    educationUniversity: "مثال: دانشگاه علامه طباطبایی",
    educationAchievements: "مثال: سردبیر نشریهٔ دانشجویی دانشکده.",
    projectName: "مثال: پادکست هفتگی کسب‌وکار",
    projectRole: "مثال: نویسنده و سردبیر",
    projectDescription:
      "مثال: تولید ۵۰ قسمت پادکست با میانگین ده هزار شنونده در هر قسمت.",
    certificationName: "مثال: گواهینامه بازاریابی محتوایی",
    certificationIssuer: "مثال: آکادمی محتوا",
    achievementTitle: "مثال: رشد سه‌برابری دنبال‌کنندگان شبکه‌های اجتماعی برند",
    achievementDescription: "مثال: طراحی تقویم محتوایی و افزایش نرخ تعامل به ۷٪.",
  },
  "engineering-technical": {
    personalJobTitle: "مهندس عمران",
    summary:
      "مثال: مهندس با ۵ سال تجربه در طراحی، اجرا و نظارت پروژه‌های صنعتی و عمرانی.",
    experienceJobTitle: "مثال: مهندس دفتر فنی",
    experienceCompany: "مثال: شرکت مهندسی و ساخت",
    experienceProjectDescription:
      "مثال: نظارت بر اجرای مجتمع مسکونی هشت‌طبقه از فونداسیون تا نازک‌کاری.",
    experienceResponsibility: "مثال: تهیهٔ نقشه‌های اجرایی و برآورد احجام و متره.",
    skillGroupName: "نرم‌افزارهای مهندسی",
    skillName: "AutoCAD",
    educationDegree: "مثال: کارشناسی مهندسی عمران",
    educationUniversity: "مثال: دانشگاه صنعتی شریف",
    educationAchievements: "مثال: پروژهٔ پایانی در حوزهٔ سازه‌های فولادی با نمرهٔ عالی.",
    projectName: "مثال: طراحی سازه سوله صنعتی",
    projectRole: "مثال: مهندس طراح",
    projectDescription: "مثال: طراحی و کنترل سازهٔ سولهٔ دوهزار متری با ETABS.",
    certificationName: "مثال: پروانه اشتغال به کار مهندسی",
    certificationIssuer: "مثال: سازمان نظام مهندسی ساختمان",
    achievementTitle: "مثال: تحویل پروژه دو ماه زودتر از برنامه",
    achievementDescription: "مثال: بهینه‌سازی برنامهٔ زمان‌بندی و کاهش ۱۵٪ هزینهٔ اجرا.",
  },
  "health-medical": {
    personalJobTitle: "کارشناس پرستاری",
    summary:
      "مثال: کارشناس پرستاری با ۵ سال تجربه در بخش‌های مراقبت ویژه و اورژانس بیمارستان‌های آموزشی.",
    experienceJobTitle: "مثال: پرستار بخش مراقبت ویژه",
    experienceCompany: "مثال: بیمارستان آموزشی درمانی",
    experienceProjectDescription:
      "مثال: همکاری در استقرار سامانهٔ پروندهٔ الکترونیک سلامت در بخش.",
    experienceResponsibility: "مثال: مراقبت از بیماران بدحال و پایش علائم حیاتی.",
    skillGroupName: "مهارت‌های بالینی",
    skillName: "احیای قلبی‌ریوی (CPR)",
    educationDegree: "مثال: کارشناسی پرستاری",
    educationUniversity: "مثال: دانشگاه علوم پزشکی تهران",
    educationAchievements: "مثال: رتبهٔ برتر آزمون صلاحیت حرفه‌ای.",
    projectName: "مثال: طرح آموزش سلامت جامعه",
    projectRole: "مثال: مسئول آموزش",
    projectDescription: "مثال: برگزاری کارگاه‌های کمک‌های اولیه برای ۳۰۰ نفر.",
    certificationName: "مثال: گواهینامه احیای پیشرفته (ACLS)",
    certificationIssuer: "مثال: مرکز آموزش مداوم دانشگاه",
    achievementTitle: "مثال: پرستار نمونه سال بیمارستان",
    achievementDescription: "مثال: کسب رضایت ۹۵٪ بیماران در ارزیابی سالانهٔ بخش.",
  },
  "education-training": {
    personalJobTitle: "دبیر ریاضی",
    summary:
      "مثال: معلم و مدرس با ۵ سال تجربه در تدریس، طراحی محتوای آموزشی و برگزاری کلاس‌های حضوری و آنلاین.",
    experienceJobTitle: "مثال: دبیر ریاضی دبیرستان",
    experienceCompany: "مثال: مجموعه آموزشی غیردولتی",
    experienceProjectDescription:
      "مثال: طراحی دورهٔ آنلاین آمادگی کنکور با ۴۰۰ شرکت‌کننده.",
    experienceResponsibility:
      "مثال: تدریس ریاضی پایهٔ نهم تا دوازدهم و طراحی آزمون‌های ماهانه.",
    skillGroupName: "مهارت‌های آموزشی",
    skillName: "تدریس آنلاین",
    educationDegree: "مثال: کارشناسی دبیری ریاضی",
    educationUniversity: "مثال: دانشگاه فرهنگیان",
    educationAchievements: "مثال: رتبهٔ برتر دوره و کسب عنوان معلم راهنمای نمونه.",
    projectName: "مثال: بستهٔ آموزشی ریاضی نهم",
    projectRole: "مثال: مؤلف و مدرس",
    projectDescription: "مثال: تألیف جزوه و ضبط ۶۰ ساعت ویدئوی آموزشی گام‌به‌گام.",
    certificationName: "مثال: گواهینامه روش‌های نوین تدریس",
    certificationIssuer: "مثال: دانشگاه فرهنگیان",
    achievementTitle: "مثال: معلم نمونه منطقه",
    achievementDescription:
      "مثال: ارتقای میانگین نمرات کلاس به بالای ۱۸ در دو سال متوالی.",
  },
  "customer-support": {
    personalJobTitle: "کارشناس پشتیبانی مشتریان",
    summary:
      "مثال: کارشناس امور مشتریان با ۵ سال تجربه در پشتیبانی تلفنی و آنلاین و مدیریت تجربهٔ مشتری.",
    experienceJobTitle: "مثال: کارشناس امور مشتریان",
    experienceCompany: "مثال: فروشگاه اینترنتی بزرگ",
    experienceProjectDescription:
      "مثال: راه‌اندازی پایگاه دانش پاسخ‌های پرتکرار و کاهش تماس‌های ورودی.",
    experienceResponsibility:
      "مثال: پاسخ‌گویی به مشتریان و پیگیری درخواست‌ها تا حل کامل مشکل.",
    skillGroupName: "مهارت‌های ارتباطی",
    skillName: "مدیریت CRM",
    educationDegree: "مثال: کارشناسی مدیریت بازرگانی",
    educationUniversity: "مثال: دانشگاه پیام نور",
    educationAchievements: "مثال: پروژهٔ پایانی در حوزهٔ رضایت مشتری.",
    projectName: "مثال: بهبود فرایند پاسخ‌گویی به درخواست‌ها",
    projectRole: "مثال: سرپرست تیم پشتیبانی",
    projectDescription:
      "مثال: طراحی گردش کار جدید تیکتینگ و کاهش زمان پاسخ به زیر یک ساعت.",
    certificationName: "مثال: گواهینامه مدیریت ارتباط با مشتری",
    certificationIssuer: "مثال: سازمان مدیریت صنعتی",
    achievementTitle: "مثال: کسب امتیاز رضایت ۹۲٪ مشتریان",
    achievementDescription: "مثال: کاهش نرخ تماس‌های تکراری به کمتر از ۱۰٪ در شش ماه.",
  },
  // The original generic defaults, byte-identical to the strings that used to
  // live inline in fa.ts — «آزاد» is both the skip fallback and the catch-all.
  azad: {
    personalJobTitle: "مهندس ارشد نرم‌افزار",
    summary:
      "مثال: مهندس نرم‌افزار با ۵ سال تجربه در طراحی و توسعهٔ وب‌اپلیکیشن‌های مقیاس‌پذیر.",
    experienceJobTitle: "مثال: مهندس نرم‌افزار",
    experienceCompany: "مثال: شرکت فناوری",
    experienceProjectDescription:
      "مثال: طراحی و توسعهٔ سامانهٔ فروش آنلاین با بیش از ده هزار کاربر فعال.",
    experienceResponsibility: "مثال: توسعه و نگهداری وب‌اپلیکیشن‌های مقیاس‌پذیر.",
    skillGroupName: "فرانت‌اند",
    skillName: "JavaScript",
    educationDegree: "مثال: کارشناسی مهندسی کامپیوتر",
    educationUniversity: "مثال: دانشگاه تهران",
    educationAchievements: "مثال: رتبهٔ اول دوره و دریافت بورسیهٔ تحصیلی.",
    projectName: "مثال: سامانه فروشگاهی",
    projectRole: "مثال: توسعه‌دهنده ارشد",
    projectDescription: "مثال: طراحی و پیاده‌سازی فروشگاه اینترنتی با React و Node.js.",
    certificationName: "مثال: گواهینامه مدیریت پروژه (PMP)",
    certificationIssuer: "مثال: مؤسسه مدیریت پروژه",
    achievementTitle: "مثال: کسب جایزهٔ بهترین کارمند سال",
    achievementDescription: "مثال: افزایش رضایت مشتریان به میزان ۲۰٪ در یک سال.",
  },
};

/**
 * The placeholder set for the currently active category. fa.ts delegates its
 * category-sensitive placeholder keys here via getters, so every existing
 * `t.*Placeholder` call site stays untouched and resolves at render time.
 */
export function occupationPlaceholders(): OccupationPlaceholderSet {
  return CATEGORY_PLACEHOLDERS[getActiveOccupationCategory()];
}
