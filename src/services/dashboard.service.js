import { api } from "./api";

export async function obterDashboard() {
  const hoje = new Date();

  const mes =
    `${hoje.getFullYear()}-${
      String(
        hoje.getMonth() + 1
      ).padStart(2, "0")
    }`;

  const { data } =
    await api.get(
      `/dashboard?mes=${mes}`
    );

  return data;
}