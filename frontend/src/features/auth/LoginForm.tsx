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
          <div><span>Sistem Pemantauan Aset Kereta</span><strong>TEL-U Insight System</strong></div>
        </div>
        <h1 className={styles.heading} id="login-title">Masuk ke Dashboard RAMS</h1>
        <p className={styles.description}>Gunakan akun RAMS untuk mengakses dashboard sesuai hak akses Anda.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Username</span>
            <Input
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <Input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <Button className={styles.submit} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Memverifikasi..." : "Masuk"}
          </Button>
        </form>
        <p className={styles.note}>Session disimpan melalui cookie aman dan tidak tersedia untuk JavaScript browser.</p>
      </section>
    </main>
  );
}
