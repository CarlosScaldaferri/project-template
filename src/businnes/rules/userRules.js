export const ensurePrimaryEmailExists = (user) => {
  const hasPrimaryEmail = user.email?.some((e) => e.is_main);
  if (!hasPrimaryEmail) {
    throw new Error("É necessário um email principal");
  }
  return user;
};

export const validateUserData = (user) => {
  if (!user.name) {
    throw new Error("Nome é obrigatório");
  }
  if (!user.email?.length) {
    throw new Error("Pelo menos um email é necessário");
  }
  return user;
};
