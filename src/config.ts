export const PAGE_HUE_MIN = 10;
export const PAGE_HUE_MAX = 360;

export const DEFAULT_TAB_TITLE = '🏠 Home';
export const SEARCH_TAB_PREFIX = '🔍';
export const NOTE_TAB_PREFIX = '📝';

export const DEFAULT_SEARCH_URL = 'https://google.com/search';

export const SITES_DATA_URL =
  'https://gist.githubusercontent.com/minchingtonak/b60356be980dc4f430fe73b523d1fafb/raw';

export type option<T> = T | null;
export type Sites = { [k: string]: { [k: string]: string } };
