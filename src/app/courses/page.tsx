import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ShareActions } from "@/components/ShareActions";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { courses, coursePrice } from "@/lib/courses";
import { buildOpenGraph, canonical } from "@/lib/seo";
import { formatPrice } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Courses | Shopyacu",
  description: "One-month Shopyacu learning courses in Excel, digital marketing, full stack development, and AI for RWF 200,000 per month.",
  alternates: canonical("/courses"),
  ...buildOpenGraph({
    title: "Courses | Shopyacu",
    description: "Practical one-month learning courses in Excel, digital marketing, full stack development, and AI.",
    path: "/courses",
    image: courses[0]?.image,
  }),
};

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Logo priority imgClassName="h-10 w-[130px] object-contain sm:w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/#products" className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-white">
              All products
            </Link>
            <a
              href={whatsappLink("Hello Shopyacu, I want to ask about your courses.")}
              className="hidden rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#1fb458] sm:inline-flex"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">Learning services</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
            Practical courses for work, business, and digital skills.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-muted">
            Choose a one-month course, learn through weekly modules, and get practical skills you can use immediately.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm">{formatPrice(coursePrice)} / month</span>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">One-month modules</span>
            <a
              href={whatsappLink("Hello Shopyacu, I want to register for a course. Can you share details?")}
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1fb458]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Register on WhatsApp
            </a>
          </div>
          <ShareActions
            compact
            title="Courses | Shopyacu"
            text="Browse Shopyacu courses in Excel, digital marketing, full stack development, and AI."
            path="/courses"
            className="mt-5 max-w-xl"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {courses.map((course) => (
            <a
              key={course.slug}
              href={`#${course.slug}`}
              className="group grid grid-cols-[86px_1fr] gap-3 rounded-2xl border border-ink/10 bg-white p-3 shadow-sm transition hover:border-accent hover:shadow-md"
            >
              <span className="relative h-24 overflow-hidden rounded-xl bg-surface">
                <Image src={course.image} alt="" fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-110" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-bold text-ink">{course.title}</span>
                <span className="mt-1 block text-sm font-semibold text-muted">{formatPrice(course.price)} / month</span>
                <span className="mt-2 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-black text-ink">View modules</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          {courses.map((course) => (
            <article key={course.slug} id={course.slug} className="scroll-mt-24 overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="relative min-h-72 bg-ink">
                  <Image src={course.image} alt={course.title} fill sizes="(min-width:1024px) 34vw, 100vw" className="object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-accent px-4 py-2 text-sm font-black text-ink">
                    {formatPrice(course.price)} / month
                  </span>
                </div>
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">One-month course</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-ink">{course.title}</h2>
                  <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-muted">{course.summary}</p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {course.outcomes.map((outcome) => (
                      <span key={outcome} className="rounded-xl bg-surface px-3 py-2 text-sm font-bold text-ink/75">
                        {outcome}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3">
                    {course.modules.map((module) => (
                      <div key={module.week} className="rounded-2xl border border-ink/10 bg-surface p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-ink px-3 py-1 text-xs font-black text-accent">{module.week}</span>
                          <h3 className="font-display text-lg font-bold text-ink">{module.title}</h3>
                        </div>
                        <ul className="mt-3 grid gap-1.5 text-sm font-semibold leading-6 text-muted sm:grid-cols-2">
                          {module.lessons.map((lesson) => (
                            <li key={lesson} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                              {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <a
                    href={whatsappLink(`Hello Shopyacu, I want to register for ${course.title} at ${formatPrice(course.price)} per month.`)}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-black text-white transition hover:bg-[#1fb458] sm:w-auto"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Register for {course.title}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
