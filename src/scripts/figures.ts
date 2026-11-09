// Ilustracje w pomocy: rysowane na płótnie w wirtualnym polu 320 × 180, tak
// samo jak w aplikacji (`rydee-app/lib/help_figures.dart`). Typ i podpisy
// z pola `figure` pytania w `content/help/<język>.json`.
import { drawBlock, type GaugeId } from './gauges';

export interface Fig { type: string; alt?: string; labels?: string[]; [key: string]: unknown }
interface Pal { panel: string; screen: string; card: string; line: string; ink: string; label: string; acc: string; onAcc: string }
type Draw = (d: D, t: number, f: Fig, L: string[]) => void;

export const W = 320, H = 180;
const RED = '#E24B4A', GREEN = '#1D9E75', AMBER = '#EF9F27', BLUE = '#378ADD', GRAY = '#888780';
const SPEED = ['#378ADD', '#1D9E75', '#639922', '#EF9F27', '#E24B4A'];
const HR = ['#888780', '#378ADD', '#1D9E75', '#EF9F27', '#E24B4A'];
const POWER = ['#888780', '#378ADD', '#1D9E75', '#97C459', '#FAC775', '#EF9F27', '#E24B4A'];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const pulse = (t: number, at: number) => Math.max(0, 1 - Math.abs(t - at) / 0.06);
const font = (size: number, weight: number) => `${weight} ${size}px "Geist Variable", system-ui, sans-serif`;
let decimal = '.';
const num = (v: number, digits = 1) => v.toFixed(digits).replace('.', decimal);

function rgba(color: string, a: number) {
  if (!color.startsWith('#')) return color;
  let h = color.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return `rgba(${[0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',')},${a})`;
}

// Proste rysowanie w polu 320 × 180.
class D {
  constructor(readonly c: CanvasRenderingContext2D, readonly p: Pal) {}
  rect(x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, sw = 1) {
    const c = this.c;
    c.beginPath(); c.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = sw; c.stroke(); }
  }
  line(x1: number, y1: number, x2: number, y2: number, color: string, w = 1, dash?: number[]) {
    const c = this.c;
    c.setLineDash(dash ?? []); c.strokeStyle = color; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]);
  }
  poly(pts: [number, number][], color: string, w = 2, dash?: number[]) {
    const c = this.c;
    c.setLineDash(dash ?? []); c.strokeStyle = color; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.setLineDash([]);
  }
  area(pts: [number, number][], base: number, fill: string) {
    const c = this.c;
    c.beginPath(); c.moveTo(pts[0][0], base); pts.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(pts[pts.length - 1][0], base);
    c.closePath(); c.fillStyle = fill; c.fill();
  }
  circle(x: number, y: number, r: number, fill?: string, stroke?: string, sw = 1) {
    const c = this.c;
    c.beginPath(); c.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = sw; c.stroke(); }
  }
  text(s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 400) {
    const c = this.c;
    c.font = font(size, weight); c.fillStyle = color; c.textAlign = align; c.textBaseline = 'middle';
    c.fillText(s, x, y);
  }
  measure(s: string, size: number, weight = 400) { this.c.font = font(size, weight); return this.c.measureText(s).width; }
  arrow(x1: number, y1: number, x2: number, y2: number, color: string, w = 1.5, head = 6) {
    this.line(x1, y1, x2, y2, color, w);
    const a = Math.atan2(y2 - y1, x2 - x1);
    this.poly([[x2 - Math.cos(a - 0.5) * head, y2 - Math.sin(a - 0.5) * head], [x2, y2], [x2 - Math.cos(a + 0.5) * head, y2 - Math.sin(a + 0.5) * head]], color, w);
  }
  // palec: kółko, przy dotknięciu mocniejsze
  finger(x: number, y: number, alpha: number, press = 0) {
    if (alpha <= 0) return;
    this.c.globalAlpha = alpha;
    this.circle(x, y, 10 - press * 2, rgba(this.p.ink, 0.16 + press * 0.2), rgba(this.p.ink, 0.7), 1.5);
    this.c.globalAlpha = 1;
  }
  clip(x: number, y: number, w: number, h: number, r: number, body: () => void) {
    const c = this.c;
    c.save(); c.beginPath(); c.roundRect(x, y, w, h, r); c.clip(); body(); c.restore();
  }
  alpha(a: number, body: () => void) { const c = this.c, o = c.globalAlpha; c.globalAlpha = o * a; body(); c.globalAlpha = o; }
}

// ---------- ekran główny ----------
export interface ScreenBox { x: number; y: number; w: number; h: number }
// Układ miniatury ekranu: telefon, prędkość, kafelki, widget (wspólny z aplikacją).
export function screenLayout(t: number, f: Fig) {
  const all = f.focus === 'all';
  const px = all ? 52 : 118, py = 6, pw = 84, ph = 168;
  const sx = px + 4, sy = py + 4, sw = pw - 8, sh = ph - 8;
  const rows = f.gesture === 'drag' ? 3 - ease(seg(t, 0.12, 0.42)) + ease(seg(t, 0.6, 0.88)) : 3;
  const top = sy + 9, u = (sh - 9 - 8) / 10;
  const speed = { x: sx + 2, y: top, w: sw - 4, h: u * rows };
  const tiles = { x: sx + 2, y: top + u * rows, w: sw - 4, h: u * 2 };
  const widget = { x: sx + 2, y: tiles.y + tiles.h + 7, w: sw - 4, h: sy + sh - 3 - (tiles.y + tiles.h + 7) };
  return { phone: { x: px, y: py, w: pw, h: ph }, screen: { x: sx, y: sy, w: sw, h: sh }, speed, tiles, widget, rows };
}
const GAUGES: GaugeId[] = ['segments', 'arc', 'ring', 'dial', 'scale', 'history'];
export function screenGauge(t: number, f: Fig): GaugeId {
  if (f.gesture !== 'hold' || t < 0.42) return 'segments';
  return GAUGES[Math.min(GAUGES.length - 1, 1 + Math.floor((t - 0.42) / 0.1))];
}

