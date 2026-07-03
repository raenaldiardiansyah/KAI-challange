import { Bell, Broadcast, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function Topbar() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Sistem Pemantauan Aset Kereta RAMS</p>
        <h1>Dasbor Insight Operasional</h1>
      </div>
      <div className="topbar-actions">
        <div className="search">
          <MagnifyingGlass size={16} />
          <Input aria-label="Cari armada kereta" placeholder="Cari armada, gerbong, alarm" />
        </div>
        <Button variant="secondary" icon={<Broadcast size={16} />}>Dummy</Button>
        <Button variant="ghost" icon={<Bell size={18} />} aria-label="Notifications" />
      </div>
    </header>
  );
}
