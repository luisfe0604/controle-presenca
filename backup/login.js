const form = document.getElementById("loginForm");
const erro = document.getElementById("erro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supaBase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    erro.textContent = error.message;
  } else {
    window.location.href = "index.html";
  }
});