const screen: Draw = (d, t, f, L) => {
  const { p } = d;
  const g = screenLayout(t, f);
  const { phone, screen: s, speed, tiles, widget } = g;
  d.rect(phone.x, phone.y, phone.w, phone.h, 14, '#050506', '#3a3c42');
  d.rect(s.x, s.y, s.w, s.h, 11, p.screen);
  d.text('9:41', s.x + 6, s.y + 5, 5, p.label);
  d.circle(s.x + s.w - 7, s.y + 5, 1.6, RED);
  // prędkość: ten sam blok co w studiu i aplikacji
  d.c.save(); d.c.translate(speed.x, speed.y);
  drawBlock(d.c, speed.w, speed.h, { gauge: screenGauge(t, f), kmh: 24, text: '24', unit: 'km/h', bars: Array.from({ length: 30 }, (_, i) => 18 + 8 * Math.sin(i / 4)), skin: { dark: true, number: p.ink, label: p.label, divider: p.line, ink: p.ink, weight: 500 } }, false);
  d.c.restore();
  // kafelki, przy przesunięciu dwie strony
  const off = f.gesture === 'swipe' ? -tiles.w * (ease(seg(t, 0.15, 0.45)) - ease(seg(t, 0.6, 0.85))) : 0;
  const pages = [['1:02', num(24.6), '142', '88'], ['312', '+4%', num(26.1), '1450']];
  d.clip(tiles.x, tiles.y - 1, tiles.w, tiles.h + 2, 3, () => {
    pages.forEach((values, page) => {
      const ox = tiles.x + off + page * tiles.w;
      values.forEach((v, i) => {
        const cw = (tiles.w - 2) / 2, ch = (tiles.h - 2) / 2;
        const x = ox + (i % 2) * (cw + 2), y = tiles.y + Math.floor(i / 2) * (ch + 2);
        d.rect(x, y, cw, ch, 3, p.card);
        d.text(v, x + cw / 2, y + ch / 2 + 0.5, 7.5, p.ink, 'center', 600);
      });
    });
  });
  const active = off < -tiles.w / 2 ? 1 : 0;
  [0, 1].forEach((i) => d.circle(tiles.x + tiles.w / 2 - 3 + i * 6, tiles.y + tiles.h + 3.5, 1.4, i === active ? p.ink : p.line));
  // widget: mapa
  d.clip(widget.x, widget.y, widget.w, widget.h, 4, () => {
    d.rect(widget.x, widget.y, widget.w, widget.h, 4, p.card);
    d.line(widget.x - 5, widget.y + 12, widget.x + widget.w + 5, widget.y + 30, p.line, 3);
    d.line(widget.x + 20, widget.y - 5, widget.x + 34, widget.y + widget.h + 5, p.line, 3);
    d.line(widget.x + widget.w - 14, widget.y - 5, widget.x + widget.w - 24, widget.y + widget.h + 5, p.line, 3);
    const r: [number, number][] = [[widget.x + 6, widget.y + widget.h - 6], [widget.x + 22, widget.y + widget.h * 0.6], [widget.x + 40, widget.y + widget.h * 0.55], [widget.x + 56, widget.y + widget.h * 0.3], [widget.x + widget.w - 4, widget.y + 8]];
    d.poly(r, BLUE, 2.2);
    d.circle(r[2][0], r[2][1], 3, BLUE, '#fff', 1.2);
  });
  // radar: pasek przy prawej krawędzi i nadjeżdżające pojazdy
  if (f.focus === 'radar') {
    const x = s.x + s.w - 4, y0 = tiles.y, y1 = widget.y + widget.h;
    d.rect(x, y0, 3, y1 - y0, 1.5, rgba(p.line, 0.9));
    [0, 0.5].forEach((o) => {
      const k = (t + o) % 1;
      const y = y1 - 8 - k * (y1 - y0 - 8);
      d.rect(x - 0.5, y, 4, 8, 1.5, k > 0.6 ? RED : AMBER);
    });
  }
  // podświetlenie obszaru
  const handleY = tiles.y;
  const regions: Record<string, ScreenBox> = {
    speed, tiles: { ...tiles, h: tiles.h + 6 }, widgets: widget,
    handle: { x: s.x + 2, y: handleY - 6, w: s.w - 4, h: 12 },
    radar: { x: s.x + s.w - 9, y: tiles.y - 2, w: 8, h: widget.y + widget.h - tiles.y + 4 },
  };
  if (f.gesture === 'drag' || f.focus === 'handle') d.rect(s.x + s.w / 2 - 8, handleY - 1.5, 16, 3, 1.5, p.label);
  const focusKey = f.focus === 'all' ? ['speed', 'tiles', 'widgets'][Math.min(2, Math.floor(t * 3))] : String(f.focus);
  const fr = regions[focusKey];
  if (fr) {
    const c = d.c;
    c.save();
    c.beginPath(); c.roundRect(s.x, s.y, s.w, s.h, 11); c.roundRect(fr.x - 1, fr.y - 1, fr.w + 2, fr.h + 2, 4);
    c.fillStyle = rgba(p.screen, 0.62); c.fill('evenodd');
    c.restore();
    d.rect(fr.x - 1, fr.y - 1, fr.w + 2, fr.h + 2, 4, undefined, p.acc, 1.5);
  }
  // podpisy obszarów
  if (f.focus === 'all') {
    [speed, tiles, widget].forEach((r, i) => {
      const on = focusKey === ['speed', 'tiles', 'widgets'][i];
      const y = r.y + r.h / 2, x0 = phone.x + phone.w + 6;
      d.line(x0, y, x0 + 22, y, on ? p.acc : p.line, 1.5);
      d.text(L[i] ?? '', x0 + 30, y, 14, on ? p.ink : p.label, 'left', on ? 600 : 400);
    });
  }
  // gesty
  if (f.gesture === 'swipe') {
    const y = tiles.y + tiles.h / 2;
    d.finger(tiles.x + tiles.w - 8 - (tiles.w - 16) * ease(seg(t, 0.15, 0.45)), y, seg(t, 0.08, 0.15) * (1 - seg(t, 0.47, 0.52)), 1);
    d.finger(tiles.x + 8 + (tiles.w - 16) * ease(seg(t, 0.6, 0.85)), y, seg(t, 0.54, 0.6) * (1 - seg(t, 0.87, 0.92)), 1);
  } else if (f.gesture === 'drag') {
    d.finger(s.x + s.w / 2, handleY, seg(t, 0.04, 0.1) * (1 - seg(t, 0.9, 0.96)), seg(t, 0.1, 0.12));
  } else if (f.gesture === 'hold') {
    const x = speed.x + speed.w / 2, y = speed.y + speed.h / 2;
    const a = seg(t, 0.04, 0.1) * (1 - seg(t, 0.46, 0.52));
    d.finger(x, y, a, 1);
    if (a > 0) { const c = d.c; c.strokeStyle = p.acc; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * seg(t, 0.1, 0.4)); c.stroke(); }
  }
};

