const express = require("express");
const router = express.Router();
const mogoose = require("mongoose");
require("../models/usuario");
const Usuario = mogoose.model("usuarios");
const bcrypt = require('bcryptjs'); 
const passport = require('passport');

router.get('/registro', (req, res) => {
    res.render('usuarios/registro'); // Renderize o formulário de registro de usuários.
  });

// ...

router.post("/registro", (req, res) => {
    var erros = [];
  
    if (!req.body.nome || typeof req.body.nome === "undefined" || req.body.nome === null) {
      erros.push({ texto: "Nome inválido" });
    }
    if (!req.body.email || typeof req.body.email === "undefined" || req.body.email === null) {
      erros.push({ texto: "E-mail inválido" });
    }
    if (!req.body.senha || typeof req.body.senha === "undefined" || req.body.senha === null) {
      erros.push({ texto: "Senha inválida" });
    }
    if (req.body.senha.length < 4) {
      erros.push({ texto: "Senha muito curta" });
    }
    if (req.body.senha !== req.body.senha2) {
      erros.push({ texto: "As senhas são diferentes, tente novamente" });
    }
  
    if (erros.length > 0) {
      res.render("usuarios/registro", { erros: erros });
    } else {
      // Se não houver erros, você pode criar um novo usuário e salvá-lo no banco de dados.
      Usuario.findOne({ email: req.body.email }).then((usuario) => {
        if (usuario) {
            req.flash("error_msg", "Já existe um usuário com esse e-mail no nosso sistema");
            res.redirect("/registro");
        } else {
            const novoUsuario = new Usuario({
                nome: req.body.nome,
                email: req.body.email,
                senha: req.body.senha,
                eAdmin: 1
            });
    
            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                    if (erro) {
                        req.flash("error_msg", "Houve um erro durante o salvamento do usuário");
                        res.redirect("/");
                    }
                    novoUsuario.senha = hash;
                    novoUsuario.save().then(() => {
                        req.flash("success_msg", "Usuário cadastrado com sucesso");
                        res.redirect("/");
                    }).catch((err) => {
                        req.flash("error_msg", "Houve um erro ao cadastrar usuário");
                        res.redirect("/usuarios/registro");
                    });
                });
            });
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/");
    });
    }
  });

  router.get("/login", (req, res)=>{
    res.render("usuarios/login")
  })

  router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/", // Redirecionar para a página principal após o login bem-sucedido
      failureRedirect: "/usuarios/login", // Redirecionar para a página de login em caso de falha
      failureFlash: true
    })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
      if (err) {
          // Lida com erros, se houver, durante o logout
          console.error(err);
          return next(err);
      }
      req.flash("success_msg", "Logout feito com sucesso");
      res.redirect("/");
  });
});


module.exports = router;
