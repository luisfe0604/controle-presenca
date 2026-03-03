const lista = document.getElementById("listaPagamentos");
const mesInput = document.getElementById("mesPagamento");

const VALOR_MENSALIDADE = 50;

function obterValoresAluno(aluno) {
  const meia = aluno.nome.includes("(30,00)");

  if (meia) {
    return {
      bruto: 30,
      quadra: 5,
      liquido: 25,
    };
  }

  return {
    bruto: 60,
    quadra: 10,
    liquido: 50,
  };
}

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
        },
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
  let totalBruto = 0;
  let totalQuadra = 0;
  let totalLiquido = 0;

  alunos.forEach((aluno, index) => {
    const checkbox = lista.querySelectorAll('input[type="checkbox"]')[index];

    if (checkbox.checked) {
      const valores = obterValoresAluno(aluno);

      totalBruto += valores.bruto;
      totalQuadra += valores.quadra;
      totalLiquido += valores.liquido;
    }
  });

  // desconta ajudante
  totalLiquido -= 100;

  document.getElementById("totalBruto").textContent =
    totalBruto.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  document.getElementById("totalQuadra").textContent =
    totalQuadra.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  document.getElementById("totalLiquido").textContent =
    totalLiquido.toLocaleString("pt-BR", {
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
    `,
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

  const alunosArray = Object.values(mapa);
  const totalAlunos = alunosArray.length;
  const pagantes = alunosArray.filter((a) => a.pago).length;

  let totalBruto = 0;
  let totalQuadra = 0;
  let totalLiquido = 0;

  alunosArray.forEach((aluno) => {
    if (aluno.pago) {
      const valores = obterValoresAluno(aluno);

      totalBruto += valores.bruto;
      totalQuadra += valores.quadra;
      totalLiquido += valores.liquido;
    }
  });

  const ajudante = 100;
  const liquidoFinal = totalLiquido - ajudante;

  const percentual = totalAlunos
    ? Math.round((pagantes / totalAlunos) * 100)
    : 0;

  const linhas = alunosArray.map((aluno) => {
    const valores = obterValoresAluno(aluno);

    return {
      Aluno: aluno.nome,
      Pago: aluno.pago ? "Sim" : "Não",
      "Bruto": aluno.pago ? valores.bruto : 0,
      "Quadra": aluno.pago ? valores.quadra : 0,
      "Liquido": aluno.pago ? valores.liquido : 0,
    };
  });

  // Linha vazia
  linhas.push({});

  // Resumo financeiro
  linhas.push({
    Aluno: "RESUMO",
    Pago: `${pagantes} / ${totalAlunos} (${percentual}%)`,
    Bruto: totalBruto,
    Quadra: totalQuadra,
    Liquido: totalLiquido,
  });

  linhas.push({
    Aluno: "SOFIA",
    Liquido: -ajudante,
  });

  linhas.push({
    Aluno: "LÍQUIDO FINAL",
    Liquido: liquidoFinal,
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
