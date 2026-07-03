import type { Insight } from "@/types/insight";

export const insightDummy: Insight[] = [
  {
    id: "INS-001",
    trainsetId: "TS-001",
    trainsetName: "Anggrek Lembah M02406",
    carNumber: 5,
    subsystem: "Brake System",
    event: "LOCAL_BC_DEVIATION",
    severity: "High",
    confidence: 86,
    healthScore: 42,
    diagnosis: "Anomali lokal sistem rem pada Car 5",
    risk: "Potensi respon pengereman tidak merata pada satu gerbong.",
    evidence: { bp: 4.2, bc: 1.1, medianBc: 2.3, threshold: 0.5, difference: 1.2 },
    structuredInsight: {
      faultType: "LOCAL_BRAKE_ABNORMAL",
      detectedPattern: "BC pressure lower than trainset median while BP remains stable",
      affectedComponent: "Brake Cylinder"
    },
    naturalInsight:
      "Deviasi signifikan antara tekanan Brake Pipe dan Brake Cylinder saat siklus pengereman penuh. Median Brake Cylinder harian adalah 1.8 bar, namun tercatat anomali hingga 1.1 bar pada jam 10:15 yang berpotensi menandakan malfungsi katup atau kebocoran pneumatik.",
    recommendation: "Lakukan inspeksi brake cylinder, valve, dan potensi kebocoran lokal pada Car 5."
  },
  {
    id: "INS-002",
    trainsetId: "TS-002",
    trainsetName: "Argo Wilis M02511",
    carNumber: 2,
    subsystem: "Genset",
    event: "GENSET_FREQUENCY_DRIFT",
    severity: "Medium",
    confidence: 78,
    healthScore: 71,
    diagnosis: "Frekuensi output genset mulai keluar dari rentang normal",
    risk: "Beban kelistrikan auxiliary berpotensi tidak stabil bila tren berlanjut.",
    evidence: { voltage: 384, frequency: 47.8, rpm: 1420, fuelLevel: 54 },
    structuredInsight: {
      faultType: "GENSET_OUTPUT_INSTABILITY",
      detectedPattern: "Frequency drift with stable voltage",
      affectedComponent: "Governor or load controller"
    },
    naturalInsight:
      "Genset Car 2 masih berjalan, tetapi frekuensi output turun ke 47.8 Hz. Kondisi ini belum kritis namun perlu dipantau karena dapat mempengaruhi stabilitas sistem auxiliary.",
    recommendation: "Periksa governor, load controller, dan beban auxiliary pada jadwal inspeksi berikutnya."
  },
  {
    id: "INS-003",
    trainsetId: "TS-003",
    trainsetName: "Lodaya M02103",
    carNumber: 7,
    subsystem: "Door",
    event: "DOOR_COMMUNICATION_LOSS",
    severity: "High",
    confidence: 74,
    healthScore: 50,
    diagnosis: "Data pintu Car 7 tidak konsisten dan beberapa paket telemetry hilang",
    risk: "Status pintu dapat terlambat terlihat oleh operator.",
    evidence: { missingPackets: 18, doorOpenCount: 33, lastValidSignalMinutes: 64 },
    structuredInsight: {
      faultType: "DOOR_STATUS_DATA_LIMITED",
      detectedPattern: "Intermittent door signal and delayed update",
      affectedComponent: "Door controller communication"
    },
    naturalInsight:
      "Car 7 memiliki keterbatasan data pintu. Sinyal terakhir yang valid sudah lebih dari satu jam, sehingga status pintu perlu dikonfirmasi dari sistem backend atau inspeksi lapangan.",
    recommendation: "Validasi koneksi door controller dan pastikan gateway menerima data terbaru."
  }
];

export const carInsightsDummy: Insight[] = Array.from({ length: 10 }, (_, i) => {
  const carNumber = i + 1;
  const existingInsight = insightDummy.find(ins => ins.carNumber === carNumber);
  
  if (existingInsight) {
    return existingInsight;
  }
  
  return {
    id: `INS-001-C${carNumber}`,
    trainsetId: "ALL",
    trainsetName: "Semua Kereta (Armada Aktif)",
    carNumber,
    subsystem: "All Systems",
    event: "NO_ACTIVE_ANOMALY",
    severity: "Normal",
    confidence: 100,
    healthScore: Math.floor(Math.random() * 10) + 90, // Random 90-99
    diagnosis: "Status Armada Sehat",
    risk: "Normal",
    evidence: { status: "OK", lastCheck: new Date().toISOString() },
    structuredInsight: {
      faultType: "NONE",
      detectedPattern: "Operating within normal parameters",
      affectedComponent: "None"
    },
    naturalInsight: "Sisa gerbong dan armada dalam kondisi normal. Tidak ada anomali aktif tambahan pada 3 kereta yang sedang beroperasi (Anggrek Lembah, Argo Wilis, Lodaya).",
    recommendation: "Lanjutkan jadwal pemantauan rutin."
  };
});
