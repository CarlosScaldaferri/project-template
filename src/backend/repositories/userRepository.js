import db from "../../../prisma/db";

export const dbFindUserById = async (id, includeOptions = {}) => {
  try {
    return await db.user.findUnique({
      where: { id },
      include: {
        address: includeOptions.address || false,
        email: includeOptions.email || false,
        telephone: includeOptions.telephone || false,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário por id:", error);
    throw new Error("Falha ao buscar usuário no banco de dados");
  }
};

export const dbUserIsAdmin = async (id) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        user_roles: {
          include: {
            role: {
              select: {
                is_admin: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Verifica se algum papel associado ao usuário tem is_admin = true
    const isAdmin = user.user_roles.some((userRole) => userRole.role.is_admin);
    return isAdmin;
  } catch (error) {
    console.error("Erro ao verificar se usuário é admin:", error);
    throw new Error(
      "Falha ao buscar informações de administrador no banco de dados"
    );
  }
};

export const dbFindUserByEmail = async (email, includeOptions = {}) => {
  try {
    // Busca o usuário pelo email na relação "email"
    const user = await db.user.findFirst({
      where: {
        email: {
          some: {
            email: email, // Espera uma string simples
          },
        },
      },
      include: {
        email: true,
        address: includeOptions.address || false,
        telephone: includeOptions.telephone || false,
      },
    });

    return user; // Retorna o usuário ou null se não encontrado
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    throw new Error("Falha ao buscar usuário no banco de dados");
  }
};

export const dbCreateUser = async (data) => {
  console.log("Dados recebidos:", JSON.stringify(data, null, 2));

  try {
    return await db.user.create({
      data: {
        name: data.name,
        nickname: data.nickname,
        picture: data.picture,
        updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
        birth_date: data.birth_date ? new Date(data.birth_date) : null,
        cpf: data.cpf,
        password: data.password,

        // Correção para os relacionamentos
        email: {
          create: data.email.map((e) => ({
            email: e.email,
            is_main: e.is_main,
            email_verified: e.email_verified || null,
          })),
        },

        telephone: {
          create: data.telephone.map((t) => ({
            is_main: t.is_main,
            type: t.type,
            country_code: t.country_code,
            state_code: t.state_code,
            number: t.number,
            full_number: t.full_number,
          })),
        },

        address: {
          create: data.address.map((a) => ({
            zip_code: a.zip_code,
            street: a.street,
            number: a.number,
            complement: a.complement || "",
            district: a.district,
            city: a.city,
            state: a.state,
            country: a.country,
            is_main: a.is_main,
          })),
        },
      },
      include: {
        email: true,
        telephone: true,
        address: true,
      },
    });
  } catch (error) {
    console.error("Erro detalhado ao criar usuário:", error);
    throw new Error(`Falha ao criar usuário: ${error.message}`);
  }
};

// src/repositories/userRepository.js
export const dbUpdateUser = async (id, data) => {
  try {
    // Atualização completa
    const updateData = {
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

    return await db.user.update({
      where: { id },
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
