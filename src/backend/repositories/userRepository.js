import db from "../../../prisma/db";

/**
 * Busca um usuário pelo ID
 * @param {number} id - ID do usuário
 * @param {Object} includeOptions - Opções para incluir relações
 * @returns {Promise<Object|null>} Usuário encontrado ou null
 */
export const dbFindUserById = async (id, includeOptions = {}) => {
  try {
    safeLog("Buscando usuário por ID:", { id, includeOptions });

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
    throw new Error(
      `Falha ao buscar usuário no banco de dados: ${error.message}`
    );
  }
};

/**
 * Verifica se um usuário tem papel de administrador
 * @param {number} id - ID do usuário
 * @returns {Promise<boolean>} true se o usuário é admin, false caso contrário
 */
export const dbUserIsAdmin = async (id) => {
  try {
    safeLog("Verificando se usuário é admin:", { id });

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
      throw new Error(`Usuário com ID ${id} não encontrado`);
    }

    // Verifica se algum papel associado ao usuário tem is_admin = true
    const isAdmin = user.user_roles.some((userRole) => userRole.role.is_admin);
    return isAdmin;
  } catch (error) {
    console.error("Erro ao verificar se usuário é admin:", error);
    throw new Error(
      `Falha ao buscar informações de administrador: ${error.message}`
    );
  }
};

/**
 * Busca um usuário pelo email
 * @param {string} email - Email do usuário
 * @param {Object} includeOptions - Opções para incluir relações
 * @returns {Promise<Object|null>} Usuário encontrado ou null
 */
export const dbFindUserByEmail = async (email, includeOptions = {}) => {
  try {
    safeLog("Buscando usuário por email:", {
      emailProvided: !!email,
      includeOptions,
    });

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
    throw new Error(`Falha ao buscar usuário por email: ${error.message}`);
  }
};

/**
 * Função utilitária para log seguro que não expõe dados sensíveis
 * @param {string} message - Mensagem a ser logada
 * @param {Object} data - Dados a serem logados, serão sanitizados para remover informações sensíveis
 */
const safeLog = (message, data = {}) => {
  // Cria uma cópia para não modificar o objeto original
  const sanitizedData = { ...data };

  // Remove dados sensíveis
  if (sanitizedData.password) sanitizedData.password = "[REDACTED]";
  if (sanitizedData.email) sanitizedData.email = "[EMAIL DATA]";
  if (sanitizedData.telephone) sanitizedData.telephone = "[TELEPHONE DATA]";
  if (sanitizedData.address) sanitizedData.address = "[ADDRESS DATA]";
  if (sanitizedData.cpf) sanitizedData.cpf = "[REDACTED]";

  console.log(message, sanitizedData);
};

/**
 * Cria um novo usuário com seus relacionamentos (email, telefone, endereço)
 * @param {Object} data - Dados do usuário a ser criado
 * @returns {Promise<Object>} Usuário criado com seus relacionamentos
 */
