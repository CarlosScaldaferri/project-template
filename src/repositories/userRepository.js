import db from "../../prisma/db";

export const dbFindUserBySub = async (sub) => {
  return await db.user.findUnique({
    where: { sub },
  });
};

export const dbCreateUser = async (data) => {
  return db.user.create({
    data,
  });
};

export const dbUpdateUser = async (sub, data) => {
  return db.user.update({
    where: { sub },
    data,
  });
};

export const dbGetAllUsers = async () => {
  return await db.user.findMany();
};

export const deleteEmailsByUserId = async (userId) => {
  return db.email.deleteMany({ where: { user_id: userId } });
};

export const createEmails = async (emails) => {
  return Promise.all(
    emails.map((email) =>
      db.email.create({
        data: email,
      })
    )
  );
};
