const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const multer = require("multer");
const authMiddleware =require('../middlewares/auth_middleware');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    let data = new Date().toISOString().replace(/:/g, "-") + "-";
    cb(null, data + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.get("/", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    conn.query(
      {
        sql: "SELECT * FROM produtos",
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
          quantidade: result.length,
          produtos: result.map((produto) => {
            return {
              id: produto.id_produto,
              nome: produto.nome,
              preco: produto.preco,
              imagem_produto:produto.imagem_produto,
              request: {
                tipo: "GET",
                decricao: "Todos os produtos",
                url: "http://localhost:3000/produtos/" + produto.id_produto,
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

router.post("/",authMiddleware, upload.single("img"), (req, res, next) => {
  console.log(req.file);
  mysql.getConnection((error, conn) => {
    if (error != null) {
      return res.status(500).send({
        error: error,
        response: null,
      });
    }
    conn.query(
      {
        sql: "INSERT INTO produtos (nome, preco,imagem_produto) VALUES (?,?,?)",
        values: [req.body.nome, req.body.preco,req.file.path],
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
          mensagem: "Produto criado com sucesso",
          produto: {
            id: result.insertId,
            nome: req.body.nome,
            preco: req.body.preco,
            image_url:req.file.path
          },
          request: {
            tipo: "POST",
            decricao: "Todos os produtos",
            url: "http://localhost:3000/produtos/",
          },
        };

        return res.status(201).send({
          response: response,
        });
      }
    );
  });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  mysql.getConnection((error, conn) => {
    conn.query(
      {
        sql: "SELECT * FROM produtos WHERE id_produto=?",
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
            mensagem: "Nenhum produto econtrado",
          });
        }
        const response = {
          produto: {
            id: result[0].id_produto,
            nome: result[0].nome,
            preco: result[0].preco,
            image_produto: result[0].imagem_produto,
          },
          request: {
            tipo: "GET",
            decricao: "Todos os produtos",
            url: "http://localhost:3000/produtos/",
          },
        };
        return res.status(200).send({
          response: response,
        });
      }
    );
  });
});

router.patch("/", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error != null) {
      return res.status(500).send({
        error: error,
        response: null,
      });
    }
    conn.query(
      {
        sql: "UPDATE produtos  SET nome =?, preco =? WHERE id_produto=?",
        values: [req.body.nome, req.body.preco, req.body.id],
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
          mensagem: "Produto atualizado com sucesso",
          produto: {
            id: req.body.id,
            nome: req.body.nome,
            preco: req.body.preco,
          },
          request: {
            tipo: "PATCH",
            decricao: "Todos os produtos",
            url: "http://localhost:3000/produtos/" + req.body.id,
          },
        };
        return res.status(202).send({
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
        sql: "DELETE FROM produtos WHERE id_produto=?",
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
