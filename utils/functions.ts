import { AVATAR_COLORS } from "@/constant";

export const getInitials = (n: string) =>
  n?.split(" ").map((w) => w[0]).slice(0, 3).join("").toUpperCase() || "?";


export const getColor = (n: string) =>
  AVATAR_COLORS[(n?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];