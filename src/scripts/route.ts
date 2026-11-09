// Wymyślona trasa (dane syntetyczne, nie z prawdziwego przejazdu), wspólna dla
// sekcji „przejazd” i studia. Pozycja `x` od 0 do 1.
const g = (x: number, m: number, s: number) => Math.exp(-(((x - m) / s) ** 2) / 2);

export const KM = 62;
export const ele = (x: number) => 210 + 62 * g(x, 0.17, 0.05) + 500 * g(x, 0.5, 0.06) + 46 * g(x, 0.82, 0.06);
export const grade = (x: number) => ((ele(x + 0.0005) - ele(x - 0.0005)) / (0.001 * KM * 1000)) * 100;
export const speed = (x: number) => {
  const d = grade(x);
  const v = d > 0 ? 28 - d * 2.35 : 28 - d * 3.6;
  return Math.max(9, v + Math.sin(x * 90) * 0.8);
};

// Ścieżka profilu trasy w polu W × H.
export function profilePath(W: number, H: number) {
  const y = (e: number) => H - 8 - ((e - 200) / 540) * (H - 24);
  let d = '';
  for (let i = 0; i <= 260; i++) d += `${i ? 'L' : 'M'}${(i / 260) * W} ${y(ele(i / 260)).toFixed(1)}`;
  return { d, y };
}
