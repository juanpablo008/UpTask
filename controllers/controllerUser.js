const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

const controller = {};

controller.formCrearCuenta = (req, res) => {
  res.render('crearCuenta', {
    nombrePagina : 'Crear Cuenta en UpTask'
  });
};

controller.formIniciarSesion = (req, res) => {
  const { error } = res.locals.mensajes;
  res.render('iniciarSesion', {
    nombrePagina : 'Iniciar Sesión en UpTask',
    error
  });
};

controller.crearCuenta = async (req, res, next) => {
  // Leer los datos
  const { email, password } = req.body;

  try {
    // Crear el usuario
    await Usuarios.create({
      email,
      password
    });

    // Crear una URL de confirmación
    const confirmarUrl = `https://${req.headers.host}/confirmar/${email}`;

    // Crear el objeto de usuario
    const usuario = {
      email
    };

    // Enviar email
    await enviarEmail.enviar({
      usuario,
      subject: 'Confirma tu cuenta UpTask',
      confirmarUrl,
      archivo : 'confirmar-cuenta'
    });

    // Redirigir al usuario
    req.flash('correcto', 'Enviamos un correo, confirma tu cuenta');
    res.redirect('/iniciar-sesion');

  } catch (error) {
    req.flash('error', error.errors.map(error => error.message));
    res.render('crearCuenta', {
      mensajes: req.flash(),
      nombrePagina : 'Crear Cuenta en UpTask',
      email,
      password
    });
  }

};

controller.formReestablecerPassword = (req, res) => {
  res.render('reestablecer', {
    nombrePagina: 'Reestablecer Contraseña'
  })
}

controller.confirmarCuenta = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      email: req.params.correo
    }
  });

  if (!usuario) {
    req.flash('error', 'No válido');
    res.redirect('/crear-cuenta');
  }

  usuario.activo = 1;
  await usuario.save();

  req.flash('correcto', 'Cuenta confirmada');
  res.redirect('/iniciar-sesion');

}

module.exports = controller;