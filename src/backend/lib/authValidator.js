const { default: db } = require("../../../prisma/db");

/**
 * Verifica se um usuário tem permissão para uma ação específica
 * @param {number} userId - ID do usuário
 * @param {string} path - Caminho do módulo (ex: "/user/register")
 * @param {"create"|"read"|"update"|"delete"} action - Ação a verificar
 * @param {string} [field] - Campo específico (opcional)
 * @returns {Promise<boolean>} - true se permitido
 */
async function checkPermission(userId, path, action, field = null) {
  try {
    // 1. Busca o registro do path correspondente
    const pathRecord = await db.path.findFirst({
      where: {
        route: path,
        field: field || null,
      },
      select: {
        id: true,
      },
    });

    if (!pathRecord) {
      console.warn(
        `[Permissão] Path não encontrado: ${path}${field ? `/${field}` : ""}`
      );
      return false;
    }

    // 2. Busca regras aplicáveis (diretas ou via role)
    const rules = await db.rule.findMany({
      where: {
        path_id: pathRecord.id,
        OR: [
          { user_id: userId }, // Permissões diretas
          {
            role: {
              user_roles: { some: { user_id: userId } },
            },
          }, // Permissões via role
        ],
      },
      select: {
        user_id: true,
        [action]: true, // Seleciona apenas a ação relevante
      },
      orderBy: { user_id: "desc" }, // Prioriza regras diretas
    });

    // 3. Verifica regras na ordem de prioridade
    for (const rule of rules) {
      // Primeiro verifica regras diretas do usuário
      if (rule.user_id === userId) {
        return rule[action];
      }
    }

    // Se não encontrou regra direta, verifica regras de role
    return rules.some((rule) => rule[action]);
  } catch (error) {
    console.error("[Permissão] Erro ao verificar:", error);
    return false; // Por padrão, nega acesso em caso de erro
  }
}

module.exports = {
  checkPermission,
};
