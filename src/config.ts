export const PAGE_HUE_MIN = 10;
export const PAGE_HUE_MAX = 360;

export const DEFAULT_TAB_TITLE = '🏠 Home';
export const SEARCH_TAB_PREFIX = '🔍';
export const NOTE_TAB_PREFIX = '📝';

export const DEFAULT_SEARCH_URL = 'https://google.com/search';

export const SITES_DATA_URL =
  'https://gist.githubusercontent.com/minchingtonak/b60356be980dc4f430fe73b523d1fafb/raw';

export const TASKS_API_URL = '/tasks';
export const TASK_UPDATE_DELAY = 500; // ms
export const TASK_DELETE_DELAY = 500; // ms

export type option<T> = T | null;
export type Sites = { [k: string]: { [k: string]: string } };
export interface NewTask {
  text: string;
  due: Date;
}
export interface Task extends NewTask {
  completed: boolean;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
