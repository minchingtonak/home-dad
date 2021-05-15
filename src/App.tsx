import { useEffect } from 'react';
import HomeSearch from './HomeSearch';
import { PAGE_HUE_MAX, PAGE_HUE_MIN } from './config';
import { HomeTasks } from './HomeTasks';

export default function App() {
  useEffect(() => {
    function random(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Choose a random page color base on page load
    document.documentElement.style.setProperty(
      '--base',
      `${random(PAGE_HUE_MIN, PAGE_HUE_MAX)}`,
    );
  }, []);

  return (
    <>
      <HomeSearch />
      <HomeTasks />
    </>
  );
}
