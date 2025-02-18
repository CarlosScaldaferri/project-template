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
