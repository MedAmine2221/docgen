"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const profil = useSelector(
    (state: RootState) => state.profil.profil
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ Autoriser les pages auth
    if (pathname.startsWith("/auth")) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    // ✅ Pas connecté
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // ✅ Gestion des rôles
    if (profil) {
      const role = profil.role?.name_eng?.toLowerCase();

      if (
        pathname.startsWith("/admin") &&
        role !== "admin"
      ) {
        router.replace(
          role === "developer"
            ? "/developer"
            : "/client"
        );
      } else if (
        pathname.startsWith("/developer") &&
        role !== "developer" &&
        role !== "admin"
      ) {
        router.replace("/client");
      } else if (
        pathname.startsWith("/client") &&
        role === "admin"
      ) {
        router.replace("/admin");
      } else if (pathname === "/") {
        if (role === "admin")
          router.replace("/admin");
        else if (role === "developer")
          router.replace("/developer");
        else router.replace("/client");
      }
    }

    setIsLoading(false);
  }, [profil, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5262e]" />
      </div>
    );
  }

  return <>{children}</>;
}