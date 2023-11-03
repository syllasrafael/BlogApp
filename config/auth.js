const mongoose = require("mongoose");
const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt");
const Bcrypt = require("bcryptjs");
const passport = require('passport');


//Model de usuario
require("../models/usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function(passport){


    passport.use(new localStrategy(
        { usernameField: 'email', 
          passwordField: 'senha'
        }, 
        (email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuarios) => {
            if (!usuarios) {
                return done(null, false, { message: "Essa conta não existe" });
            }
    
            bcrypt.compare(senha, usuarios.senha, (erro, batem) => {
                if (batem) {
                    return done(null, usuarios ,{message:"Login feito com sucesso"})
                } else {
                    return done(null, false, { message: "Senha incorreta" })
                }
            });
        });
    }));
    
    
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
      });
      
      passport.deserializeUser((id, done) => {
        Usuario.findById(id)
          .then(usuario => {
            done(null, usuario);
          })
          .catch(err => {
            done(err, null);
          });
      });
      
    
    

}