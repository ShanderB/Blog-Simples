const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Model
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: "email"}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message: "Conta Inexistente"});
            }
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem){
                    return done(null, user);
                } else {
                    return done(null, false, {message: "senha incorreta"});
                }
            })
        })
    }))
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, usuario) => {
            done(err, usuario);
        })
    })
}