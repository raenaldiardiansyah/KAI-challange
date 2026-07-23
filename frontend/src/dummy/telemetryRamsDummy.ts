import type { RamsTelemetryDto } from "@/types/api";

type TelemetrySeed = Omit<RamsTelemetryDto, "id" | "event_time" | "trainset_id" | "car_id"> & {
  carId?: string | null;
  minute: number;
};

const baseTime = "2026-07-13T08:";

const seeds: TelemetrySeed[] = [
  { minute: 10, carId: "M102401", subsystem: "PRESSURE", signal_name: "brake_pipe", value: 4.2, value_float: 4.2, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102401/pressure" },
  { minute: 10, carId: "M102401", subsystem: "PRESSURE", signal_name: "brake_cylinder", value: 2.2, value_float: 2.2, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102401/pressure" },
  { minute: 20, carId: "M102401", subsystem: "PRESSURE", signal_name: "brake_pipe", value: 4.2, value_float: 4.2, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102401/pressure" },
  { minute: 20, carId: "M102401", subsystem: "PRESSURE", signal_name: "brake_cylinder", value: 1.8, value_float: 1.8, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102401/pressure" },
  { minute: 30, carId: "M102401", subsystem: "PRESSURE", signal_name: "brake_pipe", value: 4.1, value_float: 4.1, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102401/pressure" },
  { minute: 30, carId: "M102401", subsystem: "PRESSURE", signal_name: "brake_cylinder", value: 1.3, value_float: 1.3, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102401/pressure" },
  { minute: 40, carId: "M102401", subsystem: "PRESSURE", signal_name: "brake_pipe", value: 4.2, value_float: 4.2, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102401/pressure" },
  { minute: 40, carId: "M102401", subsystem: "PRESSURE", signal_name: "brake_cylinder", value: 1.1, value_float: 1.1, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102401/pressure" },
  { minute: 12, carId: "M102402", subsystem: "PRESSURE", signal_name: "brake_pipe", value: 4.0, value_float: 4.0, value_text: null, unit: "bar", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102402/pressure" },
  { minute: 12, carId: "M102402", subsystem: "PRESSURE", signal_name: "brake_cylinder", value: 2.7, value_float: 2.7, value_text: null, unit: "bar", quality_status: "BAD", source_topic: "rams/KA_DATA_DUMMY/M102402/pressure" },
  { minute: 15, carId: "T102401", subsystem: "AC", signal_name: "actual_temperature", value: 27.3, value_float: 27.3, value_text: null, unit: "°C", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/T102401/ac" },
  { minute: 15, carId: "T102401", subsystem: "AC", signal_name: "humidity", value: 64, value_float: 64, value_text: null, unit: "%", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/T102401/ac" },
  { minute: 16, carId: "T102401", subsystem: "AC", signal_name: "voltage_r", value: 383, value_float: 383, value_text: null, unit: "V", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/T102401/ac" },
  { minute: 16, carId: "T102401", subsystem: "AC", signal_name: "voltage_s", value: 381, value_float: 381, value_text: null, unit: "V", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/T102401/ac" },
  { minute: 16, carId: "T102401", subsystem: "AC", signal_name: "voltage_t", value: 382, value_float: 382, value_text: null, unit: "V", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/T102401/ac" },
  { minute: 17, carId: "T102401", subsystem: "AC", signal_name: "compressor_current", value: 8.4, value_float: 8.4, value_text: null, unit: "A", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/T102401/ac" },
  { minute: 18, carId: "M102402", subsystem: "DOOR", signal_name: "door_state", value: "CLOSED", value_float: null, value_text: "CLOSED", unit: null, quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/M102402/door" },
  { minute: 19, carId: null, subsystem: "TRACTION", signal_name: "speed", value: 72, value_float: 72, value_text: null, unit: "km/h", quality_status: "GOOD", source_topic: "rams/KA_DATA_DUMMY/train/speed" },
  { minute: 21, carId: "UNKNOWN-CAR", subsystem: "PRESSURE", signal_name: "brake_pipe", value: null, value_float: null, value_text: null, unit: "bar", quality_status: "BAD", source_topic: null }
];

export const telemetryRamsDummy: RamsTelemetryDto[] = seeds.map((seed, index) => {
  const { minute, carId = null, ...record } = seed;
  return {
    id: index + 1,
    event_time: `${baseTime}${String(minute).padStart(2, "0")}:00.000Z`,
    trainset_id: "KA_DATA_DUMMY",
    car_id: carId,
    ...record
  };
});
