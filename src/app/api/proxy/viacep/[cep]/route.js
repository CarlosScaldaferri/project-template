/**
 * Endpoint proxy para a API ViaCEP
 * @module src/app/api/proxy/viacep/[cep]/route
 */

import { NextResponse } from "next/server";

/**
 * Manipula requisições GET para buscar um endereço pelo CEP
 * @param {Request} request - Objeto de requisição
 * @param {Object} params - Parâmetros da rota
 * @param {string} params.cep - CEP a ser consultado
 * @returns {Promise<NextResponse>} Resposta com os dados do endereço
 */
export async function GET(request, { params }) {
  try {
    const { cep } = params;

    // Valida o CEP
    const cleanedCep = cep.replace(/\D/g, "");
    if (cleanedCep.length !== 8) {
      return NextResponse.json(
        {
          ok: false,
          data: null,
          error: `CEP inválido: ${cep} (deve ter 8 dígitos)`,
        },
        { status: 400 }
      );
    }

    // URL da API ViaCEP
    const url = `https://viacep.com.br/ws/${cleanedCep}/json/`;

    // Headers para a requisição
    const options = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Adiciona um timeout para evitar que a requisição fique pendente por muito tempo
      signal: AbortSignal.timeout(5000), // 5 segundos
    };

    // Faz a requisição para a API ViaCEP
    const response = await fetch(url, options);

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      console.error(
        `Erro na API ViaCEP: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        {
          ok: false,
          data: null,
          error: `Erro na API ViaCEP: ${response.status} ${response.statusText}`,
        },
        { status: 200 } // Retorna 200 para que o cliente possa processar o erro
      );
    }

    // Verifica explicitamente o content-type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`Resposta inválida da API ViaCEP: ${text.slice(0, 50)}...`);
      return NextResponse.json(
        {
          ok: false,
          data: null,
          error: `Resposta inválida da API ViaCEP`,
        },
        { status: 200 } // Retorna 200 para que o cliente possa processar o erro
      );
    }

    // Converte a resposta para JSON
    const data = await response.json();

    // Trata o caso especial do ViaCEP (quando o CEP existe mas não foi encontrado)
    if (data.erro) {
      return NextResponse.json(
        {
          ok: false,
          data: null,
          error: `CEP ${cleanedCep} não encontrado`,
        },
        { status: 200 } // Retorna 200 para que o cliente possa processar o erro
      );
    }

    // Retorna os dados formatados para manter consistência com o formato esperado pelo cliente
    return NextResponse.json({
      ok: true,
      data: {
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        localidade: data.localidade || "",
        uf: data.uf || "",
      },
      error: null,
    });
  } catch (error) {
    console.error("Erro no proxy ViaCEP:", error);
    return NextResponse.json(
      {
        ok: false,
        data: null,
        error: error.message || "Erro interno do servidor",
      },
      { status: 200 } // Retorna 200 para que o cliente possa processar o erro
    );
  }
}
