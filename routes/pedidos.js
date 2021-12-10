const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;

router.get("/", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    conn.query(
      {
        sql: `SELECT pedidos.id_pedido,
        pedidos.quantidade,
        produtos.nome,
        produtos.preco,
        produtos.id_produto 
        FROM pedidos INNER JOIN produtos ON produtos.id_produto = pedidos.id_produto`,
      },
      (error, result, fields) => {
        conn.release();
        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        const response = {
          pedidos: result.map((pedido) => {
            return {
              id: pedido.id_pedido,
              qtd: pedido.quantidade,
              produto: {
                id_produto: pedido.id_produto,
                nome: pedido.nome,
                preco:pedido.preco
              },
              request: {
                tipo: "GET",
                decricao: "Detalhes pedido",
                url: "http://localhost:3000/pedidos/" + pedido.id_pedido,
              },
            };
          }),
        };

        return res.status(200).send({
          response: response,
        });
      }
    );
  });
});

router.post("/", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    conn.query(
      {
        sql: "SELECT * FROM produtos WHERE id_produto=?",
        values: [req.body.id_produto],
      },
      (error, result, fields) => {
        if (result.length == 0) {
          return res.status(404).send({
            mensagem: "Nenhum produto econtrado",
          });
        }
        conn.query(
          {
            sql: "INSERT INTO pedidos (id_produto,quantidade) VALUES (?,?)",
            values: [req.body.id_produto, req.body.quantidade],
          },
          (error, result, field) => {
            conn.release();
            if (error) {
              return res.status(500).send({
                error: error,
                response: null,
              });
            }
            const response = {
              mensagem: "Pedido criado com sucesso",
              produto: {
                id_pedido: result.insertId,
                id_produto: req.body.id_produto,
                quantidade: req.body.quantidade,
              },
              request: {
                tipo: "POST",
                decricao: "Retorna todos os pedidos",
                url: "http://localhost:3000/pedidos/",
              },
            };
            return res.status(201).send({
              response: response,
            });
          }
        );
      }
    );
  });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  mysql.getConnection((error, conn) => {
    conn.query(
      {
        sql: "SELECT * FROM pedidos WHERE id_pedido=?",
        values: [id],
      },
      (error, result, fields) => {
        conn.release();
        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        if (result.length == 0) {
          return res.status(404).send({
            mensagem: "Nenhum pedido econtrado",
          });
        }
        const response = {
          produto: {
            id: result[0].id_pedido,
            id_produto: result[0].id_produto,
            quantidade: result[0].quantidade,
          },
          request: {
            tipo: "GET",
            decricao: "Todos os produtos",
            url: "http://localhost:3000/pedidos/",
          },
        };
        return res.status(200).send({
          response: response,
        });
      }
    );
  });
});

router.delete("/", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error != null) {
      return res.status(500).send({
        error: error,
        response: null,
      });
    }
    conn.query(
      {
        sql: "DELETE FROM pedidos WHERE id_pedido=?",
        values: [req.body.id],
      },
      (error, result, field) => {
        conn.release();
        if (error) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        const response = {
          mensagem: "Produto excluido",
          produto: {
            id: req.body.id,
          },
          request: {
            tipo: "DELETE",
          },
        };
        return res.status(202).send({
          mensagem: response,
        });
      }
    );
  });
});
module.exports = router;
