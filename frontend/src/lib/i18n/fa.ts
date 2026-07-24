import { occupationPlaceholders } from "@/lib/occupationDefaults";

// Category-sensitive example placeholders resolve through getters against the
// active occupation category (lib/occupationCategories.ts), so every existing
// `t.*Placeholder` call site — templates included — keeps working unchanged
// while the sample content adapts to the user's field. The «آزاد» set holds
// the original generic strings.
export const fa = {
  app: {
    title: "رزومه‌ساز",
    newResume: "رزومه جدید",
    home: "خانه",
    plan: "نسخه رایگان",
    upgrade: "ارتقا",
  },
  topbar: {
    aiAssistant: "دستیار هوشمند",
    improveText: "بهبود متن",
    checkTailor: "بررسی و تنظیم",
    rearrange: "چینش بخش‌ها",
    templates: "قالب‌ها",
    design: "طراحی و فونت",
    preview: "پیش‌نمایش",
    download: "دانلود",
    downloadResume: "دانلود رزومه",
    share: "اشتراک‌گذاری",
    more: "بیشتر",
    menuProfile: "پروفایل",
    menuResumes: "رزومه‌های من",
    menuSettings: "تنظیمات",
    menuLogout: "خروج",
    login: "ورود",
    colorModeLight: "حالت روشن",
    colorModeDark: "حالت تاریک",
    colorModeSystem: "حالت سیستم",
  },
  // `title` is the single-line message shown in the bottom-left validation toast
  // when a download attempt is blocked by enabled-but-empty fields. Deliberately
  // generic — the toast never enumerates the fields; the per-field red highlights
  // point them out in place. `hint` is retained for reference but no longer
  // rendered (the toast is one line only).
  downloadValidation: {
    title: "برای دانلود، این موارد را کامل کنید",
    hint: "فیلدهای زیر فعال ولی خالی‌اند و در رزومه نمایش داده نمی‌شوند.",
  },
  toolbar: {
    template: "قالب",
    export: "دریافت PDF (به‌زودی)",
    autosaved: "ذخیره شد",
    saving: "در حال ذخیره...",
  },
  sections: {
    personalInfo: "اطلاعات شخصی",
    summary: "درباره من",
    experience: "تجربه کاری",
    skills: "مهارت‌ها",
    education: "تحصیلات",
    projects: "پروژه‌ها",
    languages: "زبان‌ها",
    certifications: "گواهینامه‌ها",
    achievements: "دستاوردهای کلیدی",
  },
  sectionPanel: {
    title: "بخش‌ها",
    subtitle: "ترتیب و نمایش بخش‌ها را تنظیم کنید",
    visible: "نمایش داده می‌شود",
    removed: "حذف شده",
    remove: "حذف بخش",
    restore: "بازگرداندن بخش",
    dragHandle: "جابه‌جایی بخش",
    direction: "جهت متن",
    rtl: "راست‌به‌چپ",
    ltr: "چپ‌به‌راست",
  },
  personalInfo: {
    /** Heading over the contact block in templates that title it (timeline-panel). */
    contactsTitle: "تماس",
    fullName: "نام و نام خانوادگی",
    jobTitle: "عنوان شغلی",
    phone: "شماره تماس",
    location: "محل سکونت",
    email: "ایمیل",
    dateOfBirth: "تاریخ تولد",
    nationality: "ملیت",
    militaryService: "وضعیت نظام وظیفه",
    links: "لینک‌ها",
    addLink: "افزودن لینک",
    linkLabel: "عنوان لینک",
    linkUrl: "آدرس لینک",
    removeLink: "حذف لینک",
    profileImage: "تصویر پروفایل",
    uploadImage: "بارگذاری تصویر",
    replaceImage: "تغییر تصویر",
    deleteImage: "حذف تصویر",
    cropImage: "ویرایش کادر تصویر",
    fields: "فیلد‌ها",
    photoSettings: "تنظیمات تصویر",
    photoStyle: "شکل تصویر",
    photoRound: "گرد",
    photoSquare: "گوشه‌گرد",
    photoSharp: "مربع",
    imageSide: "جهت تصویر",
    imageLeft: "چپ",
    imageRight: "راست",
    uppercaseName: "نام با حروف بزرگ",
    save: "ذخیره",
    cancel: "انصراف",
    // Personal-info placeholders deliberately drop the «مثال:» prefix used
    // elsewhere — they read as short, natural sample values instead.
    linkLabelPlaceholder: "لینکدین",
    linkUrlPlaceholder: "https://linkedin.com/in/username",
    fullNamePlaceholder: "علی محمدی",
    get jobTitlePlaceholder() {
      return occupationPlaceholders().personalJobTitle;
    },
    phonePlaceholder: "۰۹۱۲۱۲۳۴۵۶۷",
    locationPlaceholder: "تهران، ایران",
    emailPlaceholder: "name@email.com",
    dateOfBirthPlaceholder: "۱۳۷۰",
    nationalityPlaceholder: "ایرانی",
    militaryServicePlaceholder: "پایان خدمت",
  },
  summary: {
    // Shown as the empty-state placeholder of the «درباره من» editor (it is no
    // longer seeded as real content), so it demonstrates the expected input and
    // clears naturally once the user starts typing.
    get placeholder() {
      return occupationPlaceholders().summary;
    },
  },
  experience: {
    addEntry: "افزودن تجربه کاری",
    removeEntry: "حذف این تجربه",
    jobTitle: "عنوان شغلی",
    companyName: "نام شرکت",
    city: "شهر",
    projectLink: "لینک پروژه",
    projectDescription: "توضیحات پروژه",
    periodStart: "تاریخ شروع",
    periodEnd: "تاریخ پایان",
    current: "هم‌اکنون",
    responsibilities: "شرح وظایف",
    addResponsibility: "افزودن مورد",
    removeResponsibility: "حذف مورد",
    get jobTitlePlaceholder() {
      return occupationPlaceholders().experienceJobTitle;
    },
    get companyNamePlaceholder() {
      return occupationPlaceholders().experienceCompany;
    },
    cityPlaceholder: "مثال: تهران",
    projectLinkPlaceholder: "مثال: https://github.com/username/project",
    get projectDescriptionPlaceholder() {
      return occupationPlaceholders().experienceProjectDescription;
    },
    get responsibilityPlaceholder() {
      return occupationPlaceholders().experienceResponsibility;
    },
    showLink: "نمایش لینک پروژه",
  },
  skills: {
    addGroup: "افزودن گروه مهارت",
    removeGroup: "حذف گروه",
    groupName: "نام گروه",
    // Skills placeholders also drop the «مثال:» prefix — plain sample values.
    get groupNamePlaceholder() {
      return occupationPlaceholders().skillGroupName;
    },
    skill: "نام مهارت",
    addSkill: "افزودن مهارت",
    get skillPlaceholder() {
      return occupationPlaceholders().skillName;
    },
    removeSkill: "حذف مهارت",
    showGroupTitle: "نمایش عنوان گروه",
    displayMode: "چیدمان مهارت‌ها",
    // Display labels for each SkillDisplayMode, keyed by the stored id.
    displayModes: {
      row: "برچسبی",
      list: "فهرستی",
    },
    showLevel: "نمایش سطح مهارت",
  },
  education: {
    addEntry: "افزودن تحصیلات",
    removeEntry: "حذف این مورد",
    degree: "مقطع و رشته تحصیلی",
    university: "دانشگاه",
    startDate: "شروع",
    endDate: "پایان",
    gpa: "معدل",
    achievements: "افتخارات و دستاورد‌ها",
    city: "شهر",
    get degreePlaceholder() {
      return occupationPlaceholders().educationDegree;
    },
    get universityPlaceholder() {
      return occupationPlaceholders().educationUniversity;
    },
    cityPlaceholder: "مثال: تهران",
    gpaPlaceholder: "مثال: ۱۷٫۵",
    get achievementsPlaceholder() {
      return occupationPlaceholders().educationAchievements;
    },
  },
  projects: {
    addEntry: "افزودن پروژه",
    removeEntry: "حذف این پروژه",
    name: "نام پروژه",
    role: "نقش",
    link: "لینک",
    description: "توضیحات",
    get namePlaceholder() {
      return occupationPlaceholders().projectName;
    },
    get rolePlaceholder() {
      return occupationPlaceholders().projectRole;
    },
    linkPlaceholder: "مثال: https://github.com/username/project",
    get descriptionPlaceholder() {
      return occupationPlaceholders().projectDescription;
    },
    showLink: "نمایش لینک پروژه",
  },
  languages: {
    addEntry: "افزودن زبان",
    removeEntry: "حذف این زبان",
    name: "نام زبان",
    level: "سطح",
    namePlaceholder: "مثال: انگلیسی",
    showMeter: "نمایش نشانگر سطح",
    showLevelText: "نمایش عنوان سطح",
    meterVariant: "شکل نشانگر سطح",
    // Display labels for each LanguageMeterVariant, keyed by the stored id.
    meterVariants: {
      bars: "میله‌ای",
      dots: "نقطه‌ای",
      pill: "قرصی",
      line: "خط پیشرفت",
    },
    // The level WORD for each ordinal — always derived from `level`, never stored.
    levelNames: {
      1: "مبتدی",
      2: "متوسط",
      3: "پیشرفته",
      4: "حرفه‌ای",
      5: "زبان مادری",
    },
  },
  certifications: {
    addEntry: "افزودن گواهینامه",
    removeEntry: "حذف این گواهینامه",
    name: "نام گواهینامه",
    issuer: "صادرکننده",
    date: "تاریخ",
    get namePlaceholder() {
      return occupationPlaceholders().certificationName;
    },
    get issuerPlaceholder() {
      return occupationPlaceholders().certificationIssuer;
    },
    datePlaceholder: "انتخاب تاریخ دریافت",
  },
  achievements: {
    addEntry: "افزودن دستاورد",
    removeEntry: "حذف این دستاورد",
    title: "عنوان دستاورد",
    description: "توضیحات",
    get titlePlaceholder() {
      return occupationPlaceholders().achievementTitle;
    },
    get descriptionPlaceholder() {
      return occupationPlaceholders().achievementDescription;
    },
    // Section-wide display toggles (the item title is always shown).
    showDescription: "نمایش توضیحات",
    showIcons: "نمایش آیکون‌ها",
  },
  design: {
    title: "طراحی و فونت",
    pageMargins: "حاشیه صفحه",
    sectionSpacing: "فاصله بخش‌ها",
    colors: "رنگ‌ها",
    fontStyle: "فونت",
    fontSize: "اندازه فونت",
    lineHeight: "ارتفاع خط",
    backgrounds: "پترن‌ها",
    textAndSize: "تنظیمات متن و اندازه‌ها",
    colorsDesc: "رنگ اصلی و تم رزومه را انتخاب کنید.",
    paletteModeClassic: "همسان",
    paletteModeVivid: "غیرهمسان",
    backgroundsDesc: "پترن هندسی پس‌زمینهٔ صفحه را انتخاب کنید.",
    textAndSizeDesc: "اندازهٔ فونت، ارتفاع خط، فاصله‌ها و حاشیه‌ها را تنظیم کنید.",
    backgroundIntensity: "شدت پس‌زمینه",
    columnIntensity: "شدت رنگ ستون",
    columnIntensityHint: "شدت رنگ ستون کناری در قالب‌های ستونی را کم یا زیاد کنید.",
    columnLayout: "چیدمان ستون",
    columnLayoutHint: "پهنای ستون رنگی کناری را انتخاب کنید؛ ستون اصلی همیشه پهن‌تر می‌ماند.",
    columnWidthNames: {
      small: "کوچک",
      medium: "متوسط",
      large: "بزرگ",
      xlarge: "خیلی بزرگ",
    },
    atsMode: "حالت سازگار با ATS",
    atsModeHint: "رزومه را تک‌ستونی، بدون تزئینات و با متن ساده و قابل‌خواندن برای سامانه‌های استخدامی (ATS) نمایش می‌دهد.",
    sectionIcons: "آیکون بخش‌ها",
    sectionIconsHint: "نمایش آیکون هر بخش کنار عنوان آن در همهٔ قالب‌ها.",
    sectionSeparators: "جداکنندهٔ بخش‌ها",
    sectionSeparatorsHint: "نمایش یک خط جداکنندهٔ بسیار نازک زیر عنوان هر بخش، هماهنگ با رنگ قالب در همهٔ قالب‌ها.",
    lighter: "کم‌رنگ",
    stronger: "پررنگ",
    pageBackground: "پس‌زمینهٔ صفحه",
    coloredPage: "صفحهٔ رنگی",
    coloredPageHint: "پس‌زمینهٔ صفحه رنگی شود یا سفید بماند (مستقل از نقش‌ونگار)",
    calendarType: "نوع تقویم",
    narrow: "باریک",
    wide: "پهن",
    compact: "فشرده",
    spacious: "گسترده",
    condensed: "متراکم",
  },
  templatesPanel: {
    title: "انتخاب قالب",
    subtitle: "یک قالب را انتخاب کنید",
    names: {
      "professional-single-column": "تک‌ستونه حرفه‌ای",
      "double-column": "دو ستونه",
      "sidebar-column": "ستون رنگی کناری",
      "aside-dark": "ستون کناری تیره",
      "aside-photo": "ستون عکس کناری",
      "timeline-panel": "خط زمانی",
      "header-band": "سربرگ تمام‌عرض",
      "compact-duo": "مینیمال دو ستونه",
      "ruled-single": "تک‌ستونه با خطوط",
      "classic-centered": "کلاسیک وسط‌چین",
    },
  },
  theme: {
    title: "ظاهر و رنگ‌بندی",
    colorTheme: "رنگ تم",
    background: "پس‌زمینه",
    names: {
      sage: "مریم‌گلی",
      lavender: "اسطوخودوس",
      skyBlue: "آبی آسمانی",
      dustyRose: "رز کم‌رنگ",
      mint: "نعنایی",
      softCoral: "مرجانی ملایم",
      peach: "هلویی",
      ocean: "اقیانوسی",
      slate: "سُرمه‌ای",
      grey: "خاکستری",
      indigo: "نیلی",
      navyGold: "لاجوردی طلایی",
      crimsonCopper: "زرشکی مسی",
      violetOrange: "بنفش نارنجی",
      midnightMint: "سرمه‌ای نعنایی",
      azurePeach: "آبی هلویی",
      charcoalLemon: "زغالی لیمویی",
      charcoalAmber: "زغالی کهربایی",
      smokyCoral: "بنفش سبز",
      charcoalJade: "زغالی یشمی",
      purpleRose: "آبی صورتی",
      inkFuchsia: "مشکی سرخابی",
      graphiteGold: "نفتی دودی",
      greenBlue: "سبز آبی",
      pinky: "گلی صورتی",
    },
  },
  backgrounds: {
    none: "ساده (سفید)",
    blobs: "حباب‌های نرم",
    botanical: "برگ و شاخه",
    bracketsRings: "قاب و حلقه",
    chevronField: "زیگزاگ ریز",
    concentricArcs: "کمان‌های هم‌مرکز",
    dotGrid: "نقطه‌چین محو",
    topoLines: "خطوط منحنی",
  },
  calendars: {
    jalali: "شمسی (جلالی)",
    hijri: "قمری (هجری)",
    gregorian: "میلادی",
    jalaliShort: "شمسی",
    hijriShort: "قمری",
    gregorianShort: "میلادی",
    pickDate: "انتخاب تاریخ",
    today: "امروز",
    clear: "پاک کردن",
    now: "هم‌اکنون",
    setNow: "تا کنون (هم‌اکنون)",
    // The "until now / present" marker for an ongoing role's end date.
    present: "تا اکنون",
    prevMonth: "ماه قبل",
    nextMonth: "ماه بعد",
    prevYear: "سال قبل",
    nextYear: "سال بعد",
  },
  // Section-wide period-date display settings (Experience & Education menus).
  periodDates: {
    showMonth: "نمایش ماه",
    monthFormat: "قالب نمایش ماه",
    // Display labels for each MonthFormat, keyed by the stored id.
    monthFormats: {
      name: "نام ماه",
      number: "عدد ماه",
    },
  },
  sectionToolbar: {
    addEntry: "افزودن مورد",
    formatText: "قالب‌بندی متن",
    bulletList: "فهرست نقطه‌ای",
    settings: "تنظیمات بخش",
    options: "گزینه‌های این مورد",
    noOptions: "تنظیمی برای این مورد در دسترس نیست",
    delete: "حذف بخش",
    bold: "درشت",
    italic: "مورب",
    underline: "زیرخط",
  },
  sidebar: {
    collapse: "بستن پنل",
    expand: "باز کردن پنل",
  },
  ads: {
    sidebar: "فضای تبلیغاتی",
    inline: "فضای تبلیغاتی",
    modalTitle: "فضای تبلیغاتی",
    close: "بستن",
  },
  common: {
    edit: "ویرایش",
    delete: "حذف",
    add: "افزودن",
    save: "ذخیره",
    cancel: "انصراف",
    optional: "اختیاری",
    required: "الزامی",
    on: "روشن",
    off: "خاموش",
  },
  authGateway: {
    downloadNeedsLogin: "برای دانلود رزومه وارد حساب کاربری شوید",
    modalClose: "بستن",
  },
  dashboard: {
    title: "رزومه‌های من",
    subtitle: "همهٔ رزومه‌های شما، مرتب بر اساس آخرین ویرایش",
    newResume: "رزومه جدید",
    open: "ویرایش",
    newestBadge: "جدیدترین",
    // Base of the auto-numbered default name: «رزومه من - ۱»، «رزومه من - ۲»…
    defaultTitleBase: "رزومه من",
    delete: "حذف",
    deleteConfirmTitle: "حذف رزومه",
    deleteConfirmBody: "این رزومه برای همیشه حذف می‌شود. مطمئن هستید؟",
    createdAt: "ایجاد",
    updatedAt: "آخرین ویرایش",
    empty: "هنوز رزومه‌ای ندارید — اولین رزومه را بسازید.",
    backToEditor: "بازگشت به ویرایشگر",
    loadError: "خطا در دریافت رزومه‌ها",
    needLogin: "برای دیدن رزومه‌هایتان وارد شوید",
    rename: "تغییر نام رزومه",
    colorMode: "تغییر حالت روشن/تاریک",
  },
  // Occupation-category prompt + labels. Ids are the single source of truth in
  // lib/occupationCategories.ts; ONLY the id is persisted — labels derive here.
  occupations: {
    panelLabel: "حوزه شغلی",
    edit: "تغییر حوزه شغلی",
    changeHint:
      "با تغییر حوزهٔ شغلی فقط متن‌های نمونهٔ فیلدهای خالی عوض می‌شوند؛ نوشته‌های خودتان دست‌نخورده می‌مانند.",
    notSelected: "حوزه شغلی انتخاب نشده",
    promptTitle: "حوزه شغلی شما چیست؟",
    promptSubtitle:
      "با انتخاب حوزهٔ شغلی، متن‌های نمونهٔ رزومه متناسب با کار شما نمایش داده می‌شوند. بعداً هم می‌توانید آن را از پیشخوان تغییر دهید.",
    promptSkip: "رد شدن",
    labels: {
      "software-it": "نرم‌افزار و فناوری اطلاعات",
      "sales-marketing": "فروش و بازاریابی",
      "finance-accounting": "مالی و حسابداری",
      "admin-hr": "اداری و منابع انسانی",
      "design-creative": "طراحی و گرافیک",
      "content-media": "تولید محتوا و رسانه",
      "engineering-technical": "مهندسی و فنی",
      "health-medical": "پزشکی و سلامت",
      "education-training": "آموزش و تدریس",
      "customer-support": "پشتیبانی و امور مشتریان",
      azad: "آزاد",
    },
  },
  admin: {
    title: "پیشخوان مدیریت",
    summaryUsers: "کاربران ثبت‌نام‌شده",
    summaryResumes: "رزومه‌ها",
    summaryDownloads: "دانلودها",
    visitsTitle: "بازدیدکنندگان روزانه",
    downloadsTitle: "دانلودهای روزانه",
    selectionsHeading: "تحلیل انتخاب‌های کاربران",
    selBackground: "پس‌زمینه",
    selTheme: "رنگ‌بندی",
    selTemplate: "قالب",
    selFont: "فونت",
    legendSelections: "انتخاب",
    legendDownloads: "دانلود",
    othersLabel: "سایر گزینه‌ها",
    occupationsTitle: "ثبت‌نام بر اساس حوزه شغلی",
    usersTitle: "کاربران",
    colName: "نام",
    colEmail: "ایمیل",
    colPhone: "تلفن",
    colOccupation: "حوزه شغلی",
    colCreated: "تاریخ ثبت‌نام",
    colResumes: "رزومه‌ها",
    prevPage: "قبلی",
    nextPage: "بعدی",
    pageOf: "صفحه {page} از {total}",
    empty: "داده‌ای ثبت نشده است",
    denied: "این صفحه در دسترس نیست",
    loadError: "خطا در دریافت اطلاعات",
  },
} as const;

export type TranslationDict = typeof fa;
