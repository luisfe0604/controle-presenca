const exportarBtn = document.getElementById("exportar");
const tipoSelect = document.getElementById("tipoExport");
const lista = document.getElementById("listaPresenca");
const dataInput = document.getElementById("data");

dataInput.valueAsDate = new Date();
carregarPresenca(dataInput.value);

dataInput.addEventListener("change", () => {
  carregarPresenca(dataInput.value);
});

async function carregarPresenca(dataSelecionada) {
  lista.innerHTML = "Carregando...";

  const { data: alunos, error: alunosError } = await supaBase
    .from("alunos")
    .select("*")
    .order("nome", { ascending: true });

  if (alunosError) {
    lista.innerHTML = "Erro ao carregar alunos";
    return;
  }

  const { data: presencas, error: presencaError } = await supaBase
    .from("presenca")
    .select("*")
    .eq("data", dataSelecionada);

  if (presencaError) {
    lista.innerHTML = "Erro ao carregar presença";
    return;
  }

  const mapaPresenca = {};
  presencas.forEach((p) => {
    mapaPresenca[p.aluno_id] = p.presente;
  });

  const presencasParaInserir = [];

  alunos.forEach((aluno) => {
    if (!(aluno.id in mapaPresenca)) {
      presencasParaInserir.push({
        aluno_id: aluno.id,
        data: dataSelecionada,
        presente: false,
      });

      mapaPresenca[aluno.id] = false;
    }
  });

  if (presencasParaInserir.length > 0) {
    await supaBase.from("presenca").insert(presencasParaInserir);
  }

  lista.innerHTML = "";

alunos.forEach((aluno) => {
  const li = document.createElement("li");
  const chk = document.createElement("input");

  chk.type = "checkbox";
  chk.checked = mapaPresenca[aluno.id];

  async function salvarPresenca() {
    await supaBase.from("presenca").upsert(
      {
        aluno_id: aluno.id,
        data: dataSelecionada,
        presente: chk.checked,
      },
      {
        onConflict: ["aluno_id", "data"],
      }
    );
    li.classList.toggle("pago", chk.checked);
  }

  chk.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  chk.addEventListener("change", async () => {
    await salvarPresenca();
    atualizarContador();
  });

  li.addEventListener("click", async () => {
    chk.checked = !chk.checked;
    await salvarPresenca();
    atualizarContador();
  });
  
  li.append(chk, " ", aluno.nome);

  lista.appendChild(li);
});

atualizarContador();
}

exportarBtn.addEventListener("click", async () => {
  const tipo = tipoSelect.value;
  const dataBase = dataInput.value;

  let query = supaBase.from("presenca").select(`
    data,
    presente,
    aluno_id,
    alunos!presenca_aluno_fk(nome)
  `);

  if (tipo === "dia") {
    query = query.eq("data", dataBase);
  }

  if (tipo === "mes") {
    const [ano, mes] = dataBase.split("-");
    query = query
      .gte("data", `${ano}-${mes}-01`)
      .lt("data", `${ano}-${Number(mes) + 1}-01`);
  }

  if (tipo === "ano") {
    const ano = dataBase.split("-")[0];
    query = query
      .gte("data", `${ano}-01-01`)
      .lt("data", `${Number(ano) + 1}-01-01`);
  }

  const { data, error } = await query;

  if (error || !data.length) {
    console.log(error);
    alert("Nenhum registro encontrado");
    return;
  }

  gerarExcel(data, tipo, dataBase);
});

function gerarExcel(registros, tipo, dataBase) {
  const linhas = [];

  const mapa = {};

  registros.forEach((r) => {
    const id = r.aluno_id;

    if (!mapa[id]) {
      mapa[id] = {
        nome: r.alunos.nome,
        total: 0,
        presencas: 0,
      };
    }

    mapa[id].total++;
    if (r.presente) mapa[id].presencas++;
  });

  registros.forEach((r) => {
    const aluno = mapa[r.aluno_id];
    const percentual = Math.round((aluno.presencas / aluno.total) * 100);

    linhas.push({
      Aluno: aluno.nome,
      "Total de Aulas": aluno.total,
      Presenças: aluno.presencas,
      "Percentual (%)": percentual,
      Data: r.data,
      Presente: r.presente ? "Sim" : "Não",
    });
  });

  const ws = XLSX.utils.json_to_sheet(linhas);

  ws["!cols"] = Object.keys(linhas[0]).map((key) => ({
    wch: Math.max(key.length, ...linhas.map((l) => String(l[key]).length)) + 2,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Frequência");

  XLSX.writeFile(wb, `frequencia_${tipo}_${dataBase}.xlsx`);
}

function atualizarContador() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  let total = 0;

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      total++;
    }
  });

  document.getElementById("totalPresentes").innerText = total;
}
