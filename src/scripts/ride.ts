// Sekcja „przejazd”: przewijanie strony prowadzi wymyśloną trasę (dane
// syntetyczne, nie z prawdziwego przejazdu) i steruje podglądem ekranu.
import { applyPhone } from './phone';
import { KM, ele, grade, speed, profilePath } from './route';
import { createStreaks } from './streaks';

const stage = document.querySelector<HTMLElement>('.ride');
if (stage) {
  const phone = stage.querySelector<HTMLElement>('.phone')!;
  const chapters = [...stage.querySelectorAll<HTMLElement>('.ch')];
  const starts = chapters.map((c) => Number(c.dataset.at));
  const svg = stage.querySelector<SVGSVGElement>('.profile')!;
  const W = 1000, H = 120;
  const { d, y } = profilePath(W, H);
  svg.querySelectorAll('.p-line').forEach((l) => l.setAttribute('d', d));
  svg.querySelector('.p-fill')!.setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
  const done = svg.querySelector<SVGRectElement>('.p-clip')!;
  const dot = stage.querySelector<HTMLElement>('.p-dot')!;
  const kmLabel = stage.querySelector<HTMLElement>('[data-km]')!;
  const decimal = document.documentElement.lang === 'pl' ? ',' : '.';

  const streaks = createStreaks(stage.querySelector<HTMLCanvasElement>('canvas')!, (w, h) => [w * (w > 900 ? 0.72 : 0.5), h * 0.42], () => ['215,255,62', '255,110,92']);

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
    streaks(hot);
  }
  const tick = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  update();
}
