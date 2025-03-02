import {
  dbGetAllUsers,
  dbCreateUser,
  dbUpdateUser,
} from "@/repositories/userRepository";

export const getAllUsers = () => {
  return dbGetAllUsers();
};

export const createUser = (user) => {
  return dbCreateUser({
    sub: user.sub,
    name: user.name,
    nickname: user.nickname,
    picture: user.picture,
    updated_at: new Date(),
  });
};

export const updateUser = (user) => {
  return dbUpdateUser(user.sub, {
    sub: user.sub,
    name: user.name,
    nickname: user.nickname,
    picture: user.picture,
    updated_at: new Date(),
  });
};

export const applyCPFMask = (valor) => {
  valor = valor.replace(/\D/g, ""); // Remove tudo que não é dígito
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2"); // Adiciona ponto após 3 dígitos
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2"); // Adiciona ponto após mais 3 dígitos
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Adiciona traço antes dos últimos 2 dígitos
  return valor;
};
