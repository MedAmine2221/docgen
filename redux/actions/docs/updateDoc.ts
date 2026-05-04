/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";

export const updateDoc = createAsyncThunk(
  "docs/updateDoc",
  async (
    { id, docData }: {
      id: string;
      docData: {
        name?: string;
        description?: string;
        submissionDate?: string;
        status?: string;
        baseUrl?: string;
        commonHeader?: string;
        bearerToken?: string;
        user_creator?: any;
        apisToAdd?: any[];
        apisToUpdate?: any[];
        apisToDelete?: any[];
      }
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1️⃣ Mettre à jour le document principal
      const docResponse = await fetch(`http://localhost:3001/docs/${id}`, {
        method: "PUT",
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
        throw new Error(errorData.message || "Failed to update doc");
      }

      const updatedDoc = await docResponse.json();

      // 2️⃣ Supprimer les APIs marquées
      if (docData.apisToDelete && docData.apisToDelete.length > 0) {
        await Promise.all(
          docData.apisToDelete.map((api: any) =>
            fetch(`http://localhost:3001/apis/${api.id}`, { method: "DELETE", headers })
          )
        );
      }

      // 3️⃣ Mettre à jour les APIs existantes
      if (docData.apisToUpdate && docData.apisToUpdate.length > 0) {
        await Promise.all(
          docData.apisToUpdate.map((api: any) =>
            fetch(`http://localhost:3001/apis/${api.id}`, {
              method: "PUT",
              headers,
              body: JSON.stringify({ apiMethod: api.apiMethod, endPoint: api.endPoint }),
            })
          )
        );
      }

      // 4️⃣ Ajouter les nouvelles APIs
      if (docData.apisToAdd && docData.apisToAdd.length > 0) {
        await Promise.all(
          docData.apisToAdd.map((api: any) =>
            fetch(`http://localhost:3001/apis/doc/${id}`, {
              method: "POST",
              headers,
              body: JSON.stringify({ apiMethod: api.apiMethod, endPoint: api.endPoint }),
            })
          )
        );
      }

      // 5️⃣ Construire le doc final localement (pas de GET supplémentaire)
      const finalDoc = {
        ...updatedDoc,
        apis: [
          ...(docData.apisToUpdate ?? []).map((api: any) => ({
            id: api.id,
            apiMethod: api.apiMethod,
            endPoint: api.endPoint,
          })),
          ...(docData.apisToAdd ?? []).map((api: any) => ({
            apiMethod: api.apiMethod,
            endPoint: api.endPoint,
          })),
        ],
      };

      return finalDoc;

    } catch (error: any) {
      console.error("Update doc error:", error);
      return rejectWithValue(error.message || "Failed to update document");
    }
  }
);