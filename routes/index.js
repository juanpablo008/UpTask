const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');

const controllerProyect = require('../controllers/controllerProyect');
const controllerTasks = require('../controllers/controllerTasks');
const controllerUser = require('../controllers/controllerUser');
const controllerAuth = require('../controllers/controllerAuth');

router.get('/', 
  controllerAuth.usuarioAutenticado,
  controllerProyect.home
  );
router.get('/nuevo-proyecto', 
  controllerAuth.usuarioAutenticado,
  controllerProyect.formularioProyecto
);
router.post('/nuevo-proyecto',
  controllerAuth.usuarioAutenticado,
  body('nombre').not().isEmpty().trim().escape(),
  controllerProyect.nuevoProyecto
);

// listar proyecto 
router.get('/proyectos/:url', 
  controllerAuth.usuarioAutenticado,
  controllerProyect.proyectoPorUrl
);

// Actializar el proyecto
router.get('/proyecto/editar/:id', 
  controllerAuth.usuarioAutenticado,
  controllerProyect.formularioEditar
);

router.post('/nuevo-proyecto/:id',
  controllerAuth.usuarioAutenticado, 
  body('nombre').not().isEmpty().trim().escape(),
  controllerProyect.actualizarProyecto
);

// Eliminar proyecto
router.delete('/proyectos/:url', 
  controllerAuth.usuarioAutenticado,
  controllerProyect.eliminarProyecto
);

// Tareas
router.post('/proyectos/:url', 
  controllerAuth.usuarioAutenticado,
  controllerTasks.agregarTarea
);

// Actualizar tarea
router.patch('/tareas/:id', 
  controllerAuth.usuarioAutenticado,
  controllerTasks.cambiarEstadoTarea
);

// Eliminar tarea
router.delete('/tareas/:id', 
  controllerAuth.usuarioAutenticado,
  controllerTasks.eliminarTarea
);

// Crear cuenta
router.get('/crear-cuenta', controllerUser.formCrearCuenta);
router.post('/crear-cuenta', controllerUser.crearCuenta);
router.get('/confirmar/:correo', controllerUser.confirmarCuenta);

// Iniciar sesión
router.get('/iniciar-sesion', controllerUser.formIniciarSesion);
router.post('/iniciar-sesion', controllerAuth.autenticarUsuario);

// Cerrar sesión
router.get('/cerrar-sesion', controllerAuth.cerrarSesion);

// Reestablecer contraseña
router.get('/reestablecer', controllerUser.formReestablecerPassword);
router.post('/reestablecer', controllerAuth.enviarToken);
router.get('/reestablecer/:token', controllerAuth.validarToken);
router.post('/reestablecer/:token', controllerAuth.actualizarPassword);

module.exports = router;