// Sekcja „przejazd”: przewijanie strony prowadzi wymyśloną trasę (dane
// syntetyczne, nie z prawdziwego przejazdu) i steruje podglądem ekranu.
import { applyPhone } from './phone';

const stage = document.querySelector<HTMLElement>('.ride');
if (stage) {
  const g = (x: number, m: number, s: number) => Math.exp(-(((x - m) / s) ** 2) / 2);
  const KM = 62;
  const ele = (x: number) => 210 + 62 * g(x, 0.17, 0.05) + 500 * g(x, 0.5, 0.06) + 46 * g(x, 0.82, 0.06);
  const grade = (x: number) => ((ele(x + 0.0005) - ele(x - 0.0005)) / (0.001 * KM * 1000)) * 100;
  const speed = (x: number) => {
    const d = grade(x);
    const v = d > 0 ? 28 - d * 2.35 : 28 - d * 3.6;
    return Math.max(9, v + Math.sin(x * 90) * 0.8);
  };

  const phone = stage.querySelector<HTMLElement>('.phone')!;
  const chapters = [...stage.querySelectorAll<HTMLElement>('.ch')];
  const starts = chapters.map((c) => Number(c.dataset.at));
  const svg = stage.querySelector<SVGSVGElement>('.profile')!;
  const W = 1000, H = 120;
  const y = (e: number) => H - 8 - ((e - 200) / 540) * (H - 24);
  let d = '';
  for (let i = 0; i <= 260; i++) d += `${i ? 'L' : 'M'}${(i / 260) * W} ${y(ele(i / 260)).toFixed(1)}`;
  svg.querySelectorAll('.p-line').forEach((l) => l.setAttribute('d', d));
  svg.querySelector('.p-fill')!.setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
  const done = svg.querySelector<SVGRectElement>('.p-clip')!;
  const dot = stage.querySelector<HTMLElement>('.p-dot')!;
  const kmLabel = stage.querySelector<HTMLElement>('[data-km]')!;
  const decimal = document.documentElement.lang === 'pl' ? ',' : '.';

  const canvas = stage.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const streaks = Array.from({ length: 150 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), s: 0.5 + Math.random() }));
  let power = 0, target = 0, running = false;
  const size = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  size();
  addEventListener('resize', size);

  function draw() {
    power += (target - power) * 0.09;
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    const cx = w * (w > 900 ? 0.72 : 0.5), cy = h * 0.42, max = Math.hypot(w, h) * 0.75;
    ctx.lineCap = 'round';
    for (const p of streaks) {
      p.r += 0.012 * p.s * (0.4 + power);
      if (p.r > 1) p.r = 0.05;
      const a = p.r * p.r * max, b = a + (40 + 300 * p.r) * power;
      ctx.strokeStyle = `rgba(${p.s > 1.2 ? '215,255,62' : '255,110,92'},${Math.min(1, p.r * 1.6) * power})`;
      ctx.lineWidth = 0.7 + p.r * 2.4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(p.a) * a, cy + Math.sin(p.a) * a);
      ctx.lineTo(cx + Math.cos(p.a) * b, cy + Math.sin(p.a) * b);
      ctx.stroke();
    }
    if (power > 0.005 || target > 0) requestAnimationFrame(draw);
    else { running = false; ctx.clearRect(0, 0, w, h); }
  }

  const motion = matchMedia('(prefers-reduced-motion: no-preference)').matches;
  let queued = false;
  function update() {
    queued = false;
    const r = stage!.getBoundingClientRect();
    const span = r.height - innerHeight;
    const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    const x = 0.01 + p * 0.98;
    let active = 0;
    starts.forEach((s, i) => { if (p >= s) active = i; });
    chapters.forEach((c, i) => c.classList.toggle('on', i === active));
    const widget = chapters[active].dataset.w!;
    phone.querySelectorAll<HTMLElement>('.w').forEach((w) => w.classList.toggle('on', w.dataset.w === widget));
    phone.classList.toggle('radar', chapters[active].dataset.radar !== undefined);
    const v = speed(x), gr = grade(x), km = x * KM;
    const cars = phone.querySelectorAll<HTMLElement>('.ph-radar i');
    cars[0].style.bottom = `${10 + ((p * 900) % 70)}%`;
    cars[1].style.bottom = `${40 + ((p * 600) % 50)}%`;
    applyPhone(phone, { speed: v, grade: gr, hr: 118 + Math.max(0, gr) * 6.5, cad: gr < -3 ? 0 : 84 - Math.max(0, gr) * 2, ele: ele(x), km, progress: p, decimal });
    done.setAttribute('width', String(x * W));
    dot.style.left = `${x * 100}%`;
    dot.style.top = `${(y(ele(x)) / H) * 100}%`;
    kmLabel.textContent = `${km.toFixed(1).replace('.', decimal)} km`;
    const hot = motion && v >= 44 ? Math.min(1, (v - 44) / 10) : 0;
    stage!.style.setProperty('--heat', hot.toFixed(3));
    target = hot;
    if (target > 0 && !running) { running = true; requestAnimationFrame(draw); }
  }
  const tick = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  update();
}
