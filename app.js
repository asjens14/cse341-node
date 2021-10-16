const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')

const errorController = require('./controllers/error')
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('61691bd6a51489d6b9d74ab6')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

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
  User.findOne().then(user => {
    if (!user) {
      const user = new User({
        name: 'Sheldon',
        email: 'example@example.com',
        cart: {
          items: []
        }
      });
      user.save();
    }
  });
  app.listen(process.env.PORT || 3000);
})
.catch(err => {
  console.log(err);
});

