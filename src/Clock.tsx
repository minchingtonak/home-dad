import { useEffect, useState } from 'react';

export default function Clock() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  function to24hour(d: Date): string {
    function pad(time: number) {
      return time < 10 ? `0${time}` : time;
    }

    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  return <span id={'clock'}>{to24hour(date)}</span>;
}
