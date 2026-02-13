const lista = document.getElementById("listaPagamentos");
const mesInput = document.getElementById("mesPagamento");
const totalMensalEl = document.getElementById("totalMensal");

const VALOR_MENSALIDADE = 50;

mesInput.addEventListener("change", () => {
  carregarPagamentos(mesInput.value);
});

carregarPagamentos(mesInput.value);

async function carregarPagamentos(mesSelecionado) {
  lista.innerHTML = "Carregando...";

  const { data: alunos, error: alunosError } = await supaBase
    .from("alunos")
    .select("*")
    .order("nome", { ascending: true });

  if (alunosError) {
    lista.innerHTML = "Erro ao carregar alunos";
    return;
  }

  const mesBase = `${mesSelecionado}-01`;

  const { data: pagamentos, error: pagamentoError } = await supaBase
    .from("pagamentos")
    .select("*")
    .eq("mes", mesBase);

  if (pagamentoError) {
    lista.innerHTML = "Erro ao carregar pagamentos";
    return;
  }

  const mapaPagamentos = {};
  pagamentos.forEach((p) => {
    mapaPagamentos[p.aluno_id] = p.pago;
  });

  const pagamentosParaInserir = [];

  alunos.forEach((aluno) => {
    if (!(aluno.id in mapaPagamentos)) {
      pagamentosParaInserir.push({
        aluno_id: aluno.id,
        mes: mesBase,
        pago: false,
      });

      mapaPagamentos[aluno.id] = false;
    }
  });

  if (pagamentosParaInserir.length > 0) {
    await supaBase.from("pagamentos").insert(pagamentosParaInserir);
  }

  lista.innerHTML = "";

  alunos.forEach((aluno) => {
    const li = document.createElement("li");
    const chk = document.createElement("input");
    const status = document.createElement("span");

    chk.type = "checkbox";
    chk.checked = mapaPagamentos[aluno.id];

    status.className = "status";
    status.textContent = chk.checked ? "Pago" : "Pendente";
    status.classList.add(chk.checked ? "pago" : "nao");

    if (chk.checked) li.classList.add("pago");

    async function salvarPagamento() {
      await supaBase.from("pagamentos").upsert(
        {
          aluno_id: aluno.id,
          mes: mesBase,
          pago: chk.checked,
        },
        {
          onConflict: ["aluno_id", "mes"],
        }
      );

      status.textContent = chk.checked ? "Pago" : "Pendente";
      status.className = "status " + (chk.checked ? "pago" : "nao");

      li.classList.toggle("pago", chk.checked);
      atualizarTotal();
    }

    chk.addEventListener("click", (e) => e.stopPropagation());
    chk.addEventListener("change", salvarPagamento);

    li.addEventListener("click", async () => {
      chk.checked = !chk.checked;
      await salvarPagamento();
    });

    li.append(chk, aluno.nome, status);
    lista.appendChild(li);
  });

  atualizarTotal();

  function atualizarTotal() {
    const pagos = lista.querySelectorAll(
      'input[type="checkbox"]:checked'
    ).length;

    const total = pagos * VALOR_MENSALIDADE;

    totalMensalEl.textContent = total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const exportarBtn = document.getElementById("exportarPagamentos");

  exportarBtn.addEventListener("click", async () => {
    const mes = `${mesSelecionado}-01`;

    const { data, error } = await supaBase
      .from("pagamentos")
      .select(
        `
      mes,
      pago,
      aluno_id,
      alunos!pagamentos_aluno_id_fkey(nome)
    `
      )
      .eq("mes", mes);

    if (error || !data.length) {
      alert("Nenhum pagamento encontrado");
      return;
    }

    gerarExcelPagamentos(data, mes);
  });

  function gerarExcelPagamentos(registros, mes) {
    const mapa = {};

    registros.forEach((r) => {
      if (!mapa[r.aluno_id]) {
        mapa[r.aluno_id] = {
          nome: r.alunos.nome,
          pago: r.pago,
        };
      }
    });

    const totalAlunos = Object.keys(mapa).length;
    const pagantes = Object.values(mapa).filter((a) => a.pago).length;
    const totalArrecadado = pagantes * VALOR_MENSALIDADE;
    const percentual = Math.round((pagantes / totalAlunos) * 100);

    const linhas = Object.values(mapa).map((aluno) => ({
      Aluno: aluno.nome,
      Pago: aluno.pago ? "Sim" : "Não",
      "Valor Mensalidade": `R$ ${VALOR_MENSALIDADE.toFixed(2)}`,
    }));

    linhas.push({});
    linhas.push({
      Aluno: "TOTAL",
      Pago: `${pagantes} / ${totalAlunos}`,
      "Valor Mensalidade": `R$ ${totalArrecadado.toFixed(2)}`,
      Percentual: `${percentual}%`,
    });

    const ws = XLSX.utils.json_to_sheet(linhas);

    ws["!cols"] = Object.keys(linhas[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...linhas.map((l) => String(l[key] || "").length)
        ) + 2,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagamentos");

    XLSX.writeFile(wb, `pagamentos_${mes}.xlsx`);
  }
}
