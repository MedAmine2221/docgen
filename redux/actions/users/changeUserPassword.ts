/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";

export const changeUserPassword = createAsyncThunk(
  'users/change-password',
  async ({ id, data }: { id: number; data: { oldPassword: string; newPassword: string; } }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`http://localhost:3001/users/change-password/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to change user password");
      }

      const changePass = await response.json();
      return changePass;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);