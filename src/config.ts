export const PAGE_HUE_MIN = 10;
export const PAGE_HUE_MAX = 360;

export const DEFAULT_TAB_TITLE = '🏠 Home';
export const SEARCH_TAB_PREFIX = '🔍';
export const NOTE_TAB_PREFIX = '📝';

export const DEFAULT_SEARCH_URL = 'https://google.com/search';

export const SITES_DATA_URL =
  'https://gist.githubusercontent.com/minchingtonak/b60356be980dc4f430fe73b523d1fafb/raw';

export const TASKS_API_URL = 'http://localhost:3000/tasks';
export const TASK_UPDATE_DELAY = 1500; // ms
export const TASK_DELETE_DELAY = 1000; // ms

export type option<T> = T | null;
export type Sites = { [k: string]: { [k: string]: string } };
export type Task = {
  text: string;
  due: Date;
  completed: boolean;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
export type TaskOptions = {
  text?: string;
  due?: Date;
  completed?: boolean;
}
