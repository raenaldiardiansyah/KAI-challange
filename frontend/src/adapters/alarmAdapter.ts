import type { RamsAlarmDto } from "@/types/api";
import type { Alarm } from "@/types/alarm";
import { getCarIdentity, getTrainsetIdentity } from "./identityAdapter";
import { formatTimestamp } from "./normalizers";
import { adaptAlarmStatus, adaptSeverity, adaptSubsystem } from "./statusAdapter";

export function adaptAlarm(dto: RamsAlarmDto): Alarm {
  const car = dto.car_id ? getCarIdentity(dto.trainset_id, dto.car_id) : null;
  const trainset = getTrainsetIdentity(dto.trainset_id);
  return {
    id: String(dto.id),
    trainsetId: dto.trainset_id,
    trainsetCode: trainset.displayCode,
    carId: dto.car_id,
    carNumber: car?.order ?? 0,
    subsystem: adaptSubsystem(dto.subsystem),
    subsystemCode: dto.subsystem,
    severity: adaptSeverity(dto.severity),
    status: adaptAlarmStatus(dto.status),
    message: dto.description || dto.title,
    detectedAt: formatTimestamp(dto.first_seen_at),
    lastUpdate: formatTimestamp(dto.last_seen_at)
  };
}

export function adaptAlarms(items: RamsAlarmDto[]) {
  return items.filter((item) => ["ACTIVE", "ACKED", "RESOLVED"].includes(item.status.toUpperCase())).map(adaptAlarm);
}
