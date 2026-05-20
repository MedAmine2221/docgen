"use client"
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useNotifications } from "@/hooks/useNotif";
import { getMe } from "@/redux/actions/auth/login";
import { redirect } from "next/navigation";

export default function DeveloperPage() {
  const dispatch  = useAppDispatch();
  useNotifications(
    () => {
      dispatch(getMe()); // rechargera me?.docs automatiquement
    },
    ['doc:created', 'doc:updated', 'doc:deleted']
  );
  redirect("/developer/docs");
}