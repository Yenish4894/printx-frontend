"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function CountdownTimer() {
  const [time, setTime] = useState({ h: "02", m: "45", s: "12" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        h: pad(23 - now.getHours()),
        m: pad(59 - now.getMinutes()),
        s: pad(59 - now.getSeconds()),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const cells: [string, string][] = [
    [time.h, "Hours"],
    [time.m, "Mins"],
    [time.s, "Secs"],
  ];

  return (
    <div className="flex justify-center gap-3">
      {cells.map(([val, label]) => (
        <div key={label} className="bg-white/5 p-3 rounded-lg border border-white/10 w-16">
          <p className="text-xl font-black text-white">{val}</p>
          <p className="text-[8px] font-bold uppercase opacity-60">{label}</p>
        </div>
      ))}
    </div>
  );
}
