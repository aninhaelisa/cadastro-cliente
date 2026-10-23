require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const mysql = require('mysql2/promise');
app.use(express.urlencoded({ extended: true }));
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
app.use(express.json());
app.use(express.static('publico'));
app.get('/api', (req, res) => {
    res.json({
        mensagem: 'API de clientes funcionando!'
    });
});

app.post('/dados', async (req, res) => {
    try {
        const {
            nome,
            email,
            tel,
            cpf,
            data,
            cep,
            rua,
            numero,
            complemento,
            bairro,
            cidade,
            estado
        } = req.body;

        const sql = `
            INSERT INTO clientes (
                nome, email, telefone, cpf, data_cadastro,
                cep, rua, numero, complemento, bairro, cidade, estado
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(sql, [
            nome,
            email,
            tel,
            cpf,
            data,
            cep,
            rua,
            numero,
            complemento || null,
            bairro,
            cidade,
            estado
        ]);

        res.redirect('/sucesso.html')

    } catch (erro) {
        console.error('Erro ao cadastrar cliente:', erro);
        res.redirect('/erro.html');
    }
});

app.get('/clientes', async (req, res) => {
    try {
        const [clientes] = await db.execute(
            'SELECT * FROM clientes ORDER BY id DESC'
        );

        res.json(clientes);

    } catch (erro) {
        console.error('Erro ao listar clientes:', erro);
        res.status(500).json({
            mensagem: 'Erro ao buscar clientes.'
        });
    }
});


app.get('/api/relatorio', async (req, res) => {
    try {
        const [resumo] = await db.execute(`
            SELECT
                COUNT(*) AS total,
                COALESCE(
                    SUM(DATE(criado_em) = CURDATE()), 0
                ) AS cadastrados_hoje,
                COALESCE(
                    SUM(
                        YEAR(criado_em) = YEAR(CURDATE())
                        AND MONTH(criado_em) = MONTH(CURDATE())
                    ), 0
                ) AS cadastrados_mes
            FROM clientes
        `);

        const [clientes] = await db.execute(`
            SELECT
                id, nome, email, telefone, cpf, data_cadastro,
                cep, rua, numero, complemento, bairro, cidade,
                estado,
                DATE_FORMAT(criado_em, '%d/%m/%Y %H:%i') AS criado_em
            FROM clientes
            ORDER BY id DESC
        `);

        res.json({
            resumo: resumo[0],
            clientes
        });

    } catch (erro) {
        console.error('Erro ao gerar relatório:', erro);

        res.status(500).json({
            mensagem: 'Erro ao gerar relatório.'
        });
    }
});

app.put('/clientes/:id', async (req, res) => {
    try {
        const {
            nome, email, tel, cpf, data, cep, rua,
            numero, complemento, bairro, cidade, estado
        } = req.body;

        const [resultado] = await db.execute(`
            UPDATE clientes SET
                nome = ?, email = ?, telefone = ?, cpf = ?,
                data_cadastro = ?, cep = ?, rua = ?, numero = ?,
                complemento = ?, bairro = ?, cidade = ?, estado = ?
            WHERE id = ?
        `, [
            nome, email, tel, cpf, data, cep, rua,
            numero, complemento || null, bairro, cidade, estado,
            req.params.id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado.'
            });
        }

        res.json({ mensagem: 'Cliente atualizado com sucesso!' });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao atualizar cliente.'
        });
    }
});

app.delete('/clientes/:id', async (req, res) => {
    try {
        const [resultado] = await db.execute(
            'DELETE FROM clientes WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado.'
            });
        }

        res.json({ mensagem: 'Cliente excluído com sucesso!' });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao excluir cliente.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

db.getConnection()
    .then(conexao => {
        console.log('MySQL conectado com sucesso!');
        conexao.release();
    })
    .catch(erro => {
        console.error('Erro ao conectar ao MySQL:', erro.message);
    });