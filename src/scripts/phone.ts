// Wspólne ustawianie wartości podglądu aplikacji (`Phone.astro`).
import { drawBlock, fitCanvas, type GaugeSkin } from './gauges';
import { ele, profilePath } from './route';

export interface PhoneState { speed: number; grade: number; hr: number; cad: number; ele: number; km: number; progress: number; decimal: string; }

// blok prędkości w stylu Alrydee (ciemny), wskaźnik łuk - domyślny w aplikacji
const skin: GaugeSkin = { dark: true, number: '#FFFFFF', label: '#9C9AA6', divider: '#343844', ink: '#FFFFFF', weight: 500 };

export function applyPhone(el: HTMLElement, s: PhoneState) {
  const set = (k: string, v: string) => { const n = el.querySelector(`[data-v="${k}"]`); if (n && n.textContent !== v) n.textContent = v; };
  set('dist', s.km.toFixed(1).replace('.', s.decimal));
  set('hr', String(Math.round(s.hr)));
  set('cad', String(Math.round(s.cad)));
  set('ele', String(Math.round(s.ele)));
  set('grade', `${s.grade > 0.4 ? '+' : ''}${Math.round(s.grade)}%`);
  const mins = Math.round((s.km / 24.5) * 60);
  set('time', `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`);
  set('vam', String(Math.max(0, Math.round((s.speed * 1000 * s.grade) / 100))));
  const canvas = el.querySelector<HTMLCanvasElement>('[data-gauge]');
  if (canvas) {
    const { ctx, w, h } = fitCanvas(canvas);
    if (w && h) drawBlock(ctx, w, h, { gauge: 'arc', kmh: s.speed, text: String(Math.round(s.speed)), unit: 'km/h', bars: [], skin });
  }
  const done = el.querySelector<SVGPathElement>('.m-done');
  if (done) {
    done.style.strokeDasharray = `${s.progress * 100} 100`;
    const p = done.getPointAtLength(s.progress * done.getTotalLength());
    el.querySelector('.m-pin')?.setAttribute('transform', `translate(${(p.x - 20).toFixed(1)} ${(p.y - 135).toFixed(1)})`);
  }
  el.classList.toggle('hyper', s.speed >= 50);
}

/** Wykres wysokości w szczegółach przejazdu - rysowany raz. */
export function setupDetails(el: HTMLElement) {
  const W = 300, H = 90;
  const { d } = profilePath(W, H);
  el.querySelector('.dt-line')?.setAttribute('d', d);
  el.querySelector('.dt-fill')?.setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
}

/** Kursor na wykresie (0-1) i ten sam punkt na mapie, jak przeciąganie wykresu w aplikacji. */
export function scrubDetails(el: HTMLElement, x: number) {
  const scrub = el.querySelector<HTMLElement>('.dt-scrub');
  const track = el.querySelector<SVGPathElement>('.dt-track');
  if (!scrub || !track) return;
  scrub.style.left = `${x * 100}%`;
  const label = scrub.querySelector('b')!;
  const text = `${Math.round(ele(x))} m`;
  if (label.textContent !== text) label.textContent = text;
  const p = track.getPointAtLength(x * track.getTotalLength());
  const cursor = el.querySelector('.dt-cursor')!;
  cursor.setAttribute('cx', p.x.toFixed(1));
  cursor.setAttribute('cy', p.y.toFixed(1));
}
