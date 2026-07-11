import { chromium } from "playwright-core";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3100";
const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const data = {
  id: id("r"), title: "t", locale: "fa", templateId: "timeline-panel",
  theme: { themeId: "indigo", pageBackground: "theme", backgroundPattern: "none", backgroundIntensity: 0.7, dateCalendar: "jalali", columnIntensity: 1, fontFamily: "vazirmatn", fontScale: 1, lineHeight: 1.5, pageMargin: 16, sectionSpacing: 6 },
  sections: ["summary","experience","skills","education","projects","languages","certifications"].map((type,i)=>({id:id("s"),type,title:type,visible:true,direction:"rtl",order:i})),
  personalInfo: { fullName: "سارا احمدی نمونه", jobTitle: "مهندس نرم‌افزار", phone: "۰۹۱۲۱۲۳۴۵۶۷", location: "تهران، ایران", email: "sara@example.com", dateOfBirth:"", nationality:"", links:[{id:id("l"),label:"LinkedIn",url:"linkedin.com/in/example"},{id:id("l"),label:"GitHub",url:"github.com/example"}], profileImage:null, uppercaseName:false, photoStyle:"round", fieldVisibility:{jobTitle:true,phone:true,links:true,email:true,location:true,photo:true,dateOfBirth:false,nationality:false} },
  summary: { html: "<p>خلاصه‌ای نسبتاً بلند که چند خط طول می‌کشد تا ارتفاع واقعی بخش خلاصه را بسنجیم و مطمئن شویم تخمین ارتفاع درست است و سرریز رخ نمی‌دهد.</p>" },
  experience: Array.from({length:6},(_,i)=>({id:id("e"),jobTitle:`مهندس نرم‌افزار ارشد ${i+1}`,companyName:"شرکت فناوری نمونه با نام طولانی",period:{start:"2019-06-01",end:i===0?"":"2022-09-01",current:i===0},city:"تهران",projectLink:"github.com/example/project",projectDescription:"توضیح نسبتاً بلندی دربارهٔ نقش و دستاوردها که احتمالاً به دو خط کشیده می‌شود و فضای بیشتری می‌گیرد.",responsibilities:Array.from({length:4},()=>({id:id("rp"),text:"یک مسئولیت یا دستاورد کلیدی همراه با عدد و نتیجهٔ مشخص که ممکن است طولانی باشد."}))})),
  skills: Array.from({length:4},(_,i)=>({id:id("g"),name:`گروه مهارت ${i+1}`,skills:Array.from({length:8},(_,j)=>({id:id("k"),name:`مهارت ${j+1}`}))})),
  education: Array.from({length:5},(_,i)=>({id:id("d"),degree:`کارشناسی ارشد رشتهٔ نمونه ${i+1}`,university:"دانشگاه نمونهٔ تهران",startDate:"2014-09-01",endDate:"2018-06-01",gpa:"۱۸/۵",achievements:"افتخارات و دستاوردهای تحصیلی که ممکن است به دو خط برسد و فضای بیشتری بگیرد.",city:"تهران"})),
  projects: Array.from({length:5},(_,i)=>({id:id("p"),name:`پروژهٔ نمونه ${i+1}`,role:"توسعه‌دهندهٔ ارشد",link:"example.com",description:"توضیح کوتاهی دربارهٔ هدف و نتیجهٔ پروژه که ممکن است به دو خط برسد."})),
  languages: Array.from({length:8},(_,i)=>({id:id("n"),name:`زبان ${i+1}`,level:(i%5)+1})),
  certifications: Array.from({length:6},(_,i)=>({id:id("c"),name:`گواهینامهٔ نمونه ${i+1}`,issuer:"مؤسسهٔ صادرکننده",date:"2021-03-01"})),
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.addInitScript((d)=>{ window.__RESUME_DATA__ = d; }, data);
await page.goto(`${BASE}/print`, { waitUntil: "networkidle" });
await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 20000 });
await page.emulateMedia({ media: "print" });
await page.waitForTimeout(400);
const out = await page.evaluate(() => {
  const pxmm = 96 / 25.4;
  const mm = (px) => +(px / pxmm).toFixed(1);
  const pageEl = document.querySelectorAll(".a4-page")[0];
  // The main column is the HStack's first VStack child (flex 1, padded).
  // Report each experience-like item by finding elements that contain a date.
  const items = [...pageEl.querySelectorAll("*")].filter((el) => {
    const t = el.textContent || "";
    return t.includes("تا اکنون") || t.includes("شهریور ۱۴۰۱");
  });
  // pick the smallest elements that still contain the whole item (an HStack)
  const exp = items
    .filter((el) => el.children.length >= 2 && (el.textContent || "").length < 400)
    .slice(0, 6)
    .map((el) => ({ hMm: mm(el.getBoundingClientRect().height), t: (el.textContent || "").trim().slice(0, 30) }));
  return { exp };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