// ---------- kroki ----------
const steps: Draw = (d, t, _f, L) => {
  const { p } = d;
  const n = L.length, size = 12, h = 30, gap = 22, maxW = W - 24;
  const widths = L.map((s) => Math.min(maxW, d.measure(s, size, 500) + 24));
  const rows: number[][] = [[]];
  let rowW = 0;
  widths.forEach((w, i) => {
    const add = (rows[rows.length - 1].length ? gap : 0) + w;
    if (rowW + add > maxW && rows[rows.length - 1].length) { rows.push([i]); rowW = w; } else { rows[rows.length - 1].push(i); rowW += add; }
  });
  const active = Math.min(n - 1, Math.floor(seg(t, 0, 0.86) * n));
  const totalH = rows.length * h + (rows.length - 1) * 20;
  let y = (H - totalH) / 2;
  const pos: [number, number, number][] = [];
  rows.forEach((row) => {
    const rw = row.reduce((s, i) => s + widths[i], 0) + gap * (row.length - 1);
    let x = (W - rw) / 2;
    row.forEach((i) => { pos[i] = [x, y, widths[i]]; x += widths[i] + gap; });
    y += h + 20;
  });
  pos.forEach(([x, y2, w], i) => {
    if (i < n - 1) {
      const [nx, ny] = pos[i + 1];
      const c = i < active ? p.acc : p.label;
      if (ny === y2) d.arrow(x + w + 4, y2 + h / 2, nx - 4, y2 + h / 2, c);
      else d.arrow(x + w / 2, y2 + h + 3, nx + widths[i + 1] / 2, ny - 3, c);
    }
    const on = i === active, done = i < active;
    d.rect(x, y2, w, h, 9, on ? p.acc : done ? p.card : undefined, on ? undefined : done ? p.acc : p.line, 1.2);
    d.c.save(); d.c.beginPath(); d.c.rect(x + 6, y2, w - 12, h); d.c.clip();
    d.text(L[i], x + w / 2, y2 + h / 2, size, on ? p.onAcc : done ? p.ink : p.label, 'center', 500);
    d.c.restore();
  });
  const slot = 0.86 / n, [ax, ay, aw] = pos[active];
  const local = (t - active * slot) / slot;
  d.finger(ax + aw / 2, ay + h / 2 + 4, t < 0.9 ? seg(local, 0, 0.25) * (1 - seg(local, 0.6, 0.9)) : 0, pulse(local, 0.35) * 1.5);
};

// ---------- nagrywanie ----------
function recButton(d: D, x: number, y: number, kind: 'start' | 'pause' | 'stop', press = 0) {
  const r = 22 - press * 2;
  if (kind === 'start') { d.circle(x, y, r, undefined, RED, 3); d.circle(x, y, 9, RED); }
  if (kind === 'pause') { d.circle(x, y, r, RED); d.rect(x - 7, y - 8, 4.5, 16, 1, '#fff'); d.rect(x + 2.5, y - 8, 4.5, 16, 1, '#fff'); }
  if (kind === 'stop') { d.circle(x, y, r, undefined, d.p.ink, 3); d.rect(x - 8, y - 8, 16, 16, 2, d.p.ink); }
}
const record: Draw = (d, t, f, L) => {
  const { p } = d;
  const cx = W / 2, cy = 86;
  if (f.stage === 'end') {
    recButton(d, cx - 36, cy, 'start');
    recButton(d, cx + 36, cy, 'stop', pulse(t, 0.25));
    d.text('‖ 1:02:14', cx, 26, 12, p.label, 'center', 500);
    d.finger(cx + 36, cy, seg(t, 0.12, 0.18) * (1 - seg(t, 0.3, 0.34)), pulse(t, 0.25) * 1.5);
    const k = ease(seg(t, 0.32, 0.46));
    if (k > 0) {
      const y = H - k * 112;
      d.c.fillStyle = rgba(p.panel, 0.5 * k); d.c.fillRect(0, 0, W, H);
      d.rect(24, y, W - 48, 130, 14, p.card, p.line);
      const ok = t > 0.78;
      d.rect(40, y + 18, W - 80, 32, 9, p.acc);
      d.text(ok ? '✓' : L[0], cx, y + 34, 13, p.onAcc, 'center', 600);
      d.text(L[1], cx, y + 72, 13, RED, 'center', 600);
      d.finger(cx, y + 34, seg(t, 0.6, 0.66) * (1 - seg(t, 0.82, 0.88)), pulse(t, 0.72) * 1.5);
    }
    return;
  }
  const phase = t < 0.28 ? 0 : t < 0.62 ? 1 : 2;
  const secs = phase === 0 ? 0 : Math.floor((Math.min(t, 0.62) - 0.28) * 40);
  const time = `0:${String(secs).padStart(2, '0')}`;
  if (phase === 1) {
    if (Math.floor(t * 20) % 2 === 0) d.circle(cx - 34, 26, 3.5, RED);
    d.text('REC  ' + time, cx - 26, 26, 12, RED, 'left', 600);
  } else if (phase === 2) d.text('‖ ' + time, cx, 26, 12, p.label, 'center', 500);
  if (phase === 0) recButton(d, cx, cy, 'start', pulse(t, 0.22));
  if (phase === 1) recButton(d, cx, cy, 'pause', pulse(t, 0.56));
  if (phase === 2) { recButton(d, cx - 36, cy, 'start'); recButton(d, cx + 36, cy, 'stop'); }
  if (phase > 0) d.text(L[phase - 1] ?? '', cx, 140, 13, p.ink, 'center', 500);
  d.finger(cx, cy, seg(t, 0.12, 0.18) * (1 - seg(t, 0.28, 0.32)), pulse(t, 0.22) * 1.5);
  d.finger(cx, cy, seg(t, 0.46, 0.52) * (1 - seg(t, 0.62, 0.66)), pulse(t, 0.56) * 1.5);
};

