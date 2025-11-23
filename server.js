const express = require('express')
const cors = require('cors')
const { readdirSync } = require('fs')
const csurf = require('csurf')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const path = require('path')
const morgan = require('morgan');
require('dotenv').config();


/*const URI = 'amqp://rabbitmq:pN4gUSWb1@queue'
var amqp = require('amqplib/callback_api')*/

const csurfProtection = csurf({ cookie: true });

const app = express();

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

//db
mongoose.connect(process.env.DATABASE_LOCAL, {

}).then(() => console.log('DB CONNECTED'))
  .catch((err) => console.log(err))

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

readdirSync('./routes').map((r) =>
  app.use('/api', require(`./routes/${r}`))
);

app.use(csurfProtection);

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
});
app.get('/', (req, res) => {
  res.send({message: 'API Available', status: 200})
});

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server running on port ${port}`));
