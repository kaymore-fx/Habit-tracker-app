import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  status: 'idle',
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Add a new task
    taskAdded: (state, action) => {
      state.tasks.push(action.payload);
    },
    // Update an existing task
    taskUpdated: (state, action) => {
      const { id, ...updatedTask } = action.payload;
      const existingTask = state.tasks.find(task => task.id === id);
      if (existingTask) {
        Object.assign(existingTask, updatedTask);
      }
    },
    // Delete a task
    taskDeleted: (state, action) => {
      const { id } = action.payload;
      state.tasks = state.tasks.filter(task => task.id !== id);
    },
    // Set tasks (for initial load)
    tasksLoaded: (state, action) => {
      state.tasks = action.payload;
      state.status = 'succeeded';
    },
    // Set loading state
    setLoading: (state, action) => {
      state.status = action.payload;
    },
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
  },
});

export const { taskAdded, taskUpdated, taskDeleted, tasksLoaded, setLoading, setError } = taskSlice.actions;

export default taskSlice.reducer;

export const selectAllTasks = state => state.tasks.tasks;
export const selectTaskById = (state, taskId) => 
  state.tasks.tasks.find(task => task.id === taskId);
export const selectTasksStatus = state => state.tasks.status;
export const selectTasksError = state => state.tasks.error;