// ---------- autopauza ----------
const apSpeed = (x: number) => (x < 0.3 ? 24 + 2 * Math.sin(x * 30) : x < 0.38 ? 24 * (1 - seg(x, 0.3, 0.38)) : x < 0.58 ? 0 : x < 0.66 ? 26 * seg(x, 0.58, 0.66) : 26 + 2 * Math.sin(x * 25));
const autopause: Draw = (d, t, _f, L) => {
  const { p } = d;
  const x0 = 16, x1 = 304, y0 = 40, y1 = 150, X = (x: number) => x0 + x * (x1 - x0), Y = (v: number) => y1 - (v / 32) * (y1 - y0);
  d.rect(X(0.36), y0 - 6, X(0.6) - X(0.36), y1 - y0 + 6, 4, rgba(AMBER, 0.14));
  d.text(L[0] ?? '', (X(0.36) + X(0.6)) / 2, y0 + 4, 11, AMBER, 'center', 600);
  d.line(x0, y1, x1, y1, p.line, 1);
  const all: [number, number][] = Array.from({ length: 121 }, (_, i) => [X(i / 120), Y(apSpeed(i / 120))]);
  d.poly(all, p.line, 2);
  const upto = t;
  const pts = (a: number, b: number) => all.filter(([x]) => x >= X(a) && x <= X(Math.min(b, upto)));
  if (upto > 0) d.poly(pts(0, 0.36), p.acc, 2.6);
  if (upto > 0.36) d.poly(pts(0.36, 0.6), p.label, 2, [3, 4]);
  if (upto > 0.6) d.poly(pts(0.6, 1), p.acc, 2.6);
  const cx = X(t), cy = Y(apSpeed(t));
  d.line(cx, y0 - 6, cx, y1, rgba(p.ink, 0.3), 1);
  d.circle(cx, cy, 4, p.ink);
  const paused = t > 0.36 && t < 0.6;
  d.rect(x1 - 92, 8, 92, 20, 6, paused ? rgba(AMBER, 0.2) : rgba(RED, 0.16));
  d.text(paused ? `‖ ${L[1] ?? ''}` : '● REC', x1 - 46, 18, 11, paused ? AMBER : RED, 'center', 600);
  d.text(`${Math.round(apSpeed(t))} km/h`, x0, 18, 12, p.ink, 'left', 600);
};

// ---------- lista przejazdów ----------
const listrow: Draw = (d, t, f, L) => {
  const { p } = d;
  if (f.mode === 'months') {
    const k = ease(seg(t, 0.2, 0.4)) - ease(seg(t, 0.65, 0.85));
    let y = 12;
    const header = (title: string, sub: string, open: boolean) => {
      d.text(title, 22, y + 12, 14, p.ink, 'left', 600);
      if (sub) d.text(sub, 22, y + 28, 10, p.label);
      const c = d.c; c.save(); c.translate(292, y + 14); c.rotate(open ? 0 : -Math.PI / 2);
      d.poly([[-5, -2.5], [0, 2.5], [5, -2.5]], p.label, 1.8); c.restore();
      y += 40;
    };
    header(L[0], L[2] ?? '', k < 0.5);
    d.clip(12, y, W - 24, 80 * (1 - k), 8, () => {
      [L[3], L[4]].forEach((name, i) => {
        d.rect(16, y + i * 38, W - 32, 34, 8, p.card);
        d.text(name ?? '', 28, y + i * 38 + 12, 11, p.ink, 'left', 500);
        d.text(`${num(24.6 + i * 7.2)} km · 1:0${2 + i}`, 28, y + i * 38 + 25, 9, p.label);
      });
    });
    y += 80 * (1 - k) + 4;
    header(L[1], '', false);
    d.finger(150, 24, seg(t, 0.08, 0.14) * (1 - seg(t, 0.22, 0.26)), pulse(t, 0.17) * 1.5);
    d.finger(150, 24, seg(t, 0.55, 0.61) * (1 - seg(t, 0.68, 0.72)), pulse(t, 0.63) * 1.5);
    return;
  }
  const dx = -96 * ease(seg(t, 0.15, 0.42));
  const gone = ease(seg(t, 0.5, 0.65));
  const back = seg(t, 0.85, 1);
  const rows = [L[2], L[0], L[3]];
  let y = 18;
  rows.forEach((name, i) => {
    const h = 44;
    if (i === 1) {
      const hh = back > 0 ? h : h * (1 - gone);
      if (hh > 0.5) d.clip(16, y, W - 32, hh, 9, () => {
        d.rect(16, y, W - 32, h, 9, RED);
        d.text(L[1] ?? '', W - 28, y + h / 2, 12, '#fff', 'right', 600);
        d.alpha(back > 0 ? back : 1, () => {
          const x = 16 + (back > 0 ? 0 : dx);
          d.rect(x, y, W - 32, h, 9, p.card);
          d.text(name ?? '', x + 14, y + 16, 12, p.ink, 'left', 600);
          d.text(`${num(31.2)} km · 1:12`, x + 14, y + 31, 10, p.label);
        });
      });
      y += (hh > 0.5 ? hh : 0) + (back > 0 || gone < 1 ? 8 * (1 - gone * (back > 0 ? 0 : 1)) : 0);
      return;
    }
    d.rect(16, y, W - 32, h, 9, p.card);
    d.text(name ?? '', 30, y + 16, 12, p.ink, 'left', 600);
    d.text(`${num(i ? 18.4 : 42.7)} km · ${i ? '0:48' : '1:51'}`, 30, y + 31, 10, p.label);
    y += h + 8;
  });
  d.finger(270 - 96 * ease(seg(t, 0.15, 0.42)), 18 + 52 + 22, seg(t, 0.08, 0.14) * (1 - seg(t, 0.44, 0.5)), 1);
};

