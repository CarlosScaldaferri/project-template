import { dbFindUserBySub } from "@/repositories/userRepository";
import { createUser, updateUser } from "../indivisibleRules/userRules";

export const createOrUpdateUser = async (user) => {
  let tempUser = await dbFindUserBySub(user.sub);

  if (!tempUser) {
    return createUser(user);
  } else {
    return updateUser(user);
  }
};
