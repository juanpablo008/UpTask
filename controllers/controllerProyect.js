const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

const controller = {};

controller.home = async (req, res) => {
  const usuarioId = res.locals.usuario.id;
  const proyectos = await Proyectos.findAll({where: { usuarioId }});
  res.render('index',{
    nombrePagina: 'Proyectos',
    proyectos
  });
};

controller.formularioProyecto = async (req, res) => {
  const usuarioId = res.locals.usuario.id;
  const proyectos = await Proyectos.findAll({where: { usuarioId }});

  res.render('nuevoProyecto', {
    nombrePagina: 'Nuevo Proyecto',
    proyectos
  });
};

controller.nuevoProyecto = async (req, res) => {
  
  const usuarioId = res.locals.usuario.id;
  const proyectos = await Proyectos.findAll({where: { usuarioId }});

  const {nombre} = req.body.nombre;
  let errors = [];


  if (!nombre) {
    errors.push({'texto': 'Agrega un nombre al proyecto'});
  }
  
  if(errors.length > 0){
    res.render('nuevoProyecto', {
      nombrePagina: 'Nuevo Proyecto',
      errors,
      proyectos
    });
  }
  else{
    //insert into data base
    const usuarioId = res.locals.usuario.id;
    await Proyectos.create({ nombre, usuarioId });
    res.redirect('/');
  }
};

controller.proyectoPorUrl = async (req, res) => {
  const usuarioId = res.locals.usuario.id;
  const proyectosPromise = Proyectos.findAll({where: { usuarioId }});

  const proyectoPromise = Proyectos.findOne({
    where: {
      url: req.params.url,
      usuarioId
    }
  });

  const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

  const tareas = await Tareas.findAll({
    where: {
      proyectoid : proyecto.id
    }
    // include:[
    //   { model: Proyectos }
    // ]
  });

  if(!proyecto) return next();

  res.render('tareas', {
    nombrePagina: 'Tareas del proyecto',
    proyecto,
    proyectos,
    tareas
  });

};

controller.formularioEditar = async (req, res) => {
  const usuarioId = res.locals.usuario.id;
  const proyectosPromise = await Proyectos.findAll({where: { usuarioId }});

  const proyectoPromise = await Proyectos.findOne({
    where: {
      id: req.params.id,
      usuarioId
    }
  });

  const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

  res.render('nuevoProyecto', {
    nombrePagina: 'Editar Proyecto',
    proyectos,
    proyecto
  });
};


controller.actualizarProyecto = async (req, res) => {
  let errors = [];
  const {nombre} = req.body;

  const usuarioId = res.locals.usuario.id;
  const proyectos = await Proyectos.findAll({where: { usuarioId }});

  if (!nombre) {
    errors.push({'texto': 'Agrega un nombre al proyecto'});
  }
  
  if(errors.length > 0){
    res.render('nuevoProyecto', {
      nombrePagina: 'Nuevo Proyecto',
      errors,
      proyectos
    });
  }
  else{
    //insert into data base
    
    await Proyectos.update(
      { nombre: nombre },
      { where: { id: req.params.id } }  
    );
    res.redirect('/');
  }
};

controller.eliminarProyecto = async (req, res) => {
  const {urlProyecto} = req.query;

  const resultado = await Proyectos.destroy({where: {url: urlProyecto}});

  if (!resultado) {
    return next();
  }
  
  res.status(200).send('Proyecto eliminado correctamente');
  
};

module.exports = controller;