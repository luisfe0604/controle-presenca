import { api } from "./api";

export async function listarPlanos() {
  const { data } = await api.get("/planos");

  return data;
}