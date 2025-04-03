// app/login/page.js
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Login realizado com sucesso!");
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && toast.error(error)}
        {/* Botão do Google */}
        <button
          onClick={() => {
            toast.promise(signIn("google"), {
              loading: "Entrando com Google...",
              success: "Login com Google realizado!",
              error: "Erro ao entrar com Google",
            });
          }}
          className="w-full flex items-center justify-center gap-2 mb-4 bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
        >
          <FcGoogle className="text-xl" />
          <span>Entrar com Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">ou</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Formulário Email/Senha */}
        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-500"
          >
            Esqueceu a senha?
          </a>
        </div>

        {/* Adicione esta seção para o link de cadastro */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Não tem uma conta? </span>
          <a
            href="/user/register"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Cadastre-se
          </a>
        </div>
      </div>
    </div>
  );
}
