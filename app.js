const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);


const errorController = require('./controllers/error')
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://Sheldon:frbBAJUJSVCDknhW@cluster0.xk9c0.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'a secret', 
    resave: false, 
    saveUninitialized: false, 
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    req.user = user;
    next();
  })
  .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

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

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://Sheldon:frbBAJUJSVCDknhW@cluster0.xk9c0.mongodb.net/shop?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URL, options)
.then(result => {  
  app.listen(process.env.PORT || 3000);
})
.catch(err => {
  console.log(err);
});