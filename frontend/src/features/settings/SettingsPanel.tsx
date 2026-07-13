"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataFreshnessLabel } from "@/components/data/DataFreshnessLabel";
import { setDashboardScale, getDashboardScale, subscribeDashboardScale } from "@/lib/dashboardScale";
import { isLiveApiAllowed } from "@/services/api/dataMode";
import { useDataMode } from "@/features/data-mode/DataModeProvider";
import { getSystemStatus } from "@/services/systemService";
import { createUser, getRules, getUsers, updateUser, updateUserPassword } from "@/services/adminService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission } from "@/lib/auth/permissions";
import type { RamsRuleDto, RamsUserAdminDto } from "@/types/api";
import type { UserRole } from "@/types/auth";
import styles from "./SettingsPanel.module.css";

type Tab = "display" | "data" | "diagnostics" | "rules" | "users";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "display", label: "Tampilan" },
  { id: "data", label: "Data & Koneksi" },
  { id: "diagnostics", label: "System Diagnostics" },
  { id: "rules", label: "Rules" },
  { id: "users", label: "Pengguna" }
];

function Metric({ label, value }: { label: string; value: string }) {
  return <div className={styles.metric}><span>{label}</span><strong>{value}</strong></div>;
}

export function SettingsPanel() {
  const currentScale = useSyncExternalStore(subscribeDashboardScale, getDashboardScale, () => 0.5);
  const { mode: dataMode, changeMode } = useDataMode();
  const { user } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("display");
  const liveAllowed = isLiveApiAllowed();
  const statusLoader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getSystemStatus(signal, mode), []);
  const system = useRamsResource(statusLoader, 60_000);
  const visibleTabs = tabs.filter((item) => item.id !== "users" || hasPermission(user?.role, "manage_users"));

  return (
    <Card title="Pengaturan Sistem" eyebrow="Preferensi, integrasi & administrasi">
      <div className={styles.tabs} role="tablist" aria-label="Kategori pengaturan">
        {visibleTabs.map((item) => <button aria-selected={tab === item.id} className={tab === item.id ? styles.active : ""} key={item.id} onClick={() => setTab(item.id)} role="tab" type="button">{item.label}</button>)}
      </div>

      {tab === "display" ? <div className={styles.grid}>
        <label>Mode Tampilan<Select defaultValue="light"><option value="light">Terang</option><option value="dark">Gelap (Prototype)</option><option value="auto">Ikuti Sistem (Prototype)</option></Select></label>
        <label>Tingkat Detail Map<Select defaultValue="simple"><option value="simple">Sederhana</option><option value="detailed">Detail Lengkap</option></Select></label>
        <div className={styles.full}><span className={styles.label}>Skala Dashboard</span><div className={styles.actions}>{([0.5, 0.75, 1] as const).map((scale) => <Button key={scale} variant={currentScale === scale ? "primary" : "secondary"} onClick={() => setDashboardScale(scale)}>{Math.round(scale * 100)}%</Button>)}</div></div>
      </div> : null}

      {tab === "data" ? <div className={styles.grid}>
        <label>Sumber Data<Select value={dataMode} onChange={(event) => changeMode(event.target.value === "live" ? "live" : "dummy")}><option value="dummy">Dummy / Mock</option><option value="live" disabled={!liveAllowed}>Live API{liveAllowed ? "" : " (dinonaktifkan environment)"}</option></Select></label>
        <label>Refresh Interval<Select defaultValue="30s"><option value="5s">5 detik</option><option value="15s">15 detik</option><option value="30s">30 detik</option><option value="manual">Manual</option></Select></label>
        <label>Email Notifikasi Alarm Kritis<Input type="email" defaultValue="admin.depo@kai.id" /><small>EmailJS dipertahankan sebagai integrasi lokal.</small></label>
        <div className={styles.connection}><strong>{dataMode === "dummy" ? "Dummy aktif — tidak menghubungi RAMS" : system.loading ? "Memeriksa RAMS..." : system.data ? `API ${system.data.apiOk ? "OK" : "Gagal"} · DB ${system.data.databaseOk ? "OK" : "Gagal"} · MQTT ${system.data.mqttConnected ? "Terhubung" : "Offline"}` : system.error ?? "Tidak tersedia"}</strong><DataFreshnessLabel source={system.source} stale={system.stale} fromCache={system.fromCache} generatedAt={system.generatedAt} fetchedAt={system.fetchedAt} error={system.error} /></div>
      </div> : null}

      {tab === "diagnostics" ? <div className={styles.stack}>
        <DataFreshnessLabel source={system.source} stale={system.stale} fromCache={system.fromCache} generatedAt={system.generatedAt} fetchedAt={system.fetchedAt} error={system.error} />
        {system.data ? <div className={styles.metrics}>
          <Metric label="API / App" value={`${system.data.apiOk ? "OK" : "Gagal"} · ${system.data.app}`} />
          <Metric label="Environment" value={system.data.environment} />
          <Metric label="Database" value={`${system.data.databaseOk ? "OK" : "Gagal"} · ${system.data.database}`} />
          <Metric label="Raw MQTT" value={String(system.data.rawMqttMessages)} />
          <Metric label="Telemetry signals" value={String(system.data.telemetrySignals)} />
          <Metric label="Event logs" value={String(system.data.eventLogs)} />
          <Metric label="MQTT" value={`${system.data.mqttEnabled ? "Enabled" : "Disabled"} · ${system.data.mqttConnected ? "Connected" : "Offline"}`} />
          <Metric label="Queue / received / processed" value={`${system.data.queueSize} / ${system.data.messagesReceived} / ${system.data.messagesProcessed}`} />
          <Metric label="MQTT started" value={system.data.mqttStartedAt ? new Date(system.data.mqttStartedAt).toLocaleString("id-ID") : "Tidak tersedia"} />
          <Metric label="Last error" value={system.data.lastError ?? "Tidak ada"} />
        </div> : <p className={styles.empty}>System diagnostics belum tersedia.</p>}
        {system.data?.sectionErrors.map((error) => <p className={styles.warning} key={error}>{error}</p>)}
        <Button variant="secondary" onClick={system.retry}>Coba Lagi</Button>
      </div> : null}

      {tab === "rules" ? <RulesPanel /> : null}
      {tab === "users" && hasPermission(user?.role, "manage_users") ? <UsersPanel isDummy={dataMode === "dummy"} /> : null}
    </Card>
  );
}

