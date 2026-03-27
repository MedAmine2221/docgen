"use client";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="flex flex-col justify-center items-center">
      <Button className="bg-[#c5262e]" onClick={()=>router.push("/auth/login")}>
        Se Connecter
      </Button>
    </main>
  );
}
