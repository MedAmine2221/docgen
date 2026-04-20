/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthParams } from "@/constant/interfaces";
import { createAsyncThunk } from "@reduxjs/toolkit";

export async function login({ email, password }: AuthParams) {
    try {
        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if(response.status == 401){
            return "password or email incorrect"
        }
        let data = null;

        const text = await response.text(); // read raw response first

        data = text ? JSON.parse(text) : null;        
        if (!response.ok) {
            throw new Error(data?.message || "Login failed");
        }

        if (!data?.access_token) {
            throw new Error("No token received from server");
        }

        localStorage.setItem("token", data.access_token);        
        return data;

    } catch (error) {
        console.error("Error:", error);

        throw error;
    }
}

export const getMe = createAsyncThunk(
  'users/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch('http://localhost:3001/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch docs");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);