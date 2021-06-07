import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import qs from 'querystring';
import create from 'zustand';
import { Task } from './config';
import styled from 'styled-components';

type Arr = readonly unknown[];
export function partial<T extends Arr, U extends Arr, R>(
  f: (...args: [...T, ...U]) => R,
  ...headArgs: T
) {
  return (...tailArgs: U) => f(...headArgs, ...tailArgs);
}

export function getValidURL(link: string): string {
  return /^https?:\/\//.test(link) ? link : `//${link}`;
}

const ls = window.localStorage;

export function useCached<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [data, setData] = useState<T>(() => {
    const cached = ls.getItem(key);
    return cached !== null ? JSON.parse(cached) : defaultValue;
  });

  useEffect(() => {
    ls.setItem(key, JSON.stringify(data));
  }, [data, key]);

  return [data, setData];
}

function parseQueryString(queryString = window.location.search) {
  const values = qs.parse(queryString);

  // Remove leading qmark from first query param
  const qmarkKey = Object.keys(values).find((elt) => elt.startsWith('?'));
  if (qmarkKey) {
    const tmp = values[qmarkKey];
    delete values[qmarkKey];
    values[qmarkKey.slice(1)] = tmp;
  }
  return values;
}

function setQueryString(key: string, value: any) {
  const parsed = parseQueryString();
  if (key in parsed && !value) delete parsed[key];
  else parsed[key] = value;

  const newurl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname +
    `${Object.keys(parsed).length ? '?' : ''}${qs.stringify(parsed)}`;

  window.history.pushState({ path: newurl }, '', newurl);
}

function getQueryStringValue(key: string) {
  return parseQueryString()[key];
}

export function useQueryString(key: string, initialValue: any) {
  const [value, setValue] = useState(getQueryStringValue(key) || initialValue);
  const onSetValue = useCallback(
    (newValue) => {
      setValue(newValue);
      setQueryString(key, newValue);
    },
    [key],
  );

  return [value, onSetValue];
}

type CheckboxProps = { checked: boolean };

export const Checkbox = styled.i.attrs<CheckboxProps>((props) => ({
  className: props.checked ? 'fas fa-check-square' : 'fas fa-square',
}))<CheckboxProps>`
  margin: 12px 10px 0px 15px;

  transform: scale(1.35);

  color: var(--frg-l);

  &:hover {
    color: var(--frg-ll);
  }
`;

export const TrashIcon = styled.i.attrs({ className: 'far fa-trash-alt fa-lg' })`
  padding: 13px 10px;

  color: var(--frg-l);

  &:hover {
    color: var(--frg-ll);
  }
`;

// Context stuff

export const useLogin = create<{
  loggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
}>((set) => ({
  loggedIn: false,
  setLoggedIn: (val) => set({ loggedIn: val }),
}));

type AddTask = (t: Task) => void;
export const useAddTask = create<{
  addTask: AddTask;
  setAddTask: (a: AddTask) => void;
}>((set) => ({
  addTask: () => {},
  setAddTask: (a) => set({ addTask: a }),
}));
