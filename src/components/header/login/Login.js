"use client";
import React from "react";
import LoginImg from "./loginImg/LoginImg";
import LoginButton from "./loginButton/LoginButton";
import { useUser } from "@auth0/nextjs-auth0/client";

const Login = () => {
  const { user, isLoading } = useUser();

  return (
    <div className="flex flex-col items-center">
      <LoginImg user={user} isLoading={isLoading} />
      <LoginButton user={user} isLoading={isLoading} />
    </div>
  );
};

export default Login;
