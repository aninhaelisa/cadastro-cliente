const PORT = 3000;
app.use(express.json());
app.use(express.static('public'));
app.get('/api', (req, res) => {
    res.json({
        mensagem: 'API de clientes funcionando!'
    });
});
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});