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


export const formatDate  = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric" });

export const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });