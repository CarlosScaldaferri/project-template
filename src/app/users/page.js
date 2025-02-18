"use client";
import UserList from "@/components/user/UserList";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/router";

export default function UsuariosPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login"); // Redireciona para a página de login
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;

  return <UserList />;
}
