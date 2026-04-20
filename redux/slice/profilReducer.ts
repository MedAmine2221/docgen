/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/features/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getMe } from '../actions/auth/login';

interface AuthState {
  profil: any | null;
}

const initialState: AuthState = {
  profil: null,
};

export const profilSlice = createSlice({
  name: 'profil',
  initialState,
  reducers: {
    // Action pour enregistrer les infos après le login
    setProfilCredentials: (state, action: PayloadAction<{ profil: any; }>) => {
      state.profil = action.payload.profil;
    },
    // Action pour la déconnexion
    logout: (state) => {
      state.profil = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Docs
      .addCase(getMe.fulfilled, (state, action) => {
        state.profil = action.payload; // payload = tableau d’utilisateurs
      });
  },
});

export const { setProfilCredentials, logout } = profilSlice.actions;
export default profilSlice.reducer;