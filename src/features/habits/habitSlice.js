import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { format, isToday, isThisWeek, isThisMonth, addDays } from 'date-fns';

// Mock API functions - replace with actual API calls
const mockApi = {
  fetchHabits: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    return habits;
  },
  
  saveHabit: async (habit) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    
    if (habit.id) {
      // Update existing habit
      const index = habits.findIndex(h => h.id === habit.id);
      if (index !== -1) {
        habits[index] = { ...habits[index], ...habit, updatedAt: new Date().toISOString() };
      }
    } else {
      // Add new habit
      habit.id = Date.now().toString();
      habit.createdAt = new Date().toISOString();
      habit.updatedAt = new Date().toISOString();
      habit.completedDates = [];
      habit.streak = 0;
      habits.push(habit);
    }
    
    localStorage.setItem('habits', JSON.stringify(habits));
    return habit;
  },
  
  deleteHabit: async (habitId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let habits = JSON.parse(localStorage.getItem('habits') || '[]');
    habits = habits.filter(habit => habit.id !== habitId);
    localStorage.setItem('habits', JSON.stringify(habits));
    return habitId;
  },
  
  toggleHabitCompletion: async (habitId, date) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    const habit = habits.find(h => h.id === habitId);
    
    if (habit) {
      const dateStr = format(new Date(date), 'yyyy-MM-dd');
      const dateIndex = habit.completedDates.indexOf(dateStr);
      
      if (dateIndex === -1) {
        // Add completion
        habit.completedDates = [...habit.completedDates, dateStr].sort();
      } else {
        // Remove completion
        habit.completedDates = habit.completedDates.filter(d => d !== dateStr);
      }
      
      // Update streak
      habit.streak = calculateStreak(habit.completedDates);
      habit.updatedAt = new Date().toISOString();
      
      localStorage.setItem('habits', JSON.stringify(habits));
    }
    
    return { habitId, completedDates: habit?.completedDates || [], streak: habit?.streak || 0 };
  }
};

// Helper function to calculate streak
const calculateStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const today = new Date();
  const sortedDates = [...completedDates].sort().reverse();
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check if today or yesterday is in the completed dates
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(addDays(today, -1), 'yyyy-MM-dd');
  
  if (sortedDates.includes(todayStr)) {
    streak = 1;
    currentDate = addDays(today, -1);
  } else if (sortedDates.includes(yesterdayStr)) {
    streak = 1;
    currentDate = addDays(today, -2);
  }
  
  // Check previous days
  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i];
    const date = new Date(dateStr);
    
    if (format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')) {
      streak++;
      currentDate = addDays(currentDate, -1);
    } else if (date < currentDate) {
      // If there's a gap, break the streak
      break;
    }
  }
  
  return streak;
};

// Async thunks
export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (_, { rejectWithValue }) => {
    try {
      const habits = await mockApi.fetchHabits();
      return habits;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addHabit = createAsyncThunk(
  'habits/addHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const habit = await mockApi.saveHabit(habitData);
      return habit;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateHabit = createAsyncThunk(
  'habits/updateHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const habit = await mockApi.saveHabit(habitData);
      return habit;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async (habitId, { rejectWithValue }) => {
    try {
      await mockApi.deleteHabit(habitId);
      return habitId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleHabitCompletion = createAsyncThunk(
  'habits/toggleCompletion',
  async ({ habitId, date = new Date() }, { rejectWithValue }) => {
    try {
      const result = await mockApi.toggleHabitCompletion(habitId, date);
      return { habitId, ...result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  habits: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  currentDate: new Date().toISOString()
};

// Create slice
const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    },
    resetHabitStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch habits
    builder.addCase(fetchHabits.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchHabits.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.habits = action.payload;
    });
    builder.addCase(fetchHabits.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    });
    
    // Add habit
    builder.addCase(addHabit.fulfilled, (state, action) => {
      state.habits.push(action.payload);
    });
    
    // Update habit
    builder.addCase(updateHabit.fulfilled, (state, action) => {
      const index = state.habits.findIndex(habit => habit.id === action.payload.id);
      if (index !== -1) {
        state.habits[index] = action.payload;
      }
    });
    
    // Delete habit
    builder.addCase(deleteHabit.fulfilled, (state, action) => {
      state.habits = state.habits.filter(habit => habit.id !== action.payload);
    });
    
    // Toggle habit completion
    builder.addCase(toggleHabitCompletion.fulfilled, (state, action) => {
      const { habitId, completedDates, streak } = action.payload;
      const habit = state.habits.find(h => h.id === habitId);
      if (habit) {
        habit.completedDates = completedDates;
        habit.streak = streak;
      }
    });
  }
});

// Export actions
export const { setCurrentDate, resetHabitStatus } = habitSlice.actions;

// Selectors
export const selectAllHabits = state => state.habits.habits;
export const selectHabitById = (state, habitId) => 
  state.habits.habits.find(habit => habit.id === habitId);
  
export const selectHabitsByCategory = (state, category) => 
  state.habits.habits.filter(habit => habit.category === category);

export const selectHabitsForToday = (state) => {
  const today = new Date(state.habits.currentDate);
  const todayStr = format(today, 'yyyy-MM-dd');
  const dayOfWeek = format(today, 'EEEE').toLowerCase();
  
  return state.habits.habits.filter(habit => {
    // Check if habit is scheduled for today
    const isScheduled = habit.schedule ? 
      (habit.schedule === 'daily' || 
       (Array.isArray(habit.schedule) && habit.schedule.includes(dayOfWeek))) : 
      true;
    
    // Check if habit is already completed today
    const isCompleted = habit.completedDates?.includes(todayStr) || false;
    
    return isScheduled && !isCompleted;
  });
};

export const selectCompletedHabitsForToday = (state) => {
  const today = new Date(state.habits.currentDate);
  const todayStr = format(today, 'yyyy-MM-dd');
  
  return state.habits.habits.filter(habit => 
    habit.completedDates?.includes(todayStr)
  );
};

export const selectHabitStreak = (state, habitId) => {
  const habit = state.habits.habits.find(h => h.id === habitId);
  return habit?.streak || 0;
};

export const selectHabitsStatus = state => state.habits.status;
export const selectHabitsError = state => state.habits.error;
export const selectCurrentDate = state => state.habits.currentDate;

// Export the reducer
export default habitSlice.reducer;