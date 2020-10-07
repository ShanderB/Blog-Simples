const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Model
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function (passport) {                            //Vai pegar no "login.handlebars" o campo "email" e "senha". Lá ele puxa a tag "name"
    passport.use(new localStrategy({ usernameField: "email", passwordField: "senha" }, (email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {
            if (!usuario) {
                return done(null, false, { message: "Conta Inexistente" });
            }
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if (batem) {
                    return done(null, usuario);
                } else {
                    return done(null, false, { message: "senha incorreta" });
                }
            })
        })
    }))
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario);
        })
    })
}