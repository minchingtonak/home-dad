import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { Task } from './config';
import { Checkbox, TrashIcon } from './utils';

const TaskEntryDiv = styled.div`
  margin: 0 5px 5px 5px;
  padding: 0 0 10px 0;

  display: flex;
  flex-direction: row;
  align-items: flex-start;

  background-color: var(--hdr);

  color: var(--txt);
`;

const TaskDescInput = styled.textarea.attrs({ rows: 1 })<{ error: boolean }>`
  margin: 5px;
  padding: 0 5px;
  box-sizing: border-box;
  height: 1.5em;

  border: 1px solid ${(props) => (props.error ? '#aa0000' : '#00000000')};

  background-color: var(--frg);
  color: var(--txt);
  font-family: Terminus, Montserrat;

  resize: none;

  &:focus {
    outline: none;
  }
`;

const TaskUIDiv = styled.div`
  padding-top: 3px;

  width: min-content;

  display: flex;
  flex-direction: column;
`;

const DueDateDiv = styled.div`
  margin-right: 0;

  display: flex;
  flex-direction: row;
  align-content: flex-start;
  align-items: center;
`;

const DueIcon = styled.i.attrs({ className: 'fas fa-calendar-day' })`
  margin: 5px 5px 5px 10px;
  color: var(--frg-l);
`;

export function TaskEntry({
  task,
  setTask,
  setChecked,
  setDeleted,
}: {
  task: Task;
  setTask: (t: Partial<Task>) => void;
  setChecked: () => void;
  setDeleted: () => void;
}) {
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined);

  function updateDescHeight() {
    if (descRef.current) {
      descRef.current.style.height = '';
      descRef.current.style.height = `${descRef.current.scrollHeight + 3}px`;
    }
  }

  useEffect(updateDescHeight, [descRef]);

  useEffect(() => {
    if (task.due) {
      const d = new Date(task.due.split('T')[0]);
      setTaskDate(
        new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      );
    } else setTaskDate(undefined);
  }, [task.due]);

  useEffect(() => {
    updateDescHeight();
  }, [task.title]);

  return (
    <TaskEntryDiv className="taskentry">
      <Checkbox checked={task.status === 'completed'} onClick={setChecked} />
      <TaskUIDiv>
        <TaskDescInput
          ref={descRef}
          value={task.title}
          error={task.title === ''}
          placeholder="Description can't be empty"
          onChange={(e) =>
            setTask({ title: e.target.value.replace(/\n/g, '') })
          }
        />
        <DueDateDiv>
          <DueIcon />
          <DayPickerInput
            placeholder="No due date"
            parseDate={(str, format, locale) => {
              const d = dayjs(str, format, locale);
              return d.isValid() ? d.toDate() : undefined;
            }}
            formatDate={(date, format, locale) =>
              dayjs(date, undefined, locale).format(format)
            }
            format={'dddd, MMM D'}
            dayPickerProps={{
              onDayClick: (d) => setTask({ due: d.toISOString() }),
            }}
            inputProps={{
              onChange: (e: any) => {
                try {
                  const d = new Date(e.target.value);
                  setTask({
                    due: new Date(
                      d.getUTCFullYear(),
                      d.getUTCMonth(),
                      d.getUTCDate(),
                    ).toISOString(),
                  });
                } catch (err) {
                  if (e.target.value === '') setTask({ due: '' });
                }
              },
            }}
            value={taskDate}
          />
        </DueDateDiv>
      </TaskUIDiv>
      <TrashIcon onClick={setDeleted} />
    </TaskEntryDiv>
  );
}
