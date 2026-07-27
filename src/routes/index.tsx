import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  WifiOff,
  Brain,
  LineChart,
  HeartPulse,
  Lock,
  Sparkles,
  ArrowRight,
  Quote,
  ClipboardList,
  Gauge,
  Repeat,
} from "lucide-react";
import heroImage from "@/assets/hero-health.jpg";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { APP_TAGLINE, DISCLAIMER } from "@/utils/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HealthGuard AI — Preventive Health Scores & Insights" },
      {
        name: "description",
        content:
          "HealthGuard AI turns your daily habits into an explainable health score, risk breakdown and preventive recommendations. Private, offline-first wellness intelligence.",
      },
      { property: "og:title", content: "HealthGuard AI — Know Your Health Before It Knows You" },
      {
        property: "og:description",
        content: "Explainable health scores, lifestyle risk analysis and preventive recommendations that work offline.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Gauge, title: "Explainable health score", text: "A 0–100 score where every point is attributed to a habit, not a black box." },
  { icon: HeartPulse, title: "Lifestyle risk analysis", text: "Sleep, stress, movement, hydration and history combined into one clear risk band." },
  { icon: LineChart, title: "Long-term trends", text: "Daily, weekly, monthly and yearly charts for weight, BMI, sleep, stress and score." },
  { icon: Sparkles, title: "Preventive recommendations", text: "Personalised actions across diet, exercise, hydration, sleep, mind and screening." },
  { icon: Lock, title: "Private by design", text: "Your health data stays on your device first and syncs only to your own account." },
  { icon: ShieldCheck, title: "Early-warning signals", text: "Dangerous symptom combinations surface an immediate care prompt — never a diagnosis." },
];

const steps = [
  { icon: ClipboardList, title: "Log your day", text: "A two-minute health check captures body metrics, habits, symptoms and history." },
  { icon: Brain, title: "Get your score", text: "The intelligence engine explains every positive and negative contribution." },
  { icon: Repeat, title: "Track the trend", text: "Watch your score move as habits change, online or completely offline." },
];

const testimonials = [
  { name: "Ananya R.", role: "Product designer", quote: "The first health app that told me why my score moved instead of just showing a number." },
  { name: "Dr. Mehul S.", role: "General physician", quote: "My patients arrive with a clear lifestyle timeline. It makes preventive conversations far easier." },
  { name: "Kabir N.", role: "Marathon runner", quote: "Works on flights, works on trail days. It syncs the moment I'm back online." },
];

