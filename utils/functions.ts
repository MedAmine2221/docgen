/* eslint-disable @typescript-eslint/no-explicit-any */
import { AVATAR_COLORS } from "@/constant";

export const getInitials = (n: string) =>
  n?.split(" ").map((w) => w[0]).slice(0, 3).join("").toUpperCase() || "?";


export const getColor = (n: string) =>
  AVATAR_COLORS[(n?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

export const handleLogout = (setSaving: any, router: any) => {
  try {
    setSaving(true)
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("tokenChange"));
    router.replace("/auth/login");
    
  } catch (error) {
    console.error(error);
  } finally {
    setSaving(false)
  }
};