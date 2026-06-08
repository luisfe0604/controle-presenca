import { api } from "./api";

export async function listarAlunos() {
  const { data } = await api.get("/alunos");

  return data;
}

export async function criarAluno(payload) {
  const { data } = await api.post("/alunos", payload);

  return data;
}

export async function atualizarAluno(id, payload) {
  const { data } = await api.put(`/alunos/${id}`, payload);

  return data;
}

export async function inativarAluno(id) {
  await api.patch(`/alunos/${id}/inativar`);
}
