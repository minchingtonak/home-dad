import { Task } from './config';
import styled from 'styled-components';
// import { useState } from 'react';
// import { HomeMaterialInput, HomeDateTimePicker } from './utils';

// const CreateTaskMenuDiv = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

// const CreateTaskTitle = styled.span`
//   color: var(--htx);
//   text-align: center;
// `;

// const CreateTaskDescInput = styled(HomeMaterialInput)``;

// function CreateTaskMenu({
//   text,
//   setText,
//   date,
//   setDate,
// }: {
//   text: string;
//   setText: (s: string) => void;
//   date: Date;
//   setDate: (d: Date) => void;
// }) {
//   return (
//     <CreateTaskMenuDiv>
//       <CreateTaskTitle>Create Task</CreateTaskTitle>
//       <CreateTaskDescInput
//         value={text}
//         placeholder="Enter a description"
//         onChange={(e) => setText(e.target.value)}
//       />
//       <HomeDateTimePicker
//         variant="inline"
//         autoOk
//         ampm={false}
//         hideTabs={true}
//         value={date}
//         format={'ddd, MMM D [at] H:mm'}
//         onChange={(d) => setDate(d?.toDate() as Date)}
//       />
//     </CreateTaskMenuDiv>
//   );
// }

// const AddTaskButtonDiv = styled.div``;

// const AddTaskIcon = styled.div.attrs({ className: 'far fa-plus-square' })`
//   color: var(--htx);

//   &:hover {
//     color: var(--txt);
//   }
// `;

// function AddTaskPopup({ addTask }: { addTask: (t: NewTask) => void }) {
//   // const [anchor, setAnchor] = useState<option<HTMLElement>>(null);
//   // const [text, setText] = useState('');
//   // const [date, setDate] = useState<Date>(new Date());

//   return (
//     <AddTaskButtonDiv>
//       {/* onClick={(e) => setAnchor(e.currentTarget)} */}
//       <AddTaskIcon />
//       {/* <CreateTaskMenu
//           text={text}
//           setText={setText}
//           date={date}
//           setDate={setDate}
//         /> */}
//     </AddTaskButtonDiv>
//   );
// }

const TasksBarDiv = styled.div`
  padding: 5px;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  background-color: var(--hdr);

  color: var(--htx);
  font-size: 30px;
`;

const TasksBarText = styled.span`
  margin: 0 auto 0 0;
`;

export function TasksBar({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: (t: Task[]) => void;
}) {
  return (
    <TasksBarDiv id="tasksbar">
      <TasksBarText>Tasks</TasksBarText>
      {/* <AddTaskPopup
        addTask={(t: NewTask) =>
          setTasks(
            update(tasks, {
              $push: [
                {
                  ...t,
                  _id: 'fixme',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            }),
          )
        }
      /> */}
    </TasksBarDiv>
  );
}
