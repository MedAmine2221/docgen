/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocsState } from '@/constant/interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { updateDoc } from '../actions/docs/updateDoc';
import { addDoc } from '../actions/docs/addDocs';
import { fetchDocs } from '../actions/docs/getDocs';
import { deleteDoc } from '../actions/docs/deleteDocs';

// Initial State
const initialState: DocsState = {
  docs: [],
};

// Slice
const docsSlice = createSlice({
  name: 'docs',
  initialState,
  reducers: {
    setDoc: (state, action) => {      
      state.docs = action.payload.docs;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Docs
      .addCase(fetchDocs.fulfilled, (state, action) => {
        state.docs = action.payload; // payload = tableau d’utilisateurs
      })
      
      // Add Doc
      .addCase(addDoc.fulfilled, (state, action) => {
        state.docs.push(action.payload); // Ajout direct dans la liste
      })
      
      // Update Doc
      .addCase(updateDoc.fulfilled, (state, action) => {
        const index = state.docs.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.docs[index] = action.payload; // Mise à jour directe dans la liste
        }
      })
      // Delete Doc
      .addCase(deleteDoc.fulfilled, (state, action) => {        
        state.docs = state.docs.filter(doc => doc.id !== action.payload); // Suppression directe
      });
  },
});

export const { setDoc } = docsSlice.actions;
export default docsSlice.reducer;