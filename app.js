const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 9000;
require('dotenv/config');

//==========MIDDELWARES==========
app.use(express.urlencoded({
  extended: true
}));

app.use(function (req, res, next) {
  if (req.accepts(['application/json', 'application/x-www-form-urlencoded'])) {
      next()
  } else {
      res.status(406).send({
          error: "We only accept application/json & application/x-www-form-urlencoded."
      })
  }
})

//==========ALLOW HEADERS X-REQUEST, ALLOW METHODS ETC (SETTINGS) ON DIFFRENT ROUTES==========
app.options('/codes', function(req, res) {
  let headers = {};

  headers['Access-Control-Allow-Origin'] = '*';
  headers['Content-Type'] = 'Content-Type', 'application/json';
  headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
  headers['Allow'] = 'GET, POST, OPTIONS';
  headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  headers['Content-Length'] = '0';
  headers["Access-Control-Max-Age"] = '86400';

  res.writeHead(200, headers);
  res.send();
});

app.options('/codes/:codeId', function(req, res) {
  let headers = {};

  headers['Access-Control-Allow-Origin'] = '*';
  headers['Content-Type'] = 'Content-Type', 'text/html; charset=UTF-8';
  headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';
  headers['Allow'] = 'GET, PUT, DELETE, OPTIONS';
  headers['Access-Control-Allow-Methods'] = 'GET, PUT, DELETE, OPTIONS';
  headers['Content-Length'] = '0';
  headers["Access-Control-Max-Age"] = '86400';
  
  res.writeHead(200, headers);
  res.send();          
})

//==========MIDDLEWARES==========
app.use(bodyParser.json());
app.use(cors());

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

//==========IMPORT ROUTES==========
const codesRoute = require('./routes/codes');
app.use('/codes', codesRoute);

//==========HOME ROUTE==========
app.get('/', (req, res) => res.send('Hello World!'));

//==========CONNECT TO DATABASE WITH STRING==========
mongoose.connect(process.env.DB_CONNECTION, {useNewUrlParser:true,useUnifiedTopology:true},() =>
  console.log('Connected to DB')
);

//==========START LISTINING ON PORTS==========
app.listen(port, () => console.log(`App listening on port ${port}!`));