const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
require('express-validator');

const app = express();

// helpers
const helpers = require('./helpers');

// connecting to database
const db = require('./config/bd');
db.sync()
  .then(() => console.log('Database connected'));
  .catch(error => console.log(error));


// importing models
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

// importing routes
const routes = require('./routes/index');

// setting
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(flash());
app.use(cookieParser());
app.use(session({
  secret: 'supersecreto',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// middelweares
app.use((req, res, next) =>{
  res.locals.vardump = helpers.vardomp;
  res.locals.mensajes = req.flash();
  res.locals.usuario = {...req.user} || null;
  next();
});
//routes
app.use('/', routes);

const host = process.env.HOST || '0.0.0.0';

// starting server
app.listen(app.get('port'), host, () => {
  console.log(`Server on port ${app.get('port')}`);
});

