/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocType } from "@/constant/interfaces";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const updateDoc = createAsyncThunk(
  'docs/updateDoc',
  async ({ id, docData }: { id: number; docData: DocType }, { rejectWithValue }) => {
    try {
      console.log("docData ",docData);
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`http://localhost:3001/docs/${id}`, {
        method: 'PUT',
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
        throw new Error("Failed to update user");
      }

      const updatedUser = await response.json();
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);