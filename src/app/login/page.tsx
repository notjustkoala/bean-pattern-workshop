"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { BeadMascot } from "@/components/shared/BeadMascot";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signInWithOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/projects`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });

    setIsSubmitting(false);
    setMessage(error ? error.message : "登录链接已发送，请查看邮箱。也可以先继续本地体验。 ");
  }

  return (
    <div className="grid min-h-[calc(100vh-140px)] items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,0.6fr)]">
      <section className="cream-card rounded-4xl p-6 md:p-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-milk-purple-soft px-4 py-2 text-sm font-black text-milk-purple">
          <Sparkles className="h-4 w-4" />
          保存项目需要登录
        </div>
        <h1 className="text-4xl font-black text-bean-ink md:text-5xl">登录豆图工坊</h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-bean-muted">
          使用邮箱魔法链接登录后，可以保存项目、读取历史图纸、查看导出记录。
        </p>

        <form className="mt-8 max-w-xl space-y-4" onSubmit={signInWithOtp}>
          <label className="block text-sm font-black text-bean-ink" htmlFor="email">邮箱</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-bean-border bg-white px-4">
              <Mail className="h-5 w-5 text-bean-muted" />
              <input
                id="email"
                className="h-full flex-1 bg-transparent text-bean-ink outline-none"
                placeholder="you@example.com"
                type="email"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <button className="primary-button min-h-14" disabled={isSubmitting} type="submit">
              {isSubmitting ? "发送中..." : "发送登录链接"}
            </button>
          </div>
          {message ? <p className="rounded-2xl bg-milk-purple-soft px-4 py-3 text-sm font-semibold text-milk-purple">{message}</p> : null}
          <button className="ghost-button" type="button" onClick={() => router.push("/workspace/upload")}>
            继续本地体验
          </button>
        </form>
      </section>

      <div className="flex justify-center">
        <BeadMascot size="lg" withBoard />
      </div>
    </div>
  );
}
