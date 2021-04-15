export const PAGE_HUE_MIN = 10;
export const PAGE_HUE_MAX = 360;

// export interface None  {
//     readonly _t: 'None';
// }
// export interface Some<T> {
//     readonly _t: 'Some';
//     value: T;
// }
// export type Option<T> = Some<T> | None;
export type option<T> = T | null;
