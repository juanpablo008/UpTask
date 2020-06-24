const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Referencia al modelo donde vamos a autenticar
const Usuarios = require('../models/Usuarios');

// locar strategy - loguin con credenciales propios
passport.use(
  new LocalStrategy(
    // Por default passpor espera un usuario y password
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const usuario = await Usuarios.findOne({
          where: { 
            email,
            activo: 1
          }
        });
        // El usuario existe, verificamos password
        if (!usuario.verificarPassword(password)) {
          console.log('password incorrecto');
          return done(null, false, {
            message: 'Password Incorrecto'
          })
        }

        // Email y password correctos
        return done(null, usuario)

      } catch (error) {
        //Ese usuario no existe
        return done(null, false, {
          message: 'Esa cuenta no existe o no esta confirmada'
        })
      }
    }
  )
);

// Serializar el usuario
passport.serializeUser((usuario, callback) => {
  callback(null, usuario);
});

// Deserializar el usuario
passport.deserializeUser((usuario, callback) => {
  callback(null, usuario);
});

// Exportar
module.exports = passport;