import { AlarmFilter } from "@/features/alarm/AlarmFilter";
import { AlarmTable } from "@/features/alarm/AlarmTable";
import { AlarmSummary } from "@/features/alarm/AlarmSummary";
import { AlarmDetail } from "@/features/alarm/AlarmDetail";
import { getAlarms } from "@/services/alarmService";

export default async function AlarmCenterPage() {
  const alarms = await getAlarms();
  const selectedAlarm = alarms[0];

  return (
    <div className="page-grid alarm-inbox-layout">
      <section className="alarm-summary-strip">
        <AlarmSummary alarms={alarms} />
      </section>
      
      <aside className="alarm-filter-panel">
        <AlarmFilter />
        {selectedAlarm ? <AlarmDetail alarm={selectedAlarm} /> : null}
      </aside>

      <section className="alarm-table-panel">
        <AlarmTable alarms={alarms} />
      </section>
    </div>
  );
}
