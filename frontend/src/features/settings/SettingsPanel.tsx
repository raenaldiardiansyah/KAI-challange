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
import { approveUser, createUser, getRules, getUsers, rejectUser, updateUser, updateUserPassword } from "@/services/adminService";
import { getAuditLogs, getAuthSessions, revokeAuthSession } from "@/services/securityService";
import { useRamsResource } from "@/hooks/useRamsResource";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission } from "@/lib/auth/permissions";
import type { AuditLogDto, AuthSessionDto, RamsRuleDto, RamsUserAdminDto } from "@/types/api";
import type { UserRole } from "@/types/auth";
import styles from "./SettingsPanel.module.css";

type Tab = "display" | "data" | "diagnostics" | "rules" | "security" | "users";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "display", label: "Tampilan" },
  { id: "data", label: "Data & Koneksi" },
  { id: "diagnostics", label: "System Diagnostics" },
  { id: "rules", label: "Rules" },
  { id: "security", label: "Keamanan" },
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
        <div className={`${styles.connection} ${styles.authConnection} ${styles.full}`} role="status" aria-label="Status koneksi login dan akun">
          <div className={styles.connectionHeading}><span className={user ? styles.connectionDotOnline : styles.connectionDotChecking} aria-hidden="true" /><strong>Login & Akun: {user ? "Terhubung" : "Memeriksa koneksi..."}</strong><span className={styles.liveBadge}>LIVE</span></div>
          <p>Selalu menggunakan FastAPI dan PostgreSQL. Mode Dummy hanya berlaku untuk data sensor, trainset, alarm, dan data operasional.</p>
        </div>
      </div> : null}

      {tab === "diagnostics" ? <div className={styles.stack}>
        <DataFreshnessLabel source={system.source} stale={system.stale} fromCache={system.fromCache} generatedAt={system.generatedAt} fetchedAt={system.fetchedAt} error={system.error} />
        {system.data ? <div className={styles.metrics}>
          <Metric label="Login & akun" value={user ? "Live · FastAPI + PostgreSQL" : "Memeriksa koneksi..."} />
          <Metric label="API / App" value={`${system.data.apiOk ? "OK" : "Gagal"} · ${system.data.app}`} />
          <Metric label="Environment" value={system.data.environment} />
          <Metric label="Database" value={`${system.data.databaseOk ? "OK" : "Gagal"} · ${system.data.database}`} />
          <Metric label="Raw MQTT" value={String(system.data.rawMqttMessages)} />
          <Metric label="Telemetry signals" value={String(system.data.telemetrySignals)} />
          <Metric label="Event logs" value={String(system.data.eventLogs)} />
          <Metric label="MQTT" value={`${system.data.mqttEnabled ? "Enabled" : "Disabled"} · ${system.data.mqttConnected ? "Connected" : "Offline"}`} />
          <Metric label="Parser Status" value={system.data.parserStatus} />
          <Metric label="Unmapped Topic" value={String(system.data.unmappedTopics)} />
          <Metric label="Dead Letter" value={String(system.data.deadLetterMessages)} />
          <Metric label="Retention" value={`${system.data.retentionDays} hari`} />
          <Metric label="Queue / received / processed" value={`${system.data.queueSize} / ${system.data.messagesReceived} / ${system.data.messagesProcessed}`} />
          <Metric label="MQTT started" value={system.data.mqttStartedAt ? new Date(system.data.mqttStartedAt).toLocaleString("id-ID") : "Tidak tersedia"} />
          <Metric label="Last error" value={system.data.lastError ?? "Tidak ada"} />
        </div> : <p className={styles.empty}>System diagnostics belum tersedia.</p>}
        {system.data?.sectionErrors.map((error) => <p className={styles.warning} key={error}>{error}</p>)}
        {dataMode === "live" ? <Button variant="secondary" onClick={system.retry}>Coba Lagi</Button> : null}
      </div> : null}

      {tab === "rules" ? <RulesPanel /> : null}
      {tab === "security" ? <SecurityPanel showAudit={hasPermission(user?.role, "manage_users")} /> : null}
      {tab === "users" && hasPermission(user?.role, "manage_users") ? <UsersPanel /> : null}
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

function formatSecurityDate(value: string) {
  return new Date(value).toLocaleString("id-ID");
}

