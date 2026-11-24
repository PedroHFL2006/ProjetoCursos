import axios, { isAxiosError } from "axios";

import { readSession } from "../auth/session";

interface ApiErrorResponse {
  message?: string;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || "http://localhost:3000",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const session = readSession();
  if (session) {
    config.headers.set("Authorization", `Bearer ${session.token}`);
  }

  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (
    isAxiosError<ApiErrorResponse>(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }

  if (isAxiosError(error) && !error.response) {
    return "Não foi possível conectar à API. Verifique se o servidor está ativo.";
  }

  return "Não foi possível concluir a solicitação. Tente novamente.";
}
