import { AuthParams } from "@/constant/interfaces";

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
        return data.access_token;

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}