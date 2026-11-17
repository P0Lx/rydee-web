// Teksty strony we wszystkich językach (`src/i18n/<język>.ts`, wzór - `en.ts`).
import type { Lang } from '../site';
import type { Texts } from './en';
import en from './en';
import pl from './pl';

export const texts: Record<Lang, Texts> = { en, pl };
export type { Texts };