// ---------- wykres i mapa ----------
const scrubSpeed = (x: number) => 22 + 6 * Math.sin(x * 9) + 3 * Math.sin(x * 23);
const scrubRoute = (q: number): [number, number] => [214 + 80 * q + 10 * Math.sin(q * 7), 140 - 100 * q + 14 * Math.sin(q * 5)];
const scrub: Draw = (d, t) => {
  const { p } = d;
  const x0 = 14, x1 = 190, y0 = 40, y1 = 150;
  const q = 0.1 + 0.8 * (0.5 - 0.5 * Math.cos(Math.PI * 2 * t));
  const pts: [number, number][] = Array.from({ length: 81 }, (_, i) => [x0 + (i / 80) * (x1 - x0), y1 - (scrubSpeed(i / 80) / 34) * (y1 - y0)]);
  d.area(pts, y1, rgba(p.acc, 0.14));
  d.poly(pts, p.acc, 2);
  d.line(x0, y1, x1, y1, p.line);
  const cx = x0 + q * (x1 - x0), cy = y1 - (scrubSpeed(q) / 34) * (y1 - y0);
  d.line(cx, y0 - 8, cx, y1, rgba(p.ink, 0.35), 1);
  d.circle(cx, cy, 4, p.ink);
  const label = `${Math.round(scrubSpeed(q))} km/h`;
  const lw = d.measure(label, 11, 600) + 14;
  d.rect(clamp(cx - lw / 2, x0, x1 - lw), 12, lw, 20, 6, p.card, p.line);
  d.text(label, clamp(cx, x0 + lw / 2, x1 - lw / 2), 22, 11, p.ink, 'center', 600);
  d.finger(cx, y1 - 12, 1, 1);
  d.clip(200, 12, 108, 156, 10, () => {
    d.rect(200, 12, 108, 156, 10, p.card);
    d.line(196, 60, 312, 90, p.line, 5); d.line(240, 8, 226, 172, p.line, 5); d.line(196, 140, 312, 120, p.line, 4);
    const route = Array.from({ length: 61 }, (_, i) => scrubRoute(i / 60));
    d.poly(route, BLUE, 3);
    const [mx, my] = scrubRoute(q);
    d.circle(mx, my, 8, rgba(RED, 0.25));
    d.circle(mx, my, 4.5, RED, '#fff', 1.5);
  });
};

// ---------- kolor śladu ----------
const trail: Draw = (d, t, _f, L) => {
  const { p } = d;
  const mode = Math.min(2, Math.floor(t * 3));
  d.clip(14, 10, W - 28, H - 20, 12, () => {
    d.rect(14, 10, W - 28, H - 20, 12, p.card);
    d.line(0, 50, W, 80, p.line, 6); d.line(90, 0, 120, H, p.line, 6); d.line(220, 0, 200, H, p.line, 5); d.line(0, 150, W, 120, p.line, 4);
    const n = 60;
    const pt = (i: number): [number, number] => [40 + (i / n) * 240, 130 - 70 * Math.sin((i / n) * Math.PI * 0.9) + 10 * Math.sin(i / 5)];
    for (let i = 0; i < n; i++) {
      const x = i / n;
      const v = 18 + 20 * Math.sin(x * 6) ** 2;
      const g = 8 * Math.cos(x * Math.PI * 0.9) + 2 * Math.cos(i / 5);
      const hr = 110 + 70 * x + 10 * Math.sin(x * 9);
      const color = mode === 0 ? SPEED[clamp(Math.floor(v / 8), 0, 4)] : mode === 1 ? (g > 5 ? RED : g > 2 ? AMBER : g > -2 ? GREEN : BLUE) : HR[clamp(Math.floor((hr - 95) / 19), 0, 4)];
      d.poly([pt(i), pt(i + 1)], color, 4.5);
    }
  });
  const label = L[mode] ?? '';
  const lw = d.measure(label, 11, 600) + 34;
  d.rect(W - 24 - lw, 20, lw, 26, 8, p.panel, p.line);
  [0, 1, 2].forEach((i) => d.circle(W - 24 - lw + 12, 26 + i * 7, 2.2, [SPEED[0], AMBER, RED][i]));
  d.text(label, W - 24 - lw + 22, 33, 11, p.ink, 'left', 600);
  const local = (t * 3) % 1;
  d.finger(W - 24 - lw / 2, 36, t > 0.02 ? seg(local, 0, 0.08) * (1 - seg(local, 0.2, 0.3)) : 0, pulse(local, 0.1) * 1.5);
};

// ---------- wiatr ----------
const wind: Draw = (d, t, _f, L) => {
  const { p } = d;
  const cx = 92, cy = 90, r = 60;
  d.circle(cx, cy, r, undefined, p.line, 1.5);
  d.text('N', cx, cy - r - 9, 9, p.label, 'center', 600);
  d.c.fillStyle = p.ink; d.c.beginPath(); d.c.moveTo(cx, cy - 18); d.c.lineTo(cx + 11, cy + 14); d.c.lineTo(cx, cy + 7); d.c.lineTo(cx - 11, cy + 14); d.c.closePath(); d.c.fill();
  const a = t * Math.PI * 2;
  let rel = a % (Math.PI * 2); if (rel > Math.PI) rel -= Math.PI * 2;
  const kind = Math.abs(rel) < Math.PI / 3 ? 0 : Math.abs(rel) > (Math.PI * 2) / 3 ? 1 : 2;
  const color = [RED, GREEN, GRAY][kind];
  const sx = cx + Math.sin(a) * (r + 12), sy = cy - Math.cos(a) * (r + 12);
  const ex = cx + Math.sin(a) * (r - 22), ey = cy - Math.cos(a) * (r - 22);
  d.arrow(sx, sy, ex, ey, color, 4, 10);
  d.text(`14 km/h`, cx, cy + r + 12, 10, p.label, 'center', 500);
  [0, 1, 2].forEach((i) => {
    const y = 56 + i * 34, on = i === kind;
    if (on) d.rect(180, y - 14, 128, 28, 8, rgba([RED, GREEN, GRAY][i], 0.14));
    d.circle(194, y, 5, [RED, GREEN, GRAY][i]);
    d.text(L[i] ?? '', 206, y, 13, on ? p.ink : p.label, 'left', on ? 600 : 400);
  });
};

