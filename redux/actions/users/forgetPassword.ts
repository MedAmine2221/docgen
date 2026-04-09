/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";

export const ForgetPwd = createAsyncThunk(
  'users/forger-password',
  async ({ email }: { email: string; }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email
        }),
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);