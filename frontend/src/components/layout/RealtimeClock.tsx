"use client";

import { useEffect, useState } from "react";

export function RealtimeClock({ isCollapsed }: { isCollapsed: boolean }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      setTime(new Date());
    }, 0);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!time) {
    return (
      <div className="realtime-clock" style={{ opacity: 0 }}>
        {isCollapsed ? (
          <>
            <div className="clock-time">00:00</div>
            <div className="clock-tz">WIB</div>
          </>
        ) : (
          <>
            <div className="clock-day">Senin</div>
            <div className="clock-date">1 Jan 2025</div>
            <div className="clock-time">00:00:00 WIB</div>
          </>
        )}
      </div>
    );
  }

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const dayName = days[time.getDay()];
  const dateNum = time.getDate();
  const monthName = months[time.getMonth()];
  const year = time.getFullYear();
  
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  if (isCollapsed) {
    return (
      <div className="realtime-clock collapsed">
        <div className="clock-time">{hours}:{minutes}</div>
        <div className="clock-tz">WIB</div>
      </div>
    );
  }

  return (
    <div className="realtime-clock expanded">
      <div className="clock-day">{dayName}</div>
      <div className="clock-date">{dateNum} {monthName} {year}</div>
      <div className="clock-time">{hours}:{minutes}:{seconds} WIB</div>
    </div>
  );
}
