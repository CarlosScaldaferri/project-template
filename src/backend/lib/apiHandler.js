// src/backend/lib/apiHandler.js
import { NextResponse } from "next/server";
import { composeMiddlewares } from "../middleware/midleware";

export function createApiHandler(handler, middlewares = []) {
  const composed = composeMiddlewares(...middlewares);

  return async (request) => {
    try {
      const middlewareResult = await composed(request);
      if (middlewareResult) return middlewareResult;

      const result = await handler(request);
      return result;
    } catch (error) {
      console.error(`Erro na rota ${request.url}:`, error);
      return NextResponse.json(
        { error: "Erro interno no servidor", details: error.message },
        { status: 500 }
      );
    }
  };
}
