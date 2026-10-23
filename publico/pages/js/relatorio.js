async function carregarRelatorio() {
    const mensagem = document.getElementById('mensagem');
    const corpo = document.getElementById('clientes');

    document.getElementById('gerado-em').textContent =
        'Relatório gerado em: ' +
        new Date().toLocaleString('pt-BR');

    try {
        const resposta = await fetch('/api/relatorio');

        if (!resposta.ok) {
            throw new Error('Falha ao consultar o relatório');
        }

        const dados = await resposta.json();

        document.getElementById('total').textContent =
            dados.resumo.total;

        document.getElementById('hoje').textContent =
            dados.resumo.cadastrados_hoje;

        document.getElementById('mes').textContent =
            dados.resumo.cadastrados_mes;

        corpo.replaceChildren();

        if (dados.clientes.length === 0) {
            mensagem.textContent =
                'Nenhum cliente cadastrado.';
            return;
        }

        dados.clientes.forEach(cliente => {
            const linha = document.createElement('tr');

            const campos = [
                'id',
                'nome',
                'email',
                'telefone',
                'cpf',
                'data_cadastro',
                'cep',
                'rua',
                'numero',
                'complemento',
                'bairro',
                'cidade',
                'estado',
                'criado_em'
            ];

            campos.forEach(campo => {
                const celula = document.createElement('td');
                celula.textContent = cliente[campo] ?? '';
                linha.appendChild(celula);
            });

            const acoes = document.createElement('td');

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.type = 'button';

            btnEditar.addEventListener('click', () => {
                editarCliente(cliente);
            });

            const btnApagar = document.createElement('button');
            btnApagar.textContent = 'Apagar';
            btnApagar.type = 'button';
            btnApagar.style.marginLeft = '8px';

            btnApagar.addEventListener('click', () => {
                excluirCliente(cliente.id);
            });

            acoes.append(btnEditar, btnApagar);
            linha.appendChild(acoes);
            corpo.appendChild(linha);
        });

        mensagem.textContent =
            `Registros encontrados: ${dados.clientes.length}`;

    } catch (erro) {
        console.error(erro);
        mensagem.textContent =
            'Não foi possível carregar o relatório.';
    }
}

async function editarCliente(cliente) {
    const campos = [
        ['nome', 'Nome'],
        ['email', 'E-mail'],
        ['tel', 'Telefone'],
        ['cpf', 'CPF'],
        ['data', 'Data do cadastro'],
        ['cep', 'CEP'],
        ['rua', 'Rua'],
        ['numero', 'Número'],
        ['complemento', 'Complemento'],
        ['bairro', 'Bairro'],
        ['cidade', 'Cidade'],
        ['estado', 'Estado']
    ];

    const dados = {};

    for (const [campo, rotulo] of campos) {
        let chaveCliente = campo;

        if (campo === 'tel') chaveCliente = 'telefone';
        if (campo === 'data') chaveCliente = 'data_cadastro';

        let valorAtual = cliente[chaveCliente] ?? '';

        if (campo === 'data') {
            valorAtual = String(valorAtual).slice(0, 10);
        }

        const novoValor = prompt(
            `Editar ${rotulo}:`,
            valorAtual
        );

        if (novoValor === null) return;

        dados[campo] = novoValor.trim();
    }

    try {
        const resposta = await fetch(`/clientes/${cliente.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem);
        }

        alert('Cliente atualizado com sucesso!');
        carregarRelatorio();

    } catch (erro) {
        console.error(erro);
        alert(erro.message || 'Erro ao editar cliente.');
    }
}

async function excluirCliente(id) {
    const confirmar = confirm(
        'Tem certeza de que deseja excluir este cliente?'
    );

    if (!confirmar) return;

    try {
        const resposta = await fetch(`/clientes/${id}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem);
        }

        alert('Cliente excluído com sucesso!');
        carregarRelatorio();

    } catch (erro) {
        alert(erro.message || 'Erro ao excluir cliente.');
    }
}

carregarRelatorio();