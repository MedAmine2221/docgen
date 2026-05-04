// /* eslint-disable @typescript-eslint/no-explicit-any */
// // redux/features/authSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { getMe } from '../actions/auth/login';

// interface AuthState {
//   profil: any | null;
// }

// const initialState: AuthState = {
//   profil: null,
// };

// export const profilSlice = createSlice({
//   name: 'profil',
//   initialState,
//   reducers: {
//     // Action pour enregistrer les infos après le login
//     setProfilCredentials: (state, action: PayloadAction<{ profil: any; }>) => {
//       state.profil = action.payload.profil;
//     },
//     // Action pour la déconnexion
//     logout: (state) => {
//       state.profil = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Docs
//       .addCase(getMe.fulfilled, (state, action) => {
//         state.profil = action.payload; // payload = tableau d’utilisateurs
//       });
//   },
// });

// export const { setProfilCredentials, logout } = profilSlice.actions;
// export default profilSlice.reducer;



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
          state.profil.docs.push(action.payload);
        }
      })

      .addCase(updateDoc.fulfilled, (state, action) => {
        if (state.profil?.docs) {
          const idx = state.profil.docs.findIndex((d: any) => d.id === action.payload.id);
          if (idx !== -1) state.profil.docs[idx] = action.payload;
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