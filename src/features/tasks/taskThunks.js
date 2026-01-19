import { taskAdded, taskUpdated, taskDeleted, tasksLoaded, setLoading, setError } from './taskSlice';

// Mock API functions - replace these with actual API calls
const mockApi = {
  fetchTasks: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    return tasks;
  },
  
  saveTask: async (task) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    if (task.id) {
      // Update existing task
      const index = tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        tasks[index] = task;
      }
    } else {
      // Add new task
      task.id = Date.now().toString();
      task.createdAt = new Date().toISOString();
      tasks.push(task);
    }
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return task;
  },
  
  deleteTask: async (taskId) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return taskId;
  }
};

// Thunk to fetch all tasks
export const fetchTasks = () => async (dispatch) => {
  try {
    dispatch(setLoading('loading'));
    const tasks = await mockApi.fetchTasks();
    dispatch(tasksLoaded(tasks));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// Thunk to add a new task
export const addTask = (taskData) => async (dispatch) => {
  try {
    dispatch(setLoading('loading'));
    const task = await mockApi.saveTask(taskData);
    dispatch(taskAdded(task));
    return task;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

// Thunk to update an existing task
export const updateTask = (taskData) => async (dispatch) => {
  try {
    dispatch(setLoading('loading'));
    const task = await mockApi.saveTask(taskData);
    dispatch(taskUpdated(task));
    return task;
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};

// Thunk to delete a task
export const deleteTask = (taskId) => async (dispatch) => {
  try {
    dispatch(setLoading('loading'));
    await mockApi.deleteTask(taskId);
    dispatch(taskDeleted({ id: taskId }));
  } catch (error) {
    dispatch(setError(error.message));
    throw error;
  }
};