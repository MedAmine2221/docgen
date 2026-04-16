/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocType } from "@/constant/interfaces";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const addDoc = createAsyncThunk(
  'docs/addDoc',
  async (docData : DocType, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch('http://localhost:3001/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: docData.name,
          description: docData.description,
          submissionDate: docData.submissionDate,
          status: docData.status,
          baseUrl: docData.baseUrl,
          apiMethod: docData.apiMethod,
          commonHeader: docData.commonHeader,
          bearerToken: docData.bearerToken ,
          created_by: Number(docData.created_by.id)
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