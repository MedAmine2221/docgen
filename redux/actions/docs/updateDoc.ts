/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";

export const updateDoc = createAsyncThunk(
  "docs/updateDoc",
  async (
    {
      id,
      docData,
    }: {
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
        cause?: string;
        apisToAdd?: any[];
        apisToUpdate?: any[];
        apisToDelete?: any[];
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // =========================================================
      // 1️⃣ récupérer le document actuel
      // =========================================================

      const currentDocResponse = await fetch(
        `http://localhost:3001/docs/${id}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!currentDocResponse.ok) {
        throw new Error("Failed to fetch current document");
      }

      const docResponse = await fetch(
        `http://localhost:3001/docs/${id}`,
        {
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
            user_creator:
              docData.user_creator?.id ||
              docData.user_creator,
            cause: docData?.cause,
          }),
        }
      );

      if (!docResponse.ok) {
        const errorData = await docResponse.json();

        throw new Error(
          errorData.message || "Failed to update doc"
        );
      }

      const updatedDoc = await docResponse.json();

      // =========================================================
      // 4️⃣ supprimer APIs
      // =========================================================

      if (
        docData.apisToDelete &&
        docData.apisToDelete.length > 0
      ) {
        await Promise.all(
          docData.apisToDelete.map((api: any) =>
            fetch(`http://localhost:3001/apis/${api.id}`, {
              method: "DELETE",
              headers,
            })
          )
        );
      }

      // =========================================================
      // 5️⃣ update APIs existantes
      // =========================================================

      if (
        docData.apisToUpdate &&
        docData.apisToUpdate.length > 0
      ) {
        await Promise.all(
          docData.apisToUpdate.map((api: any) =>
            fetch(`http://localhost:3001/apis/${api.id}`, {
              method: "PUT",
              headers,
              body: JSON.stringify({
                apiMethod: api.apiMethod,
                endPoint: api.endPoint,
              }),
            })
          )
        );
      }

      // =========================================================
      // 6️⃣ ajouter nouvelles APIs
      // =========================================================

      if (
        docData.apisToAdd &&
        docData.apisToAdd.length > 0
      ) {
        await Promise.all(
          docData.apisToAdd.map((api: any) =>
            fetch(`http://localhost:3001/apis/doc/${id}`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                apiMethod: api.apiMethod,
                endPoint: api.endPoint,
              }),
            })
          )
        );
      }

      // =========================================================
      // 7️⃣ construire le doc final localement
      // =========================================================

      const finalDoc = {
        ...updatedDoc,
        apis: [
          ...(docData.apisToUpdate ?? []).map(
            (api: any) => ({
              id: api.id,
              apiMethod: api.apiMethod,
              endPoint: api.endPoint,
            })
          ),

          ...(docData.apisToAdd ?? []).map(
            (api: any) => ({
              apiMethod: api.apiMethod,
              endPoint: api.endPoint,
            })
          ),
        ],
      };

      return finalDoc;
    } catch (error: any) {
      console.error("Update doc error:", error);

      return rejectWithValue(
        error.message || "Failed to update document"
      );
    }
  }
);