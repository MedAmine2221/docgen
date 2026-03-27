/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/features/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
}

const initialState: AuthState = {
  user: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action pour enregistrer les infos après le login
    setUserCredentials: (state, action: PayloadAction<{ user: any; }>) => {
      state.user = action.payload;
    },
    // Action pour la déconnexion
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUserCredentials, logout } = userSlice.actions;
export default userSlice.reducer;