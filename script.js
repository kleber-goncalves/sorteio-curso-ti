(() => {
  const elPalco = document.querySelector(".palco");
  const elResultado = document.getElementById("resultado");
  const elMinimo = document.getElementById("minimo");
  const elMaximo = document.getElementById("maximo");
  const botaoComecar = document.getElementById("comecar");
  const botaoParar = document.getElementById("parar");
  const botaoResetar = document.getElementById("resetar");
  const elDica = document.getElementById("dica");
  const elCartaoResultado = document.querySelector(".cartao-resultado");

  const mediaMovimentoReduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  let idIntervalo = null;
  let estaRodando = false;

  function definirDica(mensagem = "", tipo = "") {
    elDica.textContent = mensagem;
    if (tipo) elDica.dataset.tipo = tipo;
    else delete elDica.dataset.tipo;
  }

  function parsearInteiro(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return null;
    return Math.trunc(numero);
  }

  function lerIntervalo() {
    const minimo = parsearInteiro(elMinimo.value);
    const maximo = parsearInteiro(elMaximo.value);

    if (minimo === null || maximo === null) {
      return { ok: false, mensagem: "Preencha MÍN e MÁX com números inteiros." };
    }

    if (minimo > maximo) {
      return { ok: false, mensagem: "MÍN precisa ser menor ou igual a MÁX." };
    }

    if (minimo === maximo) {
      return { ok: false, mensagem: "MÍN e MÁX não podem ser iguais." };
    }

    return { ok: true, minimo, maximo };
  }

  function inteiroAleatorioInclusivo(minimo, maximo) {
    const amplitude = maximo - minimo + 1;
    if (amplitude <= 0) throw new Error("Intervalo inválido");

    const cripto = window.crypto ?? window.msCrypto;
    if (!cripto?.getRandomValues) {
      return minimo + Math.floor(Math.random() * amplitude);
    }

    const maxUint32MaisUm = 2 ** 32;
    const limite = Math.floor(maxUint32MaisUm / amplitude) * amplitude;
    const bufferUint32 = new Uint32Array(1);
    let valor = 0;
    do {
      cripto.getRandomValues(bufferUint32);
      valor = bufferUint32[0];
    } while (valor >= limite);

    return minimo + (valor % amplitude);
  }

  function definirRodando(proximoRodando) {
    estaRodando = proximoRodando;
    elPalco.classList.toggle("esta-rodando", estaRodando);
    botaoComecar.disabled = estaRodando;
    botaoParar.disabled = !estaRodando;
  }

  function limparGiro() {
    if (idIntervalo !== null) {
      window.clearInterval(idIntervalo);
      idIntervalo = null;
    }
    elResultado.classList.remove("esta-rolando");
  }

  function destacarCartao() {
    elCartaoResultado.classList.remove("esta-pop");
    void elCartaoResultado.offsetHeight;
    elCartaoResultado.classList.add("esta-pop");
  }

  function comecar() {
    const intervalo = lerIntervalo();
    if (!intervalo.ok) {
      definirDica(intervalo.mensagem, "erro");
      return;
    }

    definirDica("");

    if (mediaMovimentoReduzido?.matches) {
      const numeroFinal = inteiroAleatorioInclusivo(intervalo.minimo, intervalo.maximo);
      elResultado.textContent = String(numeroFinal);
      destacarCartao();
      definirDica(`Resultado: ${numeroFinal}`);
      return;
    }

    limparGiro();
    definirRodando(true);
    elResultado.classList.add("esta-rolando");

    idIntervalo = window.setInterval(() => {
      const intervaloAtual = lerIntervalo();
      if (!intervaloAtual.ok) return;
      elResultado.textContent = String(
        inteiroAleatorioInclusivo(intervaloAtual.minimo, intervaloAtual.maximo),
      );
    }, 55);
  }

  function parar() {
    if (!estaRodando) return;

    const intervalo = lerIntervalo();
    if (!intervalo.ok) {
      limparGiro();
      definirRodando(false);
      definirDica(intervalo.mensagem, "erro");
      return;
    }

    limparGiro();
    const numeroFinal = inteiroAleatorioInclusivo(intervalo.minimo, intervalo.maximo);
    elResultado.textContent = String(numeroFinal);
    definirRodando(false);
    destacarCartao();
    definirDica(`Resultado: ${numeroFinal}`);
  }

  function resetar() {
    limparGiro();
    definirRodando(false);
    elMinimo.value = "1";
    elMaximo.value = "100";
    elResultado.textContent = "?";
    definirDica("");
  }

  botaoComecar.addEventListener("click", comecar);
  botaoParar.addEventListener("click", parar);
  botaoResetar.addEventListener("click", resetar);

  function validarEntradas() {
    if (estaRodando) return;
    const intervalo = lerIntervalo();
    if (!intervalo.ok) definirDica(intervalo.mensagem, "erro");
    else definirDica("");
  }

  elMinimo.addEventListener("input", validarEntradas);
  elMaximo.addEventListener("input", validarEntradas);

  window.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" && !evento.repeat) {
      if (estaRodando) parar();
      else comecar();
    }
    if (evento.key === "Escape") resetar();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && estaRodando) parar();
  });
})();
