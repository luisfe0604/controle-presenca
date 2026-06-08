import { api } from "./api";

export async function listarPresencas(data) {
  const { data: response } =
    await api.get(
      `/presenca/data/${data}`
    );

  return response;
}

export async function salvarPresenca(payload) {
  const { data } =
    await api.post(
      "/presenca",
      payload
    );

  return data;
}