import db from "../../prisma/db";

export const dbFindUserBySub = async (sub, includeOptions = {}) => {
  try {
    return await db.user.findUnique({
      where: { sub },
      include: {
        address: includeOptions.address || false,
        email: includeOptions.email || false,
        telephone: includeOptions.telephone || false,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário por Sub:", error);
    throw new Error("Falha ao buscar usuário no banco de dados");
  }
};

export const dbCreateUser = async (data) => {
  console.log(JSON.stringify(data, null, 2));
  try {
    return await db.user.create({
      data: {
        sub: data.sub,
        name: data.name,
        nickname: data.nickname,
        picture: data.picture,
        updated_at: data.updated_at || new Date(),
        address:
          data.address && data.address.create
            ? { create: data.address.create }
            : undefined,
        email:
          data.email && data.email.create
            ? { create: data.email.create }
            : undefined,
        telephone:
          data.telephone && data.telephone.create
            ? { create: data.telephone.create }
            : undefined,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error("Falha ao criar usuário no banco de dados");
  }
};

// src/repositories/userRepository.js
export const dbUpdateUser = async (sub, data, isAuth0Sync = false) => {
  try {
    let updateData;

    if (isAuth0Sync) {
      // Apenas os campos básicos e email, sem tocar em address ou telephone
      updateData = {
        name: data.name,
        nickname: data.nickname,
        picture: data.picture,
        updated_at: data.updated_at || new Date(),
        email: data.email
          ? {
              create: data.email.create || [],
              update: data.email.update || [],
              deleteMany: data.email.deleteMany || { id: { in: [] } },
            }
          : undefined,
      };
    } else {
      // Atualização completa
      updateData = {
        name: data.name,
        nickname: data.nickname,
        picture: data.picture,
        birth_date: data.birth_date,
        cpf: data.cpf,
        updated_at: data.updated_at || new Date(),
        address: data.address
          ? {
              deleteMany: data.address.deleteMany || { id: { in: [] } },
              create: data.address.create || [],
              update: data.address.update || [],
            }
          : undefined,
        email: data.email
          ? {
              deleteMany: data.email.deleteMany || { id: { in: [] } },
              create: data.email.create || [],
              update: data.email.update || [],
            }
          : undefined,
        telephone: data.telephone
          ? {
              deleteMany: data.telephone.deleteMany || { id: { in: [] } },
              create: data.telephone.create || [],
              update: data.telephone.update || [],
            }
          : undefined,
      };
    }

    console.log(sub, JSON.stringify(updateData, null, 2));

    return await db.user.update({
      where: { sub },
      data: updateData,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw new Error("Falha ao atualizar usuário no banco de dados");
  }
};

export const dbGetAllUsers = async () => {
  try {
    return await db.user.findMany();
  } catch (error) {
    console.error("Erro ao buscar todos os usuários:", error);
    throw new Error("Falha ao buscar usuários no banco de dados");
  }
};

export const deleteEmailsByUserId = async (userId) => {
  try {
    return await db.email.deleteMany({ where: { user_id: userId } });
  } catch (error) {
    console.error("Erro ao deletar emails do usuário:", error);
    throw new Error("Falha ao deletar emails do banco de dados");
  }
};

export const createEmails = async (emails) => {
  try {
    return await Promise.all(
      emails.map((email) =>
        db.email.create({
          data: email,
        })
      )
    );
  } catch (error) {
    console.error("Erro ao criar emails:", error);
    throw new Error("Falha ao criar emails no banco de dados");
  }
};