export const dbCreateUser = async (data) => {
  // Log seguro que não expõe dados sensíveis
  safeLog("Criando usuário:", { id: data.id, name: data.name });

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

/**
 * Prepara as diferenças entre coleções existentes e novas para operações Prisma
 * @param {Array} existingItems - Itens existentes no banco de dados
 * @param {Array} incomingItems - Novos itens recebidos na requisição
 * @param {string} idField - Nome do campo de ID (padrão: "id")
 * @returns {Object|undefined} Objeto com operações create, update e delete, ou undefined se não houver diferenças
 */
const prepareRelationDiff = (
  existingItems = [],
  incomingItems = [],
  idField = "id"
) => {
  const existingIds = new Set(existingItems.map((item) => item[idField]));
  const incomingIds = new Set(
    incomingItems
      .filter((item) => item[idField] !== undefined && item[idField] !== null)
      .map((item) => item[idField])
  );

  const toCreate = incomingItems
    .filter(
      (item) =>
        item[idField] === undefined ||
        item[idField] === null ||
        !existingIds.has(item[idField])
    )
    .map((item) => {
      // Remove potential id field before creating
      const { [idField]: _, ...createData } = item;
      return createData;
    });

  const toUpdate = incomingItems
    .filter(
      (item) =>
        item[idField] !== undefined &&
        item[idField] !== null &&
        existingIds.has(item[idField])
    )
    .map((item) => {
      // Remove id field from data payload
      const { [idField]: itemId, ...updateData } = item;
      return {
        where: { [idField]: itemId },
        data: updateData,
      };
    });

  const toDelete = existingItems
    .filter((item) => !incomingIds.has(item[idField]))
    .map((item) => ({ [idField]: item[idField] })); // Prisma delete expects { id: value }

  // Return only non-empty operations
  const diff = {};
  if (toCreate.length > 0) diff.create = toCreate;
  if (toUpdate.length > 0) diff.update = toUpdate;
  if (toDelete.length > 0) diff.delete = toDelete;

  return Object.keys(diff).length > 0 ? diff : undefined;
};

/**
 * Atualiza um usuário existente e seus relacionamentos (email, telefone, endereço)
 * @param {number} id - ID do usuário a ser atualizado
 * @param {Object} data - Dados do usuário a serem atualizados
 * @returns {Promise<Object>} Usuário atualizado com seus relacionamentos
 */
export const dbUpdateUser = async (id, data) => {
  // 'data' is the raw incoming data
  try {
    // 1. Fetch the current user and their relations
    const existingUser = await db.user.findUnique({
      where: { id },
      include: {
        address: true,
        email: true,
        telephone: true,
      },
    });

    if (!existingUser) {
      throw new Error(`Usuário com ID ${id} não encontrado.`);
    }

    // 2. Prepare the base update data for direct User fields
    const baseUpdateData = {};
    if (data.name !== undefined) baseUpdateData.name = data.name;
    if (data.nickname !== undefined) baseUpdateData.nickname = data.nickname;
    if (data.picture !== undefined) baseUpdateData.picture = data.picture;
    if (data.birth_date !== undefined)
      baseUpdateData.birth_date = data.birth_date
        ? new Date(data.birth_date)
        : null;
    if (data.cpf !== undefined) baseUpdateData.cpf = data.cpf;
    baseUpdateData.updated_at = new Date(); // Always update timestamp

    // 3. Prepare the differential updates for relations if data is provided
    const addressDiff = data.address
      ? prepareRelationDiff(existingUser.address, data.address)
      : undefined;
    const emailDiff = data.email
      ? prepareRelationDiff(existingUser.email, data.email)
      : undefined;
    // Assuming telephone model also has an 'id' field
    const telephoneDiff = data.telephone
      ? prepareRelationDiff(existingUser.telephone, data.telephone)
      : undefined;

    // 4. Combine base data and relation diffs into the final payload
    const finalUpdatePayload = {
      ...baseUpdateData,
      ...(addressDiff && { address: addressDiff }),
      ...(emailDiff && { email: emailDiff }),
      ...(telephoneDiff && { telephone: telephoneDiff }),
    };

    // Log seguro que não expõe dados sensíveis
    safeLog("Atualizando usuário:", {
      id,
      fieldsToUpdate: Object.keys(baseUpdateData),
      hasAddressDiff: !!addressDiff,
      hasEmailDiff: !!emailDiff,
      hasTelephoneDiff: !!telephoneDiff,
    });

    // 5. Execute the update
    return await db.user.update({
      where: { id },
      data: finalUpdatePayload,
      include: {
        // Include relations in the returned object to see the final state
        email: true,
        telephone: true,
        address: true,
      },
    });
  } catch (error) {
    console.error(`Erro ao atualizar usuário (ID: ${id}):`, error);
    // Make the error message more specific if possible
    if (error.message.includes("não encontrado")) {
      throw error; // Re-throw not found error
    }
    // Check for Prisma specific errors if needed
    // if (error instanceof Prisma.PrismaClientKnownRequestError) { ... }
    throw new Error(
      `Falha ao atualizar usuário no banco de dados. Causa: ${error.message}`
    );
  }
};

/**
 * Busca todos os usuários
 * @returns {Promise<Array>} Lista de usuários
 */
export const dbGetAllUsers = async () => {
  try {
    safeLog("Buscando todos os usuários");

    return await db.user.findMany();
  } catch (error) {
    console.error("Erro ao buscar todos os usuários:", error);
    throw new Error(
      `Falha ao buscar usuários no banco de dados: ${error.message}`
    );
  }
};

/**
 * Deleta todos os emails de um usuário
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
export const deleteEmailsByUserId = async (userId) => {
  try {
    safeLog("Deletando emails do usuário:", { userId });

    return await db.email.deleteMany({ where: { user_id: userId } });
  } catch (error) {
    console.error("Erro ao deletar emails do usuário:", error);
    throw new Error(
      `Falha ao deletar emails do banco de dados: ${error.message}`
    );
  }
};

/**
 * Cria múltiplos emails
 * @param {Array} emails - Array de objetos de email para criar
 * @returns {Promise<Array>} Emails criados
 */
export const createEmails = async (emails) => {
  try {
    safeLog("Criando emails:", { count: emails.length });

    return await Promise.all(
      emails.map((email) =>
        db.email.create({
          data: email,
        })
      )
    );
  } catch (error) {
    console.error("Erro ao criar emails:", error);
    throw new Error(
      `Falha ao criar emails no banco de dados: ${error.message}`
    );
  }
};
