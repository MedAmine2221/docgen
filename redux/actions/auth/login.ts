import { AuthParams } from "@/constant/interfaces";

export async function login({ username, password }: AuthParams) {
    try{
        const response = await fetch('https://dummyjson.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                expiresInMins: 30,
            }),
        })

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }        
        localStorage.setItem("token", data.accessToken)
        return data        
    }
    catch (error) {
        console.error("Error:", error);
        throw error;
    }
}