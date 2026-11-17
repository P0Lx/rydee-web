import type { Lang } from '../../site';
import type { Privacy } from './types';
import en from './en';
import pl from './pl';
import de from './de';
import fr from './fr';
import es from './es';
import it from './it';
import nl from './nl';

export const privacy: Record<Lang, Privacy> = { en, pl, de, fr, es, it, nl };
export type { Privacy };
