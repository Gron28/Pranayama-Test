export const levelConfigs = {
  1: { out: 20, in: 10, hold: 0 },
  2: { out: 30, in: 15, hold: 0 },
  3: { out: 15, in: 15, hold: 15 },
  4: { out: 40, in: 20, hold: 0 },
  5: { out: 20, in: 10, hold: 30 }
};

export function formatTime(seconds, includeHours = false) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  return includeHours
    ? `${h.toString().padStart(2, '0')}:${mStr}:${sStr}`
    : `${mStr}:${sStr}`;
}
