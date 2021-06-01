/// <reference types="gapi"/>

declare namespace gapi.client {
  type Response<T> = Promise<{
    status: number;
    statusText: string;
    body: string;
    headers: { [k: string]: string };
    result: T;
  }>;
  export interface TasksClient {
    tasklists?: Tasks.Collection.TasklistsCollection;
    tasks?: Tasks.Collection.TasksCollection;
  }
  declare var tasks: TasksClient;

  // modified from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/google-apps-script/apis/tasks_v1.d.ts
  export namespace Tasks {
    namespace Collection {
      interface TasklistsCollection {
        // Returns the authenticated user's specified task list.
        get(args: { tasklist: string }): Response<Tasks.Schema.TaskList>;

        // Creates a new task list and adds it to the authenticated user's task lists.
        insert(args: {
          resource: Schema.TaskList;
        }): Response<Tasks.Schema.TaskList>;

        // Returns all the authenticated user's task lists.
        list(args?: {
          maxResults?: number;
          pageToken?: string;
        }): Response<Tasks.Schema.TaskLists>;

        // Updates the authenticated user's specified task list. This method supports patch semantics.
        patch(args: {
          resource: Schema.TaskList;
          tasklist: string;
        }): Response<Tasks.Schema.TaskList>;

        // Deletes the authenticated user's specified task list.
        delete(args: { tasklist: string }): Response<void>;

        // Updates the authenticated user's specified task list.
        update(args: {
          resource: Schema.TaskList;
          tasklist: string;
        }): Response<Tasks.Schema.TaskList>;
      }
      interface TasksCollection {
        // Clears all completed tasks from the specified task list. The affected tasks will be marked as 'hidden' and no longer be returned by default when retrieving all tasks for a task list.
        clear(args: { tasklist: string }): Response<void>;
        // Returns the specified task.
        get(args: {
          tasklist: string;
          task: string;
        }): Response<Tasks.Schema.Task>;

        // Creates a new task on the specified task list.
        insert(args: {
          resource: Schema.Task;
          tasklist: string;
          parent?: string;
          previous?: string;
        }): Response<Tasks.Schema.Task>;

        // Returns all tasks in the specified task list.
        list(args: {
          tasklist: string;
          completedMax?: string;
          completedMin?: string;
          dueMax?: string;
          dueMin?: string;
          maxResults?: number; // default 20, max 100
          pageToken?: string;
          showCompleted?: boolean; // default true
          showDeleted?: boolean; // default false
          showHidden?: boolean; // default false
          updatedMin?: string;
        }): Response<Tasks.Schema.Tasks>;

        // Moves the specified task to another position in the task list. This can include putting it as a child task under a new parent and/or move it to a different position among its sibling tasks.
        move(args: {
          tasklist: string;
          task: string;
          parent?: string;
          previous?: string;
        }): Response<Tasks.Schema.Task>;

        // Updates the specified task. This method supports patch semantics.
        patch(args: {
          resource: Schema.Task;
          tasklist: string;
          task: string;
        }): Response<Tasks.Schema.Task>;

        // Deletes the specified task from the task list.
        delete(args: { tasklist: string; task: string }): Response<void>;

        // Updates the specified task.
        update(args: {
          resource: Schema.Task;
          tasklist: string;
          task: string;
        }): Response<Tasks.Schema.Task>;
      }
    }
    export namespace Schema {
      interface Task {
        completed?: string;
        deleted?: boolean;
        due?: string;
        etag?: string;
        hidden?: boolean;
        id?: string;
        kind?: string;
        links?: Tasks.Schema.TaskLinks[];
        notes?: string;
        parent?: string;
        position?: string;
        selfLink?: string;
        status?: string;
        title?: string;
        updated?: string;
      }
      interface TaskLinks {
        description?: string;
        link?: string;
        type?: string;
      }
      interface TaskList {
        etag?: string;
        id?: string;
        kind?: string;
        selfLink?: string;
        title?: string;
        updated?: string;
      }
      interface TaskLists {
        etag?: string;
        items?: Tasks.Schema.TaskList[];
        kind?: string;
        nextPageToken?: string;
      }
      interface Tasks {
        etag?: string;
        items?: Tasks.Schema.Task[];
        kind?: string;
        nextPageToken?: string;
      }
    }
  }
}