function RulesPanel() {
  const loader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getRules(signal, mode), []);
  const rules = useRamsResource(loader, 60_000);
  const [selected, setSelected] = useState<RamsRuleDto | null>(null);
  return <div className={styles.stack}>
    <DataFreshnessLabel source={rules.source} stale={rules.stale} fromCache={rules.fromCache} generatedAt={rules.generatedAt} fetchedAt={rules.fetchedAt} error={rules.error} />
    <div className={styles.tableWrap}><table><thead><tr><th>Rule ID</th><th>Subsystem</th><th>Event</th><th>Level</th><th>Validasi</th><th>Status</th></tr></thead><tbody>{rules.data?.map((rule) => <tr key={rule.id} onClick={() => setSelected(rule)}><td>{rule.rule_id}</td><td>{rule.subsystem_ppt}</td><td>{rule.event_code}</td><td>{rule.level}</td><td>{rule.validation_status}</td><td>{rule.enabled ? "Aktif" : "Nonaktif"}</td></tr>)}</tbody></table></div>
    {!rules.data?.length ? <p className={styles.empty}>{rules.error ?? "Rules belum tersedia."}</p> : null}
    <Modal open={Boolean(selected)} title="Detail Rule RAMS" onClose={() => setSelected(null)}>{selected ? <div className={styles.stack}><Metric label="Condition expression" value={selected.condition_expression} /><Metric label="Rule type / source" value={`${selected.rule_type} / ${selected.source}`} /><Metric label="Rekomendasi" value={selected.recommendation} /><details><summary>Condition JSON</summary><pre>{JSON.stringify(selected.condition_json, null, 2)}</pre></details></div> : null}</Modal>
  </div>;
}

