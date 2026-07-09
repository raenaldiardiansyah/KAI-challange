import { SettingsPanel } from "@/features/settings/SettingsPanel";

export default function SettingsPage() {
  return (
    <div className="page-grid settings-form-layout">
      <section>
        <SettingsPanel />
      </section>
    </div>
  );
}
