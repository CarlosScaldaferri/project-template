// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import backendUserService from "@/backend/services/userService";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await backendUserService.findUserByEmail(
          credentials.email
        );

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Senha incorreta");
        }

        const isAdmin = await backendUserService.userIsAdmin(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          isAdmin: isAdmin,
          picture: user.picture,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Adiciona todos os dados que você quer persistir no token
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.nickname = user.nickname;
        token.isAdmin = user.isAdmin;
        token.picture = user.picture;
      }
      return token;
    },
    async session({ session, token }) {
      // Passa os dados do token para a sessão
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.nickname = token.nickname;
      session.user.isAdmin = token.isAdmin;
      session.user.picture = token.picture;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
