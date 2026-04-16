import { configureStore } from '@reduxjs/toolkit';
import profilReducer from './slice/profilReducer';
import userReducer from './slice/userReducer';
import docReducer from './slice/docReducer';
export const store = configureStore({
  reducer: {
    profil: profilReducer,
    users: userReducer,
    docs: docReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;