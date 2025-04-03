// src/app/user/register/page.js
"use client";
import UserForm from "@/frontend/components/user/form/UserForm";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  return (
    <div>
      <UserForm userId={userId} />
    </div>
  );
}
