import { useEffect, useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

const Wrapper = styled.div`
  width: 180px;

  margin-right: auto;

  display: flex;
`;

const DateSpan = styled.span`
  align-self: flex-start;

  color: var(--htx);
`;

const TimeSpan = styled(DateSpan)`
  margin-right: auto;

  align-self: flex-end;
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

  return (
    <>
      <Wrapper>
        <TimeSpan id="clock">{dayjs(date).format('HH:mm:ss')}</TimeSpan>
        <DateSpan id="date">{dayjs(date).format('ddd, MMM D')}</DateSpan>
      </Wrapper>
    </>
  );
}
