/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocType } from "@/constant/interfaces";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const addDoc = createAsyncThunk(
  "docs/addDoc",
  async (
    docData: DocType,
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1️⃣ Create the document
      const docResponse = await fetch("http://localhost:3001/docs", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: docData.name,
          description: docData.description,
          submissionDate: docData.submissionDate,
          status: docData.status,
          baseUrl: docData.baseUrl,
          commonHeader: docData.commonHeader,
          bearerToken: docData.bearerToken,
          user_creator: docData.user_creator?.id || docData.user_creator,
        }),
      });

      if (!docResponse.ok) {
        const errorData = await docResponse.json();
        throw new Error(errorData.message || "Failed to create doc");
      }

      const newDoc = await docResponse.json();

      // 2️⃣ Add APIs to the new document with error handling
      if (docData.apis && docData.apis.length > 0) {
        const addPromises = docData.apis.map(async (api: any) => {
          const addResponse = await fetch(`http://localhost:3001/apis/doc/${newDoc.id}`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              apiMethod: api.apiMethod,
              endPoint: api.endPoint,
            }),
          });
          
          if (!addResponse.ok) {
            console.error(`Failed to add API: ${api.endPoint}`);
            throw new Error(`Failed to add API: ${api.endPoint}`);
          }
          return addResponse.json();
        });
        
        await Promise.all(addPromises);
      }

      // 3️⃣ Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));

      // 4️⃣ Fetch the complete document with its APIs
      const getDocResponse = await fetch(`http://localhost:3001/docs/${newDoc.id}?_embed=apis`, {
        method: "GET",
        headers,
      });

      if (!getDocResponse.ok) {
        // If fetch fails, return the document without APIs
        console.warn("Could not fetch complete document, returning basic document");
        return newDoc;
      }

      const finalDoc = await getDocResponse.json();
      
      return finalDoc;
      
    } catch (error: any) {
      console.error("Add doc error:", error);
      return rejectWithValue(error.message || "Failed to create document");
    }
  }
);