function UsersPanel({ isDummy }: { isDummy: boolean }) {
  const loader = useCallback((signal: AbortSignal, mode: "dummy" | "live") => getUsers(signal, mode), []);
  const resource = useRamsResource(loader, 60_000);
  const [overrides, setOverrides] = useState<Record<number, RamsUserAdminDto>>({});
  const [createdUsers, setCreatedUsers] = useState<RamsUserAdminDto[]>([]);
  const [passwordUser, setPasswordUser] = useState<RamsUserAdminDto | null>(null);
  const [roleUser, setRoleUser] = useState<RamsUserAdminDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const users = useMemo(() => [
    ...(resource.data ?? []).map((item) => overrides[item.id] ?? item),
    ...createdUsers
  ], [createdUsers, overrides, resource.data]);

  async function toggleUser(target: RamsUserAdminDto) {
    setMessage("");
    const next = { ...target, is_active: !target.is_active };
    if (!isDummy) await updateUser(target.id, { is_active: next.is_active });
    setOverrides((current) => ({ ...current, [target.id]: next }));
    setMessage(isDummy ? "Perubahan disimpan lokal pada Dummy Mode." : "Status pengguna diperbarui di RAMS.");
  }

  async function changePassword() {
    if (!passwordUser || password.length < 8) return setMessage("Password minimal 8 karakter.");
    if (!isDummy) await updateUserPassword(passwordUser.id, password);
    setPassword(""); setPasswordUser(null); setMessage(isDummy ? "Password Dummy hanya disimulasikan lokal." : "Password berhasil diperbarui.");
  }

  async function changeRole(target: RamsUserAdminDto, role: UserRole) {
    setMessage("");
    if (isDummy) {
      setOverrides((current) => ({ ...current, [target.id]: { ...target, role } }));
      setMessage("Role pengguna Dummy diperbarui secara lokal.");
      return;
    }
    await updateUser(target.id, { role });
    resource.retry();
    setMessage("Role pengguna berhasil diperbarui di RAMS. Daftar pengguna sedang dimuat ulang.");
  }

  return <div className={styles.stack}>
    <div className={styles.headerRow}><DataFreshnessLabel source={resource.source} stale={resource.stale} fromCache={resource.fromCache} generatedAt={resource.generatedAt} fetchedAt={resource.fetchedAt} error={resource.error} /><Button onClick={() => setCreateOpen(true)}>Tambah Pengguna</Button></div>
    {message ? <p className={styles.notice}>{message}</p> : null}
    <div className={styles.tableWrap}><table><thead><tr><th>Username</th><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{users.map((item) => <tr key={item.id}><td>{item.username}</td><td>{item.name}</td><td>{item.email ?? "-"}</td><td>{item.role}</td><td>{item.is_active ? "Aktif" : "Nonaktif"}</td><td><div className={styles.actions}><Button aria-label={`Edit role ${item.username}`} variant="secondary" onClick={() => setRoleUser(item)}>Edit Role</Button><Button variant="secondary" onClick={() => toggleUser(item)}>{item.is_active ? "Nonaktifkan" : "Aktifkan"}</Button><Button aria-label={`Ubah password ${item.username}`} variant="ghost" onClick={() => setPasswordUser(item)}>Password</Button></div></td></tr>)}</tbody></table></div>
    <CreateUserModal isDummy={isDummy} open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(created) => { setCreatedUsers((current) => [...current, created]); setCreateOpen(false); setMessage(isDummy ? "Pengguna Dummy ditambahkan lokal." : "Pengguna dibuat di RAMS."); }} />
    <EditUserRoleModal key={roleUser?.id ?? "closed"} user={roleUser} onClose={() => setRoleUser(null)} onSave={changeRole} />
    <Modal open={Boolean(passwordUser)} title="Ubah Password" onClose={() => setPasswordUser(null)}><div className={styles.stack}><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password baru" /><Button onClick={changePassword}>Simpan Password</Button></div></Modal>
  </div>;
}

function EditUserRoleModal({ user, onClose, onSave }: { user: RamsUserAdminDto | null; onClose: () => void; onSave: (user: RamsUserAdminDto, role: UserRole) => Promise<void> }) {
  const [role, setRole] = useState<UserRole>(user?.role ?? "VIEWER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!user || role === user.role) return onClose();
    setLoading(true);
    setError("");
    try {
      await onSave(user, role);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Role pengguna gagal diperbarui.");
    } finally {
      setLoading(false);
    }
  }

  return <Modal open={Boolean(user)} title="Edit Role Pengguna" onClose={onClose}><div className={styles.stack}>
    <label>Username<Input readOnly value={user?.username ?? ""} /></label>
    <label>Role pengguna<Select aria-label="Role pengguna" value={role} onChange={(event) => setRole(event.target.value as UserRole)} disabled={loading}><option value="VIEWER">VIEWER</option><option value="TECHNICIAN">TECHNICIAN</option><option value="ADMIN">ADMIN</option></Select></label>
    <p className={styles.empty}>Perubahan role tidak mengubah password pengguna.</p>
    {error ? <p className={styles.warning} role="alert">{error}</p> : null}
    <div className={styles.actions}><Button variant="ghost" disabled={loading} onClick={onClose}>Batal</Button><Button disabled={loading || role === user?.role} onClick={submit}>{loading ? "Menyimpan..." : "Simpan Role"}</Button></div>
  </div></Modal>;
}

function CreateUserModal({ isDummy, open, onClose, onCreated }: { isDummy: boolean; open: boolean; onClose: () => void; onCreated: (user: RamsUserAdminDto) => void }) {
  const [username, setUsername] = useState(""); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [role, setRole] = useState<UserRole>("VIEWER"); const [error, setError] = useState("");
  async function submit() {
    if (username.length < 3 || !name || password.length < 8) return setError("Username minimal 3 karakter, nama wajib, password minimal 8 karakter.");
    try {
      const input = { username, name, email: email || null, password, role, is_active: true };
      const created = isDummy ? { ...input, id: Date.now() } : (await createUser(input)).data;
      onCreated(created);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pengguna gagal dibuat."); }
  }
  return <Modal open={open} title="Tambah Pengguna" onClose={onClose}><div className={styles.grid}><label>Username<Input value={username} onChange={(event) => setUsername(event.target.value)} /></label><label>Nama<Input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Role<Select value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="VIEWER">VIEWER</option><option value="TECHNICIAN">TECHNICIAN</option><option value="ADMIN">ADMIN</option></Select></label>{error ? <p role="alert" className={styles.warning}>{error}</p> : null}<Button onClick={submit}>Buat Pengguna</Button></div></Modal>;
}