// ---------- okrążenia ----------
const LAPS = [252, 244, 259, 238, 242];
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const laps: Draw = (d, t, _f, L) => {
  const { p } = d;
  const x0 = 20, x1 = 300, y = 54, prog = clamp(t / 0.9, 0, 1);
  const done = Math.min(5, Math.floor(prog * 5 + 1e-6));
  d.text(`${L[0] ?? ''} ${Math.min(5, done + 1)}`, x0, 20, 13, p.ink, 'left', 600);
  d.line(x0, y, x1, y, p.line, 5);
  d.line(x0, y, x0 + prog * (x1 - x0), y, p.acc, 5);
  for (let i = 0; i <= 5; i++) {
    const x = x0 + (i / 5) * (x1 - x0);
    d.line(x, y - 7, x, y + 7, p.label, 1.2);
    d.text(i ? `${i * 2} km` : '0', x, y + 16, 9, p.label, 'center');
  }
  d.circle(x0 + prog * (x1 - x0), y, 6, p.acc, p.panel, 2);
  const cw = (x1 - x0 - 4 * 6) / 5;
  for (let i = 0; i < done; i++) {
    const x = x0 + i * (cw + 6);
    const delta = i ? LAPS[i] - LAPS[i - 1] : 0;
    d.alpha(seg(prog * 5 - i - 1, 0, 0.25) || (prog >= 1 ? 1 : 0), () => {
      d.rect(x, 92, cw, 66, 8, p.card);
      d.text(`#${i + 1}`, x + cw / 2, 106, 9, p.label, 'center', 500);
      d.text(fmt(LAPS[i]), x + cw / 2, 126, 13, p.ink, 'center', 600);
      if (i) d.text(`${delta < 0 ? '−' : '+'}${fmt(Math.abs(delta))}`, x + cw / 2, 145, 10, delta < 0 ? GREEN : RED, 'center', 600);
    });
  }
};

// ---------- podjazd ----------
const climbEle = (x: number) => 20 + 90 * (x < 0.15 ? x * 0.4 : 0.06 + (x - 0.15) * 1.1) + 6 * Math.sin(x * 20);
const climb: Draw = (d, t, f, L) => {
  const { p } = d;
  if (f.mode === 'list') {
    const active = Math.min(2, Math.floor(t * 3));
    [0, 1, 2].forEach((i) => {
      const y = 12 + i * 54, on = i === active;
      d.rect(14, y, W - 28, 48, 10, p.card, on ? p.acc : undefined, 1.5);
      const sp: [number, number][] = Array.from({ length: 21 }, (_, k) => [26 + k * 2.4, y + 38 - (k / 20) * (16 + i * 5) - 2 * Math.sin(k + i)]);
      d.area(sp, y + 40, rgba(p.acc, 0.3)); d.poly(sp, p.acc, 1.5);
      d.text(L[i + 1] ?? '', 86, y + 18, 12, p.ink, 'left', 600);
      d.text(`${num(3.1 + i * 1.4)} km · ${5 + i}%`, 86, y + 33, 10, p.label);
      d.text(['12:41', '8:05', '15:20'][i], W - 28, y + 18, 13, p.ink, 'right', 600);
      d.text(L[0] ?? '', W - 28, y + 33, 9, AMBER, 'right', 600);
    });
    return;
  }
  const x0 = 12, x1 = 308, base = 168, top = 54;
  const X = (x: number) => x0 + x * (x1 - x0), Y = (e: number) => base - (e / 120) * (base - top);
  const pts: [number, number][] = Array.from({ length: 101 }, (_, i) => [X(i / 100), Y(climbEle(i / 100))]);
  if (f.mode === 'terrain') {
    const q = 0.08 + 0.84 * t;
    d.area(pts, base, rgba(p.label, 0.22));
    d.poly(pts, p.label, 1.5);
    const sp: [number, number][] = pts.map(([x], i) => [x, 120 - 30 * Math.cos(i / 16) + 20 * (i / 100)]);
    const cad: [number, number][] = pts.map(([x], i) => [x, 100 + 10 * Math.sin(i / 7)]);
    d.poly(sp, BLUE, 2); d.poly(cad, AMBER, 1.6);
    const cx = X(q);
    d.line(cx, 34, cx, base, rgba(p.ink, 0.35));
    const g = ((climbEle(q + 0.01) - climbEle(q - 0.01)) / 0.02) * 0.06;
    d.text(`${g > 0 ? '+' : ''}${Math.round(g)}%`, clamp(cx, 30, 290), 26, 12, p.ink, 'center', 600);
    [p.label, BLUE, AMBER].forEach((c, i) => { d.rect(16 + i * 100, 8, 10, 4, 2, c); d.text(L[i] ?? '', 30 + i * 100, 10, 10, p.label); });
    return;
  }
  const q = 0.18 + 0.6 * t;
  const behind = pts.filter(([x]) => x <= X(q)), ahead = pts.filter(([x]) => x >= X(q));
  d.area(ahead, base, rgba(p.label, 0.12)); d.poly(ahead, p.label, 1.5, [4, 4]);
  d.area(behind, base, rgba(p.acc, 0.3)); d.poly(behind, p.acc, 2.2);
  d.circle(X(q), Y(climbEle(q)), 5, p.ink, p.panel, 2);
  const vam = Math.round(780 + 160 * Math.sin(t * 9));
  d.text(String(vam), 16, 20, 20, p.ink, 'left', 650);
  d.text(L[0] ?? '', 16, 38, 10, p.label);
  const delta = Math.round(-14 + 24 * t);
  d.text(`${delta < 0 ? '−' : '+'}0:${String(Math.abs(delta)).padStart(2, '0')}`, W - 16, 20, 20, delta < 0 ? GREEN : RED, 'right', 650);
  d.text(L[1] ?? '', W - 16, 38, 10, p.label, 'right');
};

