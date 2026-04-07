"use client";
import { getUsers } from "@/redux/actions/users/getUsers";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/auth/login", "/home"];

function getTokenPayload(): { role?: { name_eng: string } } | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = async() => {
      const token = localStorage.getItem("token");
      const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

      if (!token && !isPublic) {
        router.replace("/auth/login");
        return;
      }

      if (token && isPublic) {
        const payload = getTokenPayload();
        const role = payload?.role?.name_eng?.toUpperCase();

        if (role === "ADMIN") {
          router.replace("/admin");
        } else {
          router.replace("/developer");
        }
        return;
      }

      // ✅ Token présent sur une route protégée → vérifier l'accès
      if (token) {
        const payload = getTokenPayload();
        const role = payload?.role?.name_eng?.toUpperCase();

        const isAdminRoute = pathname.startsWith("/admin");
        const isDevRoute = pathname.startsWith("/developer");

        if (role === "ADMIN" && isDevRoute) {
          router.replace("/admin");
          return;
        }

        if (role !== "ADMIN" && isAdminRoute) {
          router.replace("/developer");
          return;
        }
      }

      setReady(true);
    };

    check();

    window.addEventListener("tokenChange", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("tokenChange", check);
      window.removeEventListener("storage", check);
    };
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}