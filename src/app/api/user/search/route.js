// src/app/api/user/search/route.js  <-- NOME SUGERIDO (ou mantenha /register se tiver um motivo específico)
import { NextResponse } from "next/server";
import backendUserService from "@/backend/services/userService";
import { createApiHandler } from "@/backend/lib/apiHandler";
import {
  requireAuth /*, requirePermission */,
} from "@/backend/middleware/midleware"; // Ajuste permissões se necessário

// Lista de campos permitidos para ordenação (SEGURANÇA)
const ALLOWED_SORT_FIELDS = [
  "id",
  "name",
  "nickname",
  "cpf",
  "birth_date",
  "updated_at",
  "mainEmail",
  "mainTelephone",
]; // Adicione mainEmail/mainTelephone se o backend puder ordenar por eles

// Handler principal da rota GET
const handler = async (request) => {
  const params = request.nextUrl.searchParams;

  // --- 1. Extração e Validação dos Parâmetros ---

  // Paginação
  const startIndexParam = params.get("startIndex");
  const endIndexParam = params.get("endIndex");
  const parsedStartIndex = parseInt(startIndexParam, 10);
  const parsedEndIndex = parseInt(endIndexParam, 10);

  if (isNaN(parsedStartIndex) || isNaN(parsedEndIndex)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Índice inicial ou final inválido: devem ser números.",
      },
      { status: 400 }
    );
  }
  if (parsedStartIndex < 0 || parsedEndIndex < 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "Índice inicial ou final inválido: não podem ser negativos.",
      },
      { status: 400 }
    );
  }
  if (parsedEndIndex <= parsedStartIndex) {
    // Decisão: Retornar erro ou vazio? Erro é mais explícito.
    // Se quiser retornar vazio, comente a linha abaixo e descomente a de 'skip/take'
    return NextResponse.json(
      {
        ok: false,
        message:
          "Intervalo inválido: O índice final deve ser maior que o índice inicial.",
      },
      { status: 400 }
    );
    // const skip = 0; const take = 0; // Para retornar vazio
  }
  const skip = parsedStartIndex;
  const take = parsedEndIndex - parsedStartIndex;

  // Ordenação
  const sortField = params.get("sort") || "id"; // Default sort
  const sortOrder =
    params.get("order")?.toLowerCase() === "desc" ? "desc" : "asc"; // Default 'asc'
  const secondarySortField = params.get("secondary_sort"); // Pode ser null
  const secondarySortOrder =
    params.get("secondary_order")?.toLowerCase() === "desc" ? "desc" : "asc";

  // Valida campos de ordenação
  if (!ALLOWED_SORT_FIELDS.includes(sortField)) {
    return NextResponse.json(
      { ok: false, message: `Campo de ordenação inválido: ${sortField}` },
      { status: 400 }
    );
  }
  if (secondarySortField && !ALLOWED_SORT_FIELDS.includes(secondarySortField)) {
    return NextResponse.json(
      {
        ok: false,
        message: `Campo de ordenação secundário inválido: ${secondarySortField}`,
      },
      { status: 400 }
    );
  }

  // Filtragem (Busca)
  const searchTerm = params.get("search")?.trim() || ""; // Pega e remove espaços extras, default vazio

  // Flags de Inclusão
  const includeMainEmail = params.get("main_email") === "true";
  const includeMainTelephone = params.get("main_telephone") === "true";
  const includeMainAddress = params.get("main_address") === "true"; // Adicionado

  // --- 2. Monta objeto de opções para o serviço ---
  const options = {
    skip,
    take,
    sortField,
    sortOrder,
    searchTerm,
    includeMainEmail,
    includeMainTelephone,
    includeMainAddress,
    // Inclui ordenação secundária apenas se fornecida
    ...(secondarySortField && { secondarySortField, secondarySortOrder }),
  };

  // --- 3. Chama o Serviço ---
  // (Removido o tratamento de erro daqui, pois createApiHandler fará isso)
  const result = await backendUserService.getUsers(options);

  // --- 4. Retorna a Resposta ---
  // O service agora deve retornar { ok: true, data: users, totalCount: count }
  // O createApiHandler envolverá isso em try/catch e tratará erros ok:false
  if (!result.ok) {
    // Isso não deveria acontecer se createApiHandler estiver funcionando, mas por segurança:
    console.error("Erro inesperado retornado pelo serviço:", result.error);
    return NextResponse.json(
      {
        ok: false,
        message: result.error || "Erro interno no servidor ao buscar usuários.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Busca efetuada com sucesso!",
      data: result.data,
      meta: {
        // Adiciona metadados com a contagem total
        totalCount: result.totalCount,
      },
    },
    { status: 200 }
  );
};

// Exporta a rota com o handler e middlewares aplicados
// Ajuste as permissões conforme necessário para a rota de busca
export const GET = createApiHandler(handler, [
  requireAuth,
  // requirePermission("/user/search", "read"), // Exemplo de permissão de leitura
]);