// ---------- strefy ----------
const zones: Draw = (d, t, f, L) => {
  const { p } = d;
  const power = f.kind === 'power';
  const colors = power ? POWER : HR;
  const bounds = power ? [138, 188, 225, 263, 300, 375] : [114, 133, 152, 171];
  const value = (k: number) => (power ? 200 + 90 * Math.sin(k / 3) + 40 * Math.sin(k / 1.3) : 140 + 26 * Math.sin(k / 4) + 8 * Math.sin(k / 1.7));
  const zone = (v: number) => bounds.filter((b) => v >= b).length;
  const x0 = 14, x1 = 176, y1 = 160, n = 20, bw = (x1 - x0) / n;
  const shift = t * 20, frac = shift % 1;
  const top = power ? 420 : 190, low = power ? 60 : 90;
  d.clip(x0, 30, x1 - x0, y1 - 30, 0, () => {
    for (let i = 0; i <= n; i++) {
      const v = value(i + Math.floor(shift));
      const h = ((v - low) / (top - low)) * (y1 - 46);
      d.rect(x0 + (i - frac) * bw + 1, y1 - h, bw - 2, h, 1.5, colors[zone(v)]);
    }
  });
  const cur = value(n + Math.floor(shift));
  d.text(`${Math.round(cur)} ${power ? 'W' : 'bpm'}`, x0, 16, 15, p.ink, 'left', 650);
  d.text(L[0] ?? '', 192, 16, 11, p.ink, 'left', 600);
  const shares = power ? [0.12, 0.2, 0.22, 0.18, 0.14, 0.09, 0.05] : [0.1, 0.24, 0.36, 0.2, 0.1];
  const rowH = (y1 - 34) / colors.length, grow = ease(seg(t, 0, 0.6));
  colors.forEach((c, i) => {
    const y = 34 + i * rowH;
    d.text(`Z${i + 1}`, 192, y + rowH / 2, 9, p.label);
    d.rect(210, y + 2, shares[i] * 230 * grow, rowH - 4, 2, c);
  });
};

// ---------- mapa ----------
const map: Draw = (d, t, f, L) => {
  const { p } = d;
  const c = d.c;
  if (f.mode === 'guidance') {
    const k = seg(t, 0.05, 0.75);
    const dist = Math.max(0, Math.round(((1 - k) * 200) / 10) * 10);
    d.clip(14, 62, W - 28, 108, 12, () => {
      d.rect(14, 62, W - 28, 108, 12, p.card);
      d.line(0, 120, W, 104, p.line, 5); d.line(240, 50, 250, 180, p.line, 5);
      const route: [number, number][] = [[160, 176], [160, 100], [300, 100]];
      d.poly(route, BLUE, 4);
      const along = k * 0.85 * 216;
      const [rx, ry] = along < 76 ? [160, 176 - along] : [160 + (along - 76), 100];
      d.circle(rx, ry, 5.5, BLUE, '#fff', 2);
    });
    d.rect(14, 10, W - 28, 46, 12, p.card, p.line);
    d.rect(22, 16, 34, 34, 8, p.acc);
    d.poly([[33, 44], [33, 30], [46, 30]], p.onAcc, 3); d.poly([[41, 25], [46, 30], [41, 35]], p.onAcc, 3);
    d.text(`${dist} m  ${L[0] ?? ''}`, 66, 26, 14, p.ink, 'left', 650);
    d.text(L[1] ?? '', 66, 43, 10, p.label);
    if (dist <= 60 && dist > 0) [0, 1].forEach((i) => { c.strokeStyle = rgba(p.acc, 0.8 - i * 0.3 - ((t * 8) % 1) * 0.3); c.lineWidth = 1.6; c.beginPath(); c.arc(W - 40, 33, 6 + i * 6, -0.7, 0.7); c.stroke(); });
    return;
  }
  const z = 1 + 0.35 * ease(seg(t, 0.08, 0.25)) - 0.35 * ease(seg(t, 0.9, 1));
  const rot = -0.7 * ease(seg(t, 0.4, 0.55)) + 0.7 * ease(seg(t, 0.75, 0.88));
  d.clip(14, 10, W - 28, H - 20, 12, () => {
    d.rect(14, 10, W - 28, H - 20, 12, p.card);
    c.save(); c.translate(160, 96); c.rotate(rot); c.scale(z, z); c.translate(-160, -96);
    d.line(0, 40, 340, 140, p.line, 6); d.line(60, -40, 120, 230, p.line, 6); d.line(250, -40, 210, 230, p.line, 5); d.line(-20, 170, 340, 60, p.line, 4);
    [[150, 30, 40, 28], [200, 120, 50, 30], [40, 110, 44, 36]].forEach(([x, y, w, h]) => d.rect(x, y, w, h, 3, rgba(p.label, 0.12)));
    d.poly([[100, 180], [130, 120], [160, 96], [230, 40]], BLUE, 3.5);
    c.save(); c.translate(160, 96); c.rotate(0.9);
    c.fillStyle = BLUE; c.beginPath(); c.moveTo(0, -9); c.lineTo(7, 7); c.lineTo(0, 3); c.lineTo(-7, 7); c.closePath(); c.fill();
    c.restore(); c.restore();
  });
  const btn = (x: number, y: number) => d.circle(x, y, 13, p.panel, p.line);
  btn(284, 34); btn(284, 118); btn(284, 150);
  d.line(278, 118, 290, 118, p.ink, 2); d.line(284, 112, 284, 124, p.ink, 2); d.line(278, 150, 290, 150, p.ink, 2);
  c.save(); c.translate(284, 34); c.rotate(rot);
  c.fillStyle = RED; c.beginPath(); c.moveTo(0, -9); c.lineTo(4, 0); c.lineTo(-4, 0); c.closePath(); c.fill();
  c.fillStyle = p.label; c.beginPath(); c.moveTo(0, 9); c.lineTo(4, 0); c.lineTo(-4, 0); c.closePath(); c.fill();
  c.restore();
  const label = L[t > 0.5 && t < 0.82 ? 1 : 0] ?? '';
  const lw = d.measure(label, 11, 600) + 18;
  d.rect(24, H - 42, lw, 24, 8, p.panel, p.line);
  d.text(label, 24 + lw / 2, H - 30, 11, p.ink, 'center', 600);
  d.finger(284, 118, seg(t, 0.03, 0.08) * (1 - seg(t, 0.2, 0.25)), pulse(t, 0.12) * 1.5);
  d.finger(284, 34, seg(t, 0.32, 0.36) * (1 - seg(t, 0.44, 0.48)), pulse(t, 0.4) * 1.5);
  d.finger(284, 34, seg(t, 0.67, 0.71) * (1 - seg(t, 0.79, 0.83)), pulse(t, 0.75) * 1.5);
};

