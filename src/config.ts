export const PAGE_HUE_MIN = 10;
export const PAGE_HUE_MAX = 360;

export const DEFAULT_TAB_TITLE = '🏠 Home';
export const SEARCH_TAB_PREFIX = '🔍';
export const NOTE_TAB_PREFIX = '📝';

export const DEFAULT_SEARCH_URL = 'https://google.com/search';

export const SITES_DATA_URL =
  'https://gist.githubusercontent.com/minchingtonak/b60356be980dc4f430fe73b523d1fafb/raw';

export const TASK_UPDATE_DELAY = 500; // ms

export type option<T> = T | null;

export type Sites = { [k: string]: { [k: string]: string } };

export type TaskLinks = gapi.client.Tasks.Schema.TaskLinks;
export type TaskList = gapi.client.Tasks.Schema.TaskList;
export type TaskLists = gapi.client.Tasks.Schema.TaskLists;
export type Tasks = gapi.client.Tasks.Schema.Tasks;
export type Task = gapi.client.Tasks.Schema.Task;
