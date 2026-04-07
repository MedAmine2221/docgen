/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";

export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData: { name: string; email: string; password: string; role_id: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: { id: userData.role_id }
        }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to add user");
      }

      const newUser = await response.json();
      return newUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);