// ---------- wersje ----------
const editions: Draw = (d, t, _f, L) => {
  const { p } = d;
  const card = (x: number, w: number, title: string, items: string[], plus: boolean) => {
    d.rect(x, 10, w, 160, 12, p.card, plus ? p.acc : p.line, plus ? 2 : 1);
    d.text(title, x + 12, 28, 14, p.ink, 'left', 650);
    items.forEach((s, i) => {
      const y = 52 + i * 22;
      d.poly([[x + 13, y], [x + 16, y + 3], [x + 22, y - 3]], p.acc, 1.8);
      d.text(s ?? '', x + 28, y, 10, p.ink);
    });
  };
  card(14, 132, L[0], L.slice(4, 7), false);
  card(152, 154, L[1], L.slice(7, 10), true);
  const which = t < 0.5 ? 0 : 1;
  [0, 1].forEach((i) => {
    const x = 162 + i * 70, on = i === which;
    d.rect(x, 128, 64, 30, 8, on ? p.acc : undefined, on ? undefined : p.line);
    d.text(L[2 + i] ?? '', x + 32, 143, 9, on ? p.onAcc : p.label, 'center', 600);
  });
};

// ---------- dane na telefonie ----------
const local: Draw = (d, t, _f, L) => {
  const { p } = d;
  d.rect(56, 20, 64, 124, 12, '#050506', '#3a3c42');
  d.rect(60, 24, 56, 116, 9, p.screen);
  [0, 1, 2].forEach((i) => {
    const k = ease(seg(t, i * 0.12, i * 0.12 + 0.2));
    d.alpha(k, () => {
      const y = 36 + i * 30 - (1 - k) * 10;
      d.rect(66, y, 44, 22, 5, p.card);
      d.poly([[71, y + 15], [79, y + 9], [87, y + 13], [96, y + 6], [104, y + 10]], p.acc, 1.6);
    });
  });
  d.text(L[0] ?? '', 88, 158, 12, p.ink, 'center', 600);
  const c = d.c;
  c.lineDashOffset = -t * 40;
  d.line(126, 60, 206, 46, p.label, 1.5, [4, 4]);
  c.lineDashOffset = 0;
  [[226, 46, 14], [242, 40, 17], [260, 48, 12], [240, 54, 14]].forEach(([x, y, r]) => d.circle(x, y, r, p.card));
  d.text(L[1] ?? '', 244, 80, 11, p.label, 'center', 500);
  d.rect(220, 112, 46, 40, 6, undefined, p.label, 1.5);
  d.line(226, 124, 260, 124, p.label, 1.2); d.line(226, 134, 260, 134, p.label, 1.2);
  d.line(212, 106, 274, 158, RED, 3); d.line(274, 106, 212, 158, RED, 3);
  d.text(L[2] ?? '', 243, 168, 11, p.ink, 'center', 600);
};

const FIGS: Record<string, [Draw, number, number]> = {
  // rysunek, okres w sekundach, klatka bez animacji
  screen: [screen, 5, 0.45], steps: [steps, 5, 0.9], record: [record, 6, 0.8], autopause: [autopause, 6, 0.5],
  listrow: [listrow, 5, 0.38], scrub: [scrub, 5, 0.3], trail: [trail, 7.5, 0.1], wind: [wind, 8, 0.02],
  laps: [laps, 7, 0.95], climb: [climb, 7, 0.6], zones: [zones, 6, 1], map: [map, 7, 0.6],
  editions: [editions, 4, 0.2], local: [local, 5, 1],
};
export const figureTypes = Object.keys(FIGS);

function palette(): Pal {
  const s = getComputedStyle(document.documentElement);
  const v = (k: string) => s.getPropertyValue(k).trim();
  const dark = s.colorScheme !== 'light' && v('--bg').toLowerCase() !== '#f5f2ea';
  return { panel: v('--surface-2'), screen: v('--bg'), card: v('--surface'), line: v('--line'), ink: v('--ink'), label: v('--muted'), acc: v('--accent-text'), onAcc: dark ? '#0b0c0e' : '#ffffff' };
}

// Podpięcie płócien `canvas.fig[data-fig]`: rysowanie tylko widocznych
// w otwartych pytaniach, bez animacji przy ograniczeniu ruchu.
export function mountFigures(root: ParentNode = document) {
  decimal = document.documentElement.lang === 'pl' ? ',' : '.';
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const items = [...root.querySelectorAll<HTMLCanvasElement>('canvas.fig[data-fig]')].map((el) => {
    let f: Fig | null = null;
    try { f = JSON.parse(el.dataset.fig!); } catch { /* pominięta */ }
    return { el, f, seen: false, start: performance.now() };
  }).filter((i) => i.f && FIGS[i.f.type]);
  let pal = palette();
  const io = new IntersectionObserver((es) => es.forEach((e) => { const it = items.find((i) => i.el === e.target); if (it) it.seen = e.isIntersecting; }));
  items.forEach((i) => io.observe(i.el));
  new MutationObserver(() => { pal = palette(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { pal = palette(); });

  function paint(i: (typeof items)[number], now: number) {
    const [draw, period, still] = FIGS[i.f!.type];
    const ratio = Math.min(2, devicePixelRatio || 1);
    const w = i.el.clientWidth, h = (w * H) / W;
    if (!w) return;
    if (i.el.width !== Math.round(w * ratio)) { i.el.width = Math.round(w * ratio); i.el.height = Math.round(h * ratio); }
    const c = i.el.getContext('2d')!;
    c.setTransform((w / W) * ratio, 0, 0, (w / W) * ratio, 0, 0);
    c.clearRect(0, 0, W, H);
    const t = motion.matches ? (((now - i.start) / 1000) % period) / period : still;
    draw(new D(c, pal), t, i.f!, i.f!.labels ?? []);
  }
  function frame(now: number) {
    for (const i of items) {
      const open = !i.el.closest('details') || i.el.closest('details')!.open;
      if (i.seen && open) paint(i, now);
    }
    requestAnimationFrame(frame);
  }
  document.addEventListener('toggle', (e) => {
    const det = e.target as HTMLDetailsElement;
    if (det.open) items.filter((i) => det.contains(i.el)).forEach((i) => { i.start = performance.now(); });
  }, true);
  requestAnimationFrame(frame);
}
