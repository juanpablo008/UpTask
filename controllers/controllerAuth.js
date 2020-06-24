const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/iniciar-sesion',
  failureFlash : true,
  badRequestMessage: 'Ambos Campos son Obligatorios'
});


// Funcion para revisar si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => {

  // Si esta autenticado sigue al siguiente middelweare
  if(req.isAuthenticated()){
    return next();
  }
  // Si no lo redirije a iniciar sesión
  return res.redirect('/iniciar-sesion');

};

// Función para cerrar sesion
exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/iniciar-sesion');
  })
};

// Genera un token si el usuario es valido 
exports.enviarToken = async (req, res) => {
  // Verificar que el usuario exista 
  const { email } = req.body;

  console.log(email);
  const usuario = await Usuarios.findOne({where: { email }});

  // Si no existe el usuario
  if(!usuario){
    req.flash('error', 'No existe esa cuenta');
    res.redirect('/reestablecer');
  }
 
  // El usuario existe
  usuario.token = crypto.randomBytes(20).toString('hex');
  usuario.expiracion = Date.now() + 3600000;

  // Guardar en la base de datos
  await usuario.save();

  // Url reset
  const resetUrl = `https://${req.headers.host}/reestablecer/${usuario.token}`;

  // Envía el correo con el token
  await enviarEmail.enviar({
    usuario,
    subject: 'Password Reset',
    resetUrl,
    archivo : 'reestablecer-password'
  });

  req.flash('correcto', 'Se envió un mensaje a tu correo');
  res.redirect('/iniciar-sesion');
};

exports.validarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token
    }
  });

  if(!usuario){
    req.flash('error', 'No Válido');
    res.redirect('/reestablecer');
  }

  // Formulario para generar el password
  res.render('resetPassword',{
    nombrePagina: 'Reestablecer Contraseña'
  });
};

exports.actualizarPassword = async (req, res) => {

  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token,
      expiracion: {
          [Op.gte] : Date.now()
      }
    }
  });

  if(!usuario){
    req.flash('error', 'No Válido');
    res.redirect('/reestablecer');
  }

  

  usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  usuario.token = null;
  usuario.expiracion = null;

  await usuario.save();

  req.flash('Correcto', 'Tu password se ha modificado correctamente');
  res.redirect('/iniciar-sesion');

};