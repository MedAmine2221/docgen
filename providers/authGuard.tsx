"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/auth/login", "/home"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem("token");
      const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

      if (!token && !isPublic) {
        router.replace("/auth/login");
      } else if (token && isPublic) {
        router.replace("/admin");
      } else {
        setReady(true);
      }
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