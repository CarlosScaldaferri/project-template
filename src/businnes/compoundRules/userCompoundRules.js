import {
  createUser,
  findUserBySub,
  updateUser,
} from "../indivisibleRules/userRules";

export const createOrUpdateUser = async (user, isAuth0Sync) => {
  let tempUser = await findUserBySub(user.sub);
  if (!tempUser) {
    return createUser(user, isAuth0Sync);
  } else {
    return updateUser(user, isAuth0Sync);
  }
};
