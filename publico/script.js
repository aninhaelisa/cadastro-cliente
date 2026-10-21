//menu
const botao = document.getElementById("botao");
const lista = document.getElementById("lista");

botao.addEventListener("click", () => {
    lista.classList.toggle("aberta");
    botao.classList.toggle("ativo");

    const aberto = lista.classList.contains("aberta");

    botao.setAttribute("aria-expanded", aberto);
    botao.setAttribute(
        "aria-label",
        aberto ? "Fechar menu" : "Abrir menu"
    );
});
