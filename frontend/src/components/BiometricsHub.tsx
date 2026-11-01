import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Activity, Moon, Heart, Zap } from 'lucide-react';

export const BiometricsHub: React.FC = () => {
  const { biometricsHistory, todayBiometrics, updateTodayBiometrics } = useFitness();

  const [editSleep, setEditSleep] = useState(todayBiometrics.sleepHours);
  const [editHrv, setEditHrv] = useState(todayBiometrics.hrv);
  const [editRhr, setEditRhr] = useState(todayBiometrics.restingHr);

  const handleUpdate = () => {
    updateTodayBiometrics({
      sleepHours: Number(editSleep),
      hrv: Number(editHrv),
      restingHr: Number(editRhr),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Readiness Readout */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            Computed Dynamic Readiness Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-mono font-bold text-slate-900">
              {todayBiometrics.readiness}
            </span>
            <span className="text-slate-400 font-mono text-sm">/ 100</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ml-2 ${
                todayBiometrics.readiness >= 85
                  ? 'bg-emerald-50 text-emerald-700'
                  : todayBiometrics.readiness >= 70
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {todayBiometrics.readiness >= 85
                ? 'High Autonomic Balance'
                : todayBiometrics.readiness >= 70
                ? 'Moderate Recovery'
                : 'Accumulated Fatigue'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Dynamically synthesized from your sleeping duration, parasympathetic HRV, and nocturnal resting pulse.
          </p>
        </div>

        {/* Telemetry Input Adjusters (No hardcoding!) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 w-full md:w-80 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
            Update Today's Biomarkers
          </span>

          <div className="flex items-center justify-between gap-2">
            <label className="text-slate-600">Sleep (hours):</label>
            <input
              type="number"
              step="0.1"
              min="3"
              max="14"
              value={editSleep}
              onChange={(e) => {
                setEditSleep(Number(e.target.value));
                updateTodayBiometrics({ sleepHours: Number(e.target.value) });
              }}
              className="w-20 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-right"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <label className="text-slate-600">Resting HRV (ms):</label>
            <input
              type="number"
              min="20"
              max="150"
              value={editHrv}
              onChange={(e) => {
                setEditHrv(Number(e.target.value));
                updateTodayBiometrics({ hrv: Number(e.target.value) });
              }}
              className="w-20 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-right"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <label className="text-slate-600">Resting HR (bpm):</label>
            <input
              type="number"
              min="35"
              max="110"
              value={editRhr}
              onChange={(e) => {
                setEditRhr(Number(e.target.value));
                updateTodayBiometrics({ restingHr: Number(e.target.value) });
              }}
              className="w-20 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-right"
            />
          </div>
        </div>
      </div>

      {/* 7-Day Trend History Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 text-xs font-mono text-slate-500">
          7-DAY RECOVERY TELEMETRY LOG
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-5">Day</th>
                <th className="py-2.5 px-5">Sleep</th>
                <th className="py-2.5 px-5">HRV</th>
                <th className="py-2.5 px-5">Resting HR</th>
                <th className="py-2.5 px-5 text-right">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {biometricsHistory.map((item, idx) => {
                const isToday = idx === biometricsHistory.length - 1;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/50 ${isToday ? 'bg-slate-50 font-bold' : ''}`}
                  >
                    <td className="py-3 px-5 text-slate-900">
                      {item.date} {isToday ? '(Today)' : ''}
                    </td>
                    <td className="py-3 px-5 text-slate-600">{item.sleepHours} hrs</td>
                    <td className="py-3 px-5 text-slate-600">{item.hrv} ms</td>
                    <td className="py-3 px-5 text-slate-600">{item.restingHr} bpm</td>
                    <td className="py-3 px-5 text-right text-slate-900">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          item.readiness >= 85
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.readiness}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
