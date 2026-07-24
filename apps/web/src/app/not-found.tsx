import { Container } from "@/components/ui/Container";
import { Cta } from "@/components/ui/Cta";
import { primaryNav } from "@/lib/nav";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-h0 font-extrabold text-brand">۴۰۴</p>
      <h1 className="mt-4 text-h2 font-extrabold text-ink">
        این صفحه پیدا نشد
      </h1>
      <p className="mx-auto mt-4 max-w-md text-p2 text-ink-60">
        نشانی‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است. از این‌جا می‌توانید
        ادامه دهید:
      </p>
      <div className="mt-8 flex justify-center">
        <Cta href="/" variant="primary">
          بازگشت به خانه
        </Cta>
      </div>
      <nav aria-label="پیوندهای مفید" className="mt-8">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-p3 text-ink-60">
          {primaryNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}
