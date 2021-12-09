const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        conn.query({
            sql: 'SELECT * FROM produtos',
        }, (error, result, fields) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null
                });
            }
            const response = {
                quantidade: result.length,
                produtos: result.map(produto => {
                    return {
                        id: produto.id_produto,
                        nome: produto.nome,
                        preco: produto.preco,
                        request: {
                            tipo:'GET',
                            decricao:'Todos os produtos',
                            url:'http://localhost:3000/produtos/'+produto.id_produto
                        }
                    }
                })
            }


            res.status(200).send({
                response: response
            });
        });
    });
});

router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error != null) {
            return res.status(500).send({
                error: error,
                response: null
            });
        }
        conn.query({
            sql: 'INSERT INTO produtos (nome, preco) VALUES (?,?)',
            values: [req.body.nome, req.body.preco],
        }, (error, result, field) => {
            conn.release();
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null
                });
            }
            res.status(201).send({
                mensagem: 'Produto criado com sucesso',
                id: result.insertId
            });
        }

        );
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    mysql.getConnection((error, conn) => {
        conn.query({
            sql: 'SELECT * FROM produtos WHERE id_produto=?',
            values: [id]
        }, (error, result, fields) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null
                });
            }
            res.status(200).send({
                response: result
            });
        });
    });
});

router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error != null) {
            return res.status(500).send({
                error: error,
                response: null
            });
        }
        conn.query({
            sql: 'UPDATE produtos  SET nome =?, preco =? WHERE id_produto=?',
            values: [req.body.nome, req.body.preco, req.body.id],
        }, (error, result, field) => {
            conn.release();
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null
                });
            }
            res.status(202).send({
                mensagem: 'Produto atualizado com sucesso',
            });
        }

        );
    });
});

router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error != null) {
            return res.status(500).send({
                error: error,
                response: null
            });
        }
        conn.query({
            sql: 'DELETE FROM produtos WHERE id_produto=?',
            values: [req.body.id],
        }, (error, result, field) => {
            conn.release();
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null
                });
            }
            res.status(202).send({
                mensagem: 'Produto deletado com sucesso',
            });
        }

        );
    });
});
module.exports = router