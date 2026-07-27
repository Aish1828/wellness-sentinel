import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_TAGLINE } from "@/utils/constants";

type Mode = "login" | "signup" | "forgot";

interface FormValues {
  fullName: string;
  email: string;
  password: string;
  remember: boolean;
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — HealthGuard AI" },
      {
        name: "description",
        content: "Sign in or create your HealthGuard AI account to track health scores, risks and preventive insights.",
      },
      { property: "og:title", content: "Sign in — HealthGuard AI" },
      { property: "og:description", content: "Your private, offline-first preventive health workspace." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode as Mode) || "login",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<Mode>(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { fullName: "", email: "", password: "", remember: true },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: values.fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox if confirmation is required.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email.");
        setMode("login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  const titles: Record<Mode, { h: string; p: string; cta: string }> = {
    login: { h: "Welcome back", p: "Continue your preventive health journey.", cta: "Sign in" },
    signup: { h: "Create your account", p: "Two minutes to your first explainable health score.", cta: "Create account" },
    forgot: { h: "Reset your password", p: "We'll email you a secure reset link.", cta: "Send reset link" },
  };

  return (
    <div className="gradient-sunrise relative min-h-dvh overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-secondary/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-primary/25 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
        <Link to="/" className="mb-8">
          <Logo />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card w-full p-7 sm:p-9"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-3xl">{titles[mode].h}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{titles[mode].p}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
                {mode === "signup" && (
                  <Field id="fullName" label="Full name" icon={User}>
                    <Input
                      id="fullName"
                      autoComplete="name"
                      placeholder="Aisha Verma"
                      className="h-12 rounded-2xl pl-11"
                      {...register("fullName", { required: true })}
                    />
                  </Field>
                )}

                <Field id="email" label="Email" icon={Mail}>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 rounded-2xl pl-11"
                    {...register("email", { required: true })}
                  />
                </Field>

                {mode !== "forgot" && (
                  <Field id="password" label="Password" icon={Lock}>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      placeholder="••••••••"
                      className="h-12 rounded-2xl pl-11"
                      {...register("password", { required: true, minLength: 6 })}
                    />
                  </Field>
                )}

                {mode === "login" && (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 text-muted-foreground">
                      <Checkbox id="remember" defaultChecked {...register("remember")} />
                      <span>Remember me</span>
                    </label>
                    <button type="button" onClick={() => setMode("forgot")} className="font-medium underline-offset-4 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" disabled={submitting || formState.isSubmitting} className="h-12 w-full rounded-2xl text-base">
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : titles[mode].cta}
                  {!submitting && <ArrowRight className="ml-1 size-4" aria-hidden />}
                </Button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    or continue with
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button type="button" variant="outline" onClick={google} className="h-12 rounded-2xl">
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-2xl"
                      onClick={() => toast("Apple sign-in is coming soon.")}
                    >
                      Apple
                    </Button>
                  </div>
                </>
              )}

              <p className="mt-7 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    New to HealthGuard?{" "}
                    <button onClick={() => setMode("signup")} className="font-medium text-foreground underline-offset-4 hover:underline">
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="font-medium text-foreground underline-offset-4 hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <p className="mt-6 max-w-sm text-center text-xs text-muted-foreground">{APP_TAGLINE}</p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        {children}
      </div>
    </div>
  );
}
