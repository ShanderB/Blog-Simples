const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");




router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
})

router.post("/registro", (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome Inválido" });
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email Inválido" });
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha Inválido" });
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta" });
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "Senhas não conferem" });
    }

    if (req.body.eAdmin != 0) {
        if (req.body.eAdmin != 1){
            erros.push({ texto: "Campo 'eAdmin' não confere." });
        }
    }

    if (erros.length > 0) {
        res.render("/usuarios/registro", { erros: erros })
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe email cadastrado.");
                res.redirect("/usuarios/registro")
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    senha: req.body.senha,
                    email: req.body.email,
                    eAdmin: req.body.eAdmin

                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Erro ao gerar o hash. (usuario.js - linha 50)");
                            res.redirect("/usuarios/registro");
                        }

                        novoUsuario.senha = hash;
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Salvo com sucesso.");
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao salvar o usuário. (usuario.js - linha 58)");
                            res.redirect("/usuarios/registro")
                        })
                    })
                })



            }
        }).catch((err) => {
            req.flash("error_msg", "Erro Interno (usuario.js - linha 45)")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("usuarios/login");
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success_msg", "Deslogado");
    res.redirect("/");
})

module.exports = router;