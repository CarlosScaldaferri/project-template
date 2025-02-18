const LoginButton = ({ user }) => {
  return user ? (
    <a href="/api/auth/logout">
      <button>Sair</button>
    </a>
  ) : (
    <a href="/api/auth/login">
      <button>Entre ou Cadastre-se</button>
    </a>
  );
};

export default LoginButton;
