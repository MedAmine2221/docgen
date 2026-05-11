import { configureStore } from '@reduxjs/toolkit';
import profilReducer from './slice/profilReducer';
import userReducer from './slice/userReducer';
import docReducer from './slice/docReducer';
import logReducer from './slice/logReducer';
export const store = configureStore({
  reducer: {
    profil: profilReducer,
    users: userReducer,
    docs: docReducer,
    logs: logReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;