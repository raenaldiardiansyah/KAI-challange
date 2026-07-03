import { AlarmCenterWorkspace } from "@/features/alarm/AlarmCenterWorkspace";
import { getAlarms } from "@/services/alarmService";

export default async function AlarmCenterPage() {
  const alarms = await getAlarms();

  return <AlarmCenterWorkspace alarms={alarms} />;
}
