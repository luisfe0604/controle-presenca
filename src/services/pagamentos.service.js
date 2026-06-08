import { api } from "./api";

export async function listarPagamentos(mes) {
  const { data } = await api.get(`/pagamentos/mes/${mes}`);

  return data;
}

export async function fecharMes(mes) {
  const { data } = await api.post("/pagamentos/fechar-mes", { mes });

  return data;
}

export async function atualizarPagamento(id, pago) {
  const { data } = await api.patch(`/pagamentos/${id}`, { pago });

  return data;
}
