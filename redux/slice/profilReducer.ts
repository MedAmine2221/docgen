/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getMe } from '../actions/auth/login';
import { addDoc } from '../actions/docs/addDocs';
import { updateDoc } from '../actions/docs/updateDoc';
import { deleteDoc } from '../actions/docs/deleteDocs';

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
    setProfilCredentials: (state, action: PayloadAction<{ profil: any }>) => {
      state.profil = action.payload.profil;
    },
    logout: (state) => {
      state.profil = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMe.fulfilled, (state, action) => {
        state.profil = action.payload;
      })

      .addCase(addDoc.fulfilled, (state, action) => {
        if (state.profil?.docs) {                    
          const newDoc = {
            ...action.payload,
            apis: action.payload.apis ?? [],
          }
          state.profil.docs.push(newDoc);
        }
      })

      .addCase(updateDoc.fulfilled, (state, action) => {
        if (state.profil?.docs) {
          
          const idx = state.profil.docs.findIndex((d: any) => d.id === action.payload.id);
          const oldApis = state.profil.docs[idx].apis ?? [];
          if (idx !== -1) state.profil.docs[idx] = {...action.payload, apis: action.payload.apis ?? oldApis};
        }
      })

      .addCase(deleteDoc.fulfilled, (state, action) => {
        if (state.profil?.docs) {
          state.profil.docs = state.profil.docs.filter((d: any) => d.id !== action.payload);
        }
      });
  },
});

export const { setProfilCredentials, logout } = profilSlice.actions;
export default profilSlice.reducer;