function SecurityPanel({ showAudit }: { showAudit: boolean }) {
  const sessionLoader = useCallback((signal: AbortSignal) => getAuthSessions(signal), []);
  const sessions = useRamsResource(sessionLoader, 60_000);
  const [revoked, setRevoked] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState("");
  const [actionSessionId, setActionSessionId] = useState<string | null>(null);
  const visibleSessions = (sessions.data ?? []).filter((session) => !revoked.has(session.id));

  async function revoke(session: AuthSessionDto) {
    setMessage("");
    setActionSessionId(session.id);
    try {
      await revokeAuthSession(session.id);
      setRevoked((current) => new Set(current).add(session.id));
      setMessage("Sesi perangkat berhasil dicabut.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Sesi gagal dicabut.");
    } finally {
      setActionSessionId(null);
    }
  }

  return <div className={styles.stack}>
    <div className={styles.securitySummary}>
      <div><strong>Sesi Login</strong><span>{visibleSessions.length} perangkat aktif</span></div>
      <p>Cabut sesi yang tidak Anda kenali. Perangkat tersebut harus login kembali.</p>
    </div>
    {message ? <p className={styles.notice} role="status">{message}</p> : null}
    <DataFreshnessLabel source={sessions.source} stale={sessions.stale} fromCache={sessions.fromCache} generatedAt={sessions.generatedAt} fetchedAt={sessions.fetchedAt} error={sessions.error} />
    <div className={styles.tableWrap}><table><thead><tr><th>Perangkat</th><th>IP</th><th>Terakhir digunakan</th><th>Kedaluwarsa</th><th>Aksi</th></tr></thead><tbody>{visibleSessions.map((session) => <tr key={session.id}><td>{session.device_name}</td><td>{session.ip_address ?? "-"}</td><td>{formatSecurityDate(session.last_used_at)}</td><td>{formatSecurityDate(session.expires_at)}</td><td><Button disabled={actionSessionId === session.id} variant="secondary" onClick={() => revoke(session)}>{actionSessionId === session.id ? "Mencabut..." : "Cabut Sesi"}</Button></td></tr>)}</tbody></table></div>
    {!sessions.loading && !visibleSessions.length ? <p className={styles.empty}>{sessions.error ?? "Tidak ada sesi perangkat aktif."}</p> : null}
    {showAudit ? <AdminAuditPanel /> : null}
  </div>;
}

function AdminAuditPanel() {
  const auditLoader = useCallback((signal: AbortSignal) => getAuditLogs(signal), []);
  const audit = useRamsResource(auditLoader, 60_000);
  const entries: AuditLogDto[] = audit.data ?? [];
  return <section className={styles.auditSection} aria-labelledby="audit-title">
    <div className={styles.sectionHeading}><div><strong id="audit-title">Audit Aktivitas Admin</strong><p>Riwayat tindakan keamanan terbaru. Password dan token tidak pernah dicatat.</p></div><span className={styles.adminBadge}>Khusus Admin</span></div>
    <DataFreshnessLabel source={audit.source} stale={audit.stale} fromCache={audit.fromCache} generatedAt={audit.generatedAt} fetchedAt={audit.fetchedAt} error={audit.error} />
    <div className={styles.tableWrap}><table><thead><tr><th>Waktu</th><th>Tindakan</th><th>Admin</th><th>Target</th><th>IP</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td>{formatSecurityDate(entry.created_at)}</td><td>{entry.action}</td><td>{entry.actor_user_id ?? "Sistem"}</td><td>{entry.target_user_id ?? "-"}</td><td>{entry.ip_address ?? "-"}</td></tr>)}</tbody></table></div>
    {!audit.loading && !entries.length ? <p className={styles.empty}>{audit.error ?? "Audit log belum tersedia."}</p> : null}
  </section>;
}

