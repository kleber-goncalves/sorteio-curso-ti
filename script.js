(() => {
		    const conteiner = document.querySelector(".container");
		    if (!conteiner) {
		        throw new Error(
		            "Elemento raiz nao encontrado. Verifique se existe .container no HTML.",
		        );
		    }
		    const resultado = document.getElementById("resultado");
		    const inputMinimo = document.getElementById("minimo");
		    const inputMaximo = document.getElementById("maximo");
	    const botaoComecar = document.getElementById("comecar");
	    const botaoParar = document.getElementById("parar");
	    const botaoResetar = document.getElementById("resetar");
	    const dica = document.getElementById("dica");
	    const cartaoResultado = document.querySelector(".cartao-resultado");

    const mediaMovimentoReduzido = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
    );

    let idIntervalo = null;
    let estaRodando = false;

    function definirDica(mensagem = "", tipo = "") {
        dica.textContent = mensagem;
        if (tipo) dica.dataset.tipo = tipo;
        else delete dica.dataset.tipo;
    }

    function parsearInteiro(valor) {
        const numero = Number(valor);
        if (!Number.isFinite(numero)) return null;
        return Math.trunc(numero);
    }

	    function lerIntervalo() {
	        const valorMinimo = parsearInteiro(inputMinimo.value);
	        const valorMaximo = parsearInteiro(inputMaximo.value);

	        if (valorMinimo === null || valorMaximo === null) {
	            return {
	                ok: false,
	                mensagem: "Preencha MÍN e MÁX com números inteiros.",
	            };
	        }

	        if (valorMinimo > valorMaximo) {
	            return {
	                ok: false,
	                mensagem: "MÍN precisa ser menor ou igual a MÁX.",
	            };
	        }

	        if (valorMinimo === valorMaximo) {
	            return { ok: false, mensagem: "MÍN e MÁX não podem ser iguais." };
	        }

	        return { ok: true, minimo: valorMinimo, maximo: valorMaximo };
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
        conteiner.classList.toggle("esta-rodando", estaRodando);
        botaoComecar.disabled = estaRodando;
        botaoParar.disabled = !estaRodando;
    }

    function limparGiro() {
        if (idIntervalo !== null) {
            window.clearInterval(idIntervalo);
            idIntervalo = null;
        }
        resultado.classList.remove("esta-rolando");
    }

    function destacarCartao() {
        cartaoResultado.classList.remove("esta-pop");
        void cartaoResultado.offsetHeight;
        cartaoResultado.classList.add("esta-pop");
    }


    function comecar() {
        const intervalo = lerIntervalo();
        if (!intervalo.ok) {
            definirDica(intervalo.mensagem, "erro");
            return;
        }

        definirDica("");

        if (mediaMovimentoReduzido?.matches) {
            const numeroFinal = inteiroAleatorioInclusivo(
                intervalo.minimo,
                intervalo.maximo,
            );
            resultado.textContent = String(numeroFinal);
            destacarCartao();
            definirDica(`Resultado: ${numeroFinal}`);
            return;
        }

        limparGiro();
        definirRodando(true);
        resultado.classList.add("esta-rolando");

        idIntervalo = window.setInterval(() => {
            const intervaloAtual = lerIntervalo();
            if (!intervaloAtual.ok) return;
            resultado.textContent = String(
                inteiroAleatorioInclusivo(
                    intervaloAtual.minimo,
                    intervaloAtual.maximo,
                ),
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
        const numeroFinal = inteiroAleatorioInclusivo(
            intervalo.minimo,
            intervalo.maximo,
        );
        resultado.textContent = String(numeroFinal);
        definirRodando(false);
        destacarCartao();
        definirDica(`Resultado: ${numeroFinal}`);
    }

	    function resetar() {
	        limparGiro();
	        definirRodando(false);
	        inputMinimo.value = "1";
	        inputMaximo.value = "100";
	        resultado.textContent = "?";
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

	    inputMinimo.addEventListener("input", validarEntradas);
	    inputMaximo.addEventListener("input", validarEntradas);

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
