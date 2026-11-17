// Teksty strony we wszystkich językach (`src/i18n/<język>.ts`, wzór - `en.ts`).
import type { Lang } from '../site';
import type { Texts } from './en';
import en from './en';
import pl from './pl';
import de from './de';
import fr from './fr';
import es from './es';
import it from './it';
import nl from './nl';

export const texts: Record<Lang, Texts> = { en, pl, de, fr, es, it, nl };
export type { Texts };
