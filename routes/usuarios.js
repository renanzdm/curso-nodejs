const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/cadastro", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error != null) {
      return res.status(500).send({
        error: error,
        response: null,
      });
    }
    conn.query(
      {
        sql: "SELECT email FROM usuarios WHERE email=?",
        values: [req.body.email],
      },
      (error, results) => {
        if (error != null) {
          return res.status(500).send({
            error: error,
            response: null,
          });
        }
        if (results.length > 0) {
          return res
            .status(401)
            .send({ mensagem: "Usuario ja esta cadatrado" });
        }
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
          if (errBcrypt) {
            return res.status(500).send({ erro: errBcrypt });
          }
          conn.query(
            {
              sql: "INSERT INTO usuarios (email, senha) VALUES (?,?)",
              values: [req.body.email, hash],
            },
            (error, result, field) => {
              conn.release();
              if (error) {
                return res.status(500).send({
                  error: error,
                  response: null,
                });
              }
              return res.status(201).send({
                mensagem: "Usuario criado com sucesso",
                usuario: {
                  email: req.body.email,
                  id: result.insertId,
                },
              });
            }
          );
        });
      }
    );
  });
});
router.post("/login", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ erro: error });
    }
    const query = "SELECT * FROM usuarios WHERE email =?";
    conn.query(
      {
        sql: query,
        values: [req.body.email],
      },
      (error, results) => {
        if (error) {
          return res.status(500).send({ erro: error });
        }
        if (results.length < 1) {
          return res.status(401).send({ mensagem: "Falha na autenticacao" });
        }
        bcrypt.compare(req.body.senha, results[0].senha, (error, result) => {
          if (error) {
            return res.status(401).send({ mensagem: "Falha na autenticacao" });
          }
          if (result) {
            const token = jwt.sign(
              {
                id_usuario: results[0].id_usuario,
                email: results[0].email,
              },
              process.env.JWT_KEY,
              { expiresIn: "1h" }
            );
            return res.status(200).send({ mensagem: "Autentico com sucesso" ,token:token});
          }
          return res.status(401).send({ mensagem: "Falha autenticacao" });
        });
      }
    );
  });
});

module.exports = router;
