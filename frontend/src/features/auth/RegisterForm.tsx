"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./LoginForm.module.css";

type RegistrationResult = {
  username?: string;
  message?: string;
  detail?: string | Array<{ msg?: string }>;
};

function readRegistrationError(payload: RegistrationResult | null, status: number) {
  if (status === 404) {
    return "Fitur pendaftaran belum tersedia di backend. Jalankan atau deploy backend terbaru.";
  }
  if (typeof payload?.detail === "string" && payload.detail !== "Not Found") {
    return payload.detail;
  }
  if (Array.isArray(payload?.detail)) {
    return "Data pendaftaran belum valid. Periksa kembali nama, username, dan password.";
  }
  return "Pendaftaran tidak berhasil. Silakan coba lagi.";
}

export function RegisterForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [registeredUsername, setRegisteredUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();

    if (!name.trim() || !normalizedUsername || !password || !confirmation) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (!/^[a-z0-9._-]{3,50}$/.test(normalizedUsername)) {
      setError("Username minimal 3 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.");
      return;
    }
    if (password.length < 12) {
      setError("Password minimal 12 karakter.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password belum sama.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: normalizedUsername,
          password
        })
      });
      const payload = await response.json().catch(() => null) as RegistrationResult | null;
      if (!response.ok) {
        setError(readRegistrationError(payload, response.status));
        return;
      }
      setRegisteredUsername(payload?.username ?? normalizedUsername);
    } catch {
      setError("RAMS Backend tidak dapat dihubungi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredUsername) {
    return (
      <main className={styles.page}>
        <section className={styles.panel} aria-labelledby="registration-success-title">
          <div className={styles.brand}>
            <Image src="/images/logo.png" alt="Logo KAI RAMS" width={42} height={42} priority />
            <div><strong>KAI Predictive Maintenance</strong><span>Dashboard RAMS</span></div>
          </div>
          <div className={styles.success} role="status" aria-live="polite">
            <span className={styles.successMark} aria-hidden="true">✓</span>
            <h1 id="registration-success-title">Pendaftaran terkirim</h1>
            <p>Akun <strong>{registeredUsername}</strong> sedang menunggu persetujuan administrator.</p>
            <p>Setelah disetujui, Anda dapat masuk menggunakan username dan password yang baru dibuat.</p>
          </div>
          <Link className={styles.primaryLink} href="/login">Kembali ke halaman masuk</Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="register-title">
        <div className={styles.brand}>
          <Image src="/images/logo.png" alt="Logo KAI RAMS" width={42} height={42} priority />
          <div><strong>KAI Predictive Maintenance</strong><span>Dashboard RAMS</span></div>
        </div>
        <div className={styles.intro}>
          <h1 className={styles.heading} id="register-title">Daftar akun</h1>
          <p className={styles.description}>
            Role pendaftaran otomatis: <strong>Technician</strong>. Admin dapat mengubahnya setelah akun disetujui.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="register-name"><span>Nama lengkap</span></label>
            <Input id="register-name" autoComplete="name" autoFocus disabled={isSubmitting} placeholder="Masukkan nama lengkap" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="register-username"><span>Username</span></label>
            <Input id="register-username" autoCapitalize="none" autoComplete="username" disabled={isSubmitting} placeholder="Contoh: budi.teknisi" spellCheck={false} value={username} onChange={(event) => setUsername(event.target.value)} />
            <small>Minimal 3 karakter; gunakan huruf, angka, titik, garis bawah, atau tanda hubung.</small>
          </div>
          <div className={styles.field}>
            <label htmlFor="register-password"><span>Password</span></label>
            <div className={styles.passwordControl}>
              <Input id="register-password" autoComplete="new-password" disabled={isSubmitting} placeholder="Minimal 12 karakter" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? "Sembunyikan" : "Tampilkan"}</button>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="register-password-confirmation"><span>Konfirmasi password</span></label>
            <Input id="register-password-confirmation" autoComplete="new-password" disabled={isSubmitting} placeholder="Ulangi password" type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          </div>
          {error ? <p className={styles.error} role="alert" aria-live="polite">{error}</p> : null}
          <Button className={styles.submit} disabled={isSubmitting} type="submit">{isSubmitting ? "Mengirim pendaftaran..." : "Daftar akun"}</Button>
        </form>

        <p className={styles.authSwitch}>Sudah memiliki akun? <Link href="/login">Masuk</Link></p>
      </section>
    </main>
  );
}