function UsersPanel() {
  const loader = useCallback((signal: AbortSignal) => getUsers(signal), []);
  const resource = useRamsResource(loader, 60_000);
  const [overrides, setOverrides] = useState<Record<number, RamsUserAdminDto>>({});
  const [createdUsers, setCreatedUsers] = useState<RamsUserAdminDto[]>([]);
  const [passwordUser, setPasswordUser] = useState<RamsUserAdminDto | null>(null);
  const [roleUser, setRoleUser] = useState<RamsUserAdminDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const users = useMemo(() => {
    const persisted = (resource.data ?? []).map((item) => overrides[item.id] ?? item);
    const persistedIds = new Set(persisted.map((item) => item.id));
    return [...persisted, ...createdUsers.filter((item) => !persistedIds.has(item.id))];
  }, [createdUsers, overrides, resource.data]);
  const pendingCount = users.filter((item) => item.account_status === "PENDING").length;

  function storeUser(target: RamsUserAdminDto) {
    setOverrides((current) => ({ ...current, [target.id]: target }));
  }

  async function decideRegistration(target: RamsUserAdminDto, decision: "approve" | "reject") {
    setMessage("");
    setActionUserId(target.id);
    try {
      const next = (decision === "approve" ? await approveUser(target.id) : await rejectUser(target.id)).data;
      storeUser(next);
      setMessage(decision === "approve" ? "Akun disetujui sebagai Technician dan tersimpan di database." : "Pendaftaran ditolak dan tersimpan di database.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Keputusan pendaftaran gagal disimpan.");
    } finally {
      setActionUserId(null);
    }
  }

  async function toggleUser(target: RamsUserAdminDto) {
    setMessage("");
    const next = (await updateUser(target.id, { is_active: !target.is_active })).data;
    storeUser(next);
    setMessage("Status pengguna diperbarui dan tersimpan di database.");
  }

  async function changePassword() {
    if (!passwordUser || password.length < 12) return setMessage("Password minimal 12 karakter.");
    await updateUserPassword(passwordUser.id, password);
    setPassword(""); setPasswordUser(null); setMessage("Password berhasil diperbarui di database.");
  }

  async function changeRole(target: RamsUserAdminDto, role: UserRole) {
    setMessage("");
    const updated = (await updateUser(target.id, { role })).data;
    storeUser(updated);
    setMessage("Role pengguna berhasil diperbarui dan tersimpan di database.");
  }

  return <div className={styles.stack}>
    <div className={styles.adminOnlySummary}><div><strong>Area khusus Admin</strong><span>Hak akses tertinggi</span></div><p>Hanya Admin yang dapat membuat akun Admin, mengubah role, menyetujui pendaftaran, dan mengganti password pengguna.</p></div>
    <div className={styles.headerRow}><DataFreshnessLabel source={resource.source} stale={resource.stale} fromCache={resource.fromCache} generatedAt={resource.generatedAt} fetchedAt={resource.fetchedAt} error={resource.error} /><Button onClick={() => setCreateOpen(true)}>Tambah Pengguna</Button></div>
    <div className={styles.approvalSummary}><div><strong>{pendingCount}</strong><span>Pendaftaran menunggu persetujuan</span></div><p>Pengguna baru otomatis diajukan sebagai Technician. Hanya Admin yang dapat menyetujui atau menolak.</p></div>
    {message ? <p className={styles.notice}>{message}</p> : null}
    <div className={styles.tableWrap}><table><thead><tr><th>Username</th><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{users.map((item) => {
      const isPending = item.account_status === "PENDING";
      const isRejected = item.account_status === "REJECTED";
      const isProtectedAdmin = item.username.toLowerCase() === "operator_kai";
      const statusLabel = isPending ? "Menunggu" : isRejected ? "Ditolak" : item.is_active ? "Aktif" : "Nonaktif";
      return <tr key={item.id}><td>{item.username}</td><td>{item.name}</td><td>{item.email ?? "-"}</td><td>{item.role}</td><td><span className={`${styles.statusBadge} ${isPending ? styles.pending : isRejected ? styles.rejected : item.is_active ? styles.approved : styles.inactive}`}>{statusLabel}</span></td><td><div className={styles.actions}>
        {isPending || isRejected ? <Button disabled={actionUserId === item.id} onClick={() => decideRegistration(item, "approve")}>{actionUserId === item.id ? "Memproses..." : "Setujui"}</Button> : null}
        {isPending ? <Button disabled={actionUserId === item.id} variant="secondary" onClick={() => decideRegistration(item, "reject")}>Tolak</Button> : null}
        {!isPending && !isRejected ? <Button aria-label={`Edit role ${item.username}`} className={styles.editAction} disabled={isProtectedAdmin} variant="secondary" onClick={() => setRoleUser(item)}>Edit Role</Button> : null}
        {!isPending && !isRejected ? <Button className={item.is_active ? styles.deactivateAction : styles.activateAction} disabled={isProtectedAdmin} variant="secondary" onClick={() => toggleUser(item)}>{item.is_active ? "Nonaktifkan" : "Aktifkan"}</Button> : null}
        {!isPending ? <Button aria-label={`Ubah password ${item.username}`} className={styles.passwordAction} variant="ghost" onClick={() => setPasswordUser(item)}>Password</Button> : null}
      </div></td></tr>;
    })}</tbody></table></div>
    <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(created) => { setCreatedUsers((current) => [...current, created]); setCreateOpen(false); setMessage("Pengguna dibuat dan tersimpan di database."); }} />
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

function CreateUserModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (user: RamsUserAdminDto) => void }) {
  const [username, setUsername] = useState(""); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [role, setRole] = useState<UserRole>("TECHNICIAN"); const [error, setError] = useState("");
  async function submit() {
      if (username.length < 3 || !name || password.length < 12) return setError("Username minimal 3 karakter, nama wajib, password minimal 12 karakter.");
    try {
      const input = { username, name, email: email || null, password, role, is_active: true };
      const created = (await createUser(input)).data;
      onCreated(created);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pengguna gagal dibuat."); }
  }
  return <Modal open={open} title="Tambah Pengguna" onClose={onClose}><div className={styles.grid}><label>Username<Input value={username} onChange={(event) => setUsername(event.target.value)} /></label><label>Nama<Input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Role<Select value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="VIEWER">VIEWER</option><option value="TECHNICIAN">TECHNICIAN</option><option value="ADMIN">ADMIN</option></Select></label>{error ? <p role="alert" className={styles.warning}>{error}</p> : null}<Button onClick={submit}>Buat Pengguna</Button></div></Modal>;
}
