/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/features/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
      state.profil = action.payload;
    },
    // Action pour la déconnexion
    logout: (state) => {
      state.profil = null;
    },
  },
});

export const { setProfilCredentials, logout } = profilSlice.actions;
export default profilSlice.reducer;