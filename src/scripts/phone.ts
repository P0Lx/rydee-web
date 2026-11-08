// Wspólne ustawianie wartości podglądu ekranu głównego.
export interface PhoneState { speed: number; grade: number; hr: number; cad: number; ele: number; km: number; progress: number; decimal: string; }

export function applyPhone(el: HTMLElement, s: PhoneState) {
  const set = (k: string, v: string) => { const n = el.querySelector(`[data-v="${k}"]`); if (n && n.textContent !== v) n.textContent = v; };
  set('speed', String(Math.round(s.speed)));
  set('dist', s.km.toFixed(1).replace('.', s.decimal));
  set('hr', String(Math.round(s.hr)));
  set('cad', String(Math.round(s.cad)));
  set('ele', String(Math.round(s.ele)));
  set('grade', `${s.grade > 0.4 ? '+' : ''}${Math.round(s.grade)}%`);
  const mins = Math.round((s.km / 24.5) * 60);
  set('time', `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`);
  set('vam', String(Math.max(0, Math.round((s.speed * 1000 * s.grade) / 100))));
  const ratio = Math.min(1, s.speed / 60);
  el.querySelectorAll<HTMLElement>('[data-seg]').forEach((b, i, all) => b.classList.toggle('on', i < ratio * all.length));
  el.querySelectorAll<SVGElement>('.fl').forEach((f) => { f.style.strokeDasharray = `${ratio * 100} 100`; });
  el.querySelector<SVGElement>('.m-done')?.style.setProperty('stroke-dasharray', `${s.progress * 100} 100`);
  el.classList.toggle('hyper', s.speed >= 50);
}
