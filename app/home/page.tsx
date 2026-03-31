"use client";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
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
