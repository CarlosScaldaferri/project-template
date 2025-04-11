// src/app/user/register/page.js
"use client";
import UserForm from "@/frontend/components/user/form/UserForm";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  return (
    <div>
      <UserForm initialMode="create" />
    </div>
  );
}
