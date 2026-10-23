async function listarClientes() {
    const corpoTabela = document.getElementById('lista-clientes');
    const mensagem = document.getElementById('mensagem');

    try {
        const resposta = await fetch('/clientes');

        if (!resposta.ok) {
            throw new Error('Não foi possível buscar os clientes.');
        }

        const clientes = await resposta.json();

        corpoTabela.replaceChildren();

        if (clientes.length === 0) {
            mensagem.textContent = 'Nenhum cliente cadastrado.';
            return;
        }

        clientes.forEach(cliente => {
            const linha = document.createElement('tr');

            const campos = [
                'id', 'nome', 'email', 'telefone', 'cpf',
                'data_cadastro', 'cep', 'rua', 'numero',
                'complemento', 'bairro', 'cidade', 'estado'
            ];

            campos.forEach(campo => {
                const celula = document.createElement('td');

                let valor = cliente[campo];

                if (campo === 'data_cadastro' && valor) {
                    valor = String(valor).slice(0, 10);
                }

                celula.textContent = valor ?? '';
                linha.appendChild(celula);
            });

            corpoTabela.appendChild(linha);
        });

        mensagem.textContent =
            `Total de clientes cadastrados: ${clientes.length}`;

    } catch (erro) {
        console.error(erro);
        mensagem.textContent = 'Erro ao carregar os clientes.';
    }
}

listarClientes();