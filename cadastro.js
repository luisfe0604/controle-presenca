const form = document.getElementById("alunoForm");
const lista = document.getElementById("listaAlunos");

async function carregarAlunos() {
  lista.innerHTML = "";

  const { data: alunos, error } = await supaBase.from("alunos").select("*");

  if (error) {
    alert("Erro ao carregar alunos");
    return;
  }

  alunos.forEach((aluno) => {
    const li = document.createElement("li");

    const nome = document.createElement("span");
    nome.textContent = aluno.nome;

    const btnDelete = document.createElement("span");
    btnDelete.textContent = "🗑️";
    btnDelete.classList.add("btn-delete");

    btnDelete.onclick = async () => {
      const confirmar = confirm(
        `Excluir o aluno "${aluno.nome}"?\n\n⚠️ Isso também apagará a presença dele.`
      );

      if (!confirmar) return;

      await excluirAluno(aluno.id);
      carregarAlunos();
    };

    li.append(nome, btnDelete);
    lista.appendChild(li);
  });
}

async function excluirAluno(alunoId) {
  await supaBase.from("presenca").delete().eq("aluno_id", alunoId);

  const { error } = await supaBase.from("alunos").delete().eq("id", alunoId);

  if (error) {
    alert("Erro ao excluir aluno");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;

  await supaBase.from("alunos").insert({ nome });
  form.reset();
  carregarAlunos();
});

carregarAlunos();