const faqs = [
  { q: "Does HealthGuard AI diagnose illnesses?", a: "No. It is a preventive early-warning companion. It highlights lifestyle risks and encourages timely professional care, but it never diagnoses or treats conditions." },
  { q: "How does the offline mode work?", a: "Every health log, score and recommendation is written to your browser's local database first. When a connection returns, entries sync to your private cloud account automatically." },
  { q: "Who can see my health data?", a: "Only you. Data is scoped to your account with row-level security, and the local copy never leaves your device." },
  { q: "How is the health score calculated?", a: "Each factor — BMI, sleep, activity, hydration, stress, habits, symptoms and history — contributes a weighted number of points that is always shown alongside the score." },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
          <Logo />
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link to="/auth" search={{ mode: "login" }}>
                Sign in
              </Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-sunrise relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-medium tracking-wide">
              <Sparkles className="size-3.5" aria-hidden /> Preventive health intelligence
            </span>
            <h1 className="mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Know your health before it knows you.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              HealthGuard AI turns everyday habits into an explainable health score, a clear risk picture
              and preventive actions you can actually follow — even with no internet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start your health check <ArrowRight className="ml-1 size-4" aria-hidden />
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">{DISCLAIMER}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <img
              src={heroImage}
              width={1200}
              height={1008}
              alt="Floating HealthGuard AI cards showing a health score ring and wellness trend charts"
              className="w-full rounded-[2.5rem] shadow-[var(--shadow-lift)]"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <Section id="features" eyebrow="Features" title="Everything a preventive companion should do">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-float)]"
            >
              <span className="gradient-warm grid size-11 place-items-center rounded-2xl">
                <f.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* Offline first */}
      <section className="gradient-warm">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-medium">
              <WifiOff className="size-3.5" aria-hidden /> Why offline first?
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl">Health doesn't pause when the signal drops.</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Rural clinics, flights, basements, patchy data plans. HealthGuard AI writes every log, score
              and recommendation to your device first, so the full experience keeps working. The moment you
              reconnect, everything syncs quietly to your private account.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { t: "Local-first storage", d: "Logs and insights live in your browser database." },
              { t: "Zero data loss", d: "Queued entries sync automatically on reconnect." },
              { t: "Instant interactions", d: "No spinner between you and your numbers." },
              { t: "Private by default", d: "Nothing is shared with third parties." },
            ].map((c) => (
              <div key={c.t} className="rounded-3xl bg-card/85 p-5 shadow-[var(--shadow-soft)]">
                <h3 className="text-base">{c.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI intelligence */}
      <Section eyebrow="AI health intelligence" title="A score you can argue with — because it shows its work">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[2.5rem] border border-border bg-card p-7 shadow-[var(--shadow-float)]">
            <p className="leading-relaxed text-muted-foreground">
              The intelligence engine weighs body composition, sleep, activity, hydration, stress, habits,
              symptoms and family history. Instead of a single opaque number, you get the exact contribution
              of every factor, the trend behind it, and what to change first.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { l: "Healthy BMI", v: "+12" },
                { l: "Exercise", v: "+7" },
                { l: "Hydration", v: "+5" },
                { l: "Poor sleep", v: "-8" },
                { l: "High stress", v: "-6" },
                { l: "Smoke free", v: "+5" },
              ].map((row) => (
                <li key={row.l} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm">
                  <span>{row.l}</span>
                  <span className={row.v.startsWith("+") ? "font-semibold text-success" : "font-semibold text-destructive"}>
                    {row.v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="gradient-mint flex flex-col justify-center rounded-[2.5rem] border border-border p-8 text-center shadow-[var(--shadow-float)]">
            <p className="text-sm tracking-wide text-muted-foreground uppercase">Sample health score</p>
            <p className="mt-3 font-serif text-7xl">84</p>
            <p className="mt-2 text-sm text-muted-foreground">Low risk · improving for 3 weeks</p>
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section eyebrow="How it works" title="Three steps, two minutes a day">
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]"
            >
              <span className="font-serif text-sm text-muted-foreground">0{i + 1}</span>
              <span className="gradient-sky mt-3 grid size-11 place-items-center rounded-2xl">
                <s.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Benefits */}
      <Section eyebrow="Benefits" title="Preventive care, made ordinary">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "2 min", v: "to complete a full daily health check" },
            { k: "8 factors", v: "weighed into every explainable score" },
            { k: "100%", v: "of features usable without internet" },
            { k: "0", v: "diagnoses — only preventive guidance" },
          ].map((b) => (
            <div key={b.k} className="gradient-sunrise rounded-3xl border border-border p-6 shadow-[var(--shadow-soft)]">
              <p className="font-serif text-3xl">{b.k}</p>
              <p className="mt-2 text-sm text-muted-foreground">{b.v}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section eyebrow="Testimonials" title="Trusted by people who want to stay ahead">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <Quote className="size-5 text-primary" aria-hidden />
              <blockquote className="mt-4 leading-relaxed">{t.quote}</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-medium">{t.name}</span>
                <span className="block text-muted-foreground">{t.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Questions worth answering">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card px-6 shadow-[var(--shadow-soft)]">
          <Accordion type="single" collapsible>
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CTA + footer */}
      <footer className="gradient-warm mt-10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-[2.5rem] bg-card/85 p-8 text-center shadow-[var(--shadow-float)] sm:p-12">
            <h2 className="text-3xl sm:text-4xl">Start your first health check today</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{APP_TAGLINE}</p>
            <Button asChild size="lg" className="mt-7 rounded-full px-8">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create your free account
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-6 border-t border-border/60 pt-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <Logo />
              <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} HealthGuard AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-9 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">{eyebrow}</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
