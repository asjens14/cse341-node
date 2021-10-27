const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
require('dotenv').config();


const errorController = require('./controllers/error')
const User = require('./models/user');

const MONGODB_URI = process.env.DB_URI;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { nextTick } = require('process');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    store: store
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    if (!user){
      return next();
    }
    req.user = user;
    next();
  })
  .catch(err => {
    next(new Error(err));
  });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500)

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.redirect('/500');
});

const corsOptions = {
    origin: "https://stormy-ridge-24312.herokuapp.com/",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    family: 4
};

const MONGODB_URL = process.env.MONGODB_URL || process.env.DB_URI;

mongoose.connect(MONGODB_URL, options)
.then(result => {  
  app.listen(process.env.PORT || 3000);
})
.catch(err => {
  console.log(err);
});