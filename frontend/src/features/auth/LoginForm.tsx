"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./LoginForm.module.css";

function readError(payload: unknown) {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
  }
  return "Login tidak berhasil. Periksa username dan password.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionNotice =
    searchParams.get("reason") === "inactive"
      ? "Sesi berakhir karena tidak ada aktivitas selama 15 menit. Silakan masuk kembali."
      : "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(readError(payload));
        return;
      }

      const nextPath = searchParams.get("next");
      const safeNextPath =
        nextPath?.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/overview";
      router.replace(safeNextPath);
    } catch {
      setError("RAMS Backend tidak dapat dihubungi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <div className={styles.brand}>
          <Image src="/images/logo.png" alt="Logo KAI RAMS" width={42} height={42} priority />
          <div>
            <strong>KAI Predictive Maintenance</strong>
            <span>Dashboard RAMS</span>
          </div>
        </div>

        <div className={styles.intro}>
          <h1 className={styles.heading} id="login-title">Masuk</h1>
          <p className={styles.description}>Gunakan username dan password akun Anda.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Username</span>
            <Input
              autoComplete="username"
              autoFocus
              placeholder="Masukkan username"
              spellCheck={false}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <Input
              autoComplete="current-password"
              placeholder="Masukkan password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
          {error || sessionNotice ? (
            <p className={styles.error} role="alert" aria-live="polite">
              {error || sessionNotice}
            </p>
          ) : null}
          <Button className={styles.submit} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Memverifikasi..." : "Masuk"}
          </Button>
        </form>

        <p className={styles.note}>Akses hanya untuk pengguna yang terdaftar.</p>
      </section>
    </main>
  );
}
