import { useEffect, useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

const DateSpan = styled.span`
  margin-right: 15px;

  color: var(--htx);
`;

const TimeSpan = styled(DateSpan)`
  margin-right: auto;
`;

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

  // function to24hour(d: Date): string {
  //   function pad(time: number) {
  //     return time < 10 ? `0${time}` : time;
  //   }

  //   return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  // }

  return (
    <>
      <DateSpan id="date">
        {dayjs(date).format('dddd, MMM D')}
      </DateSpan>
      <TimeSpan id="clock">
        {dayjs(date).format('HH:mm:ss')}
      </TimeSpan>
    </>
  );
}
