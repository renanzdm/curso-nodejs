const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Test get dentro de rota de produtos pedidos'
    });
});


router.post('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Test rota post dentro da rota de produtos'
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    res.status(200).send({
        mensagem: 'Test get dentro de rota de produtos pedidos em ',
        id: id
    });
});


router.delete('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Test get dentro de rota de produtos pedidos em DELETE',
    });
});
module.exports = router