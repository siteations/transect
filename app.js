//-----------ONLY FOR SEEDING!-------------------
//const seed = require('./db/seed.js');

//-----------ALL OTHER-------------------
const Sequelize = require('sequelize');

const express = require('express');
const fs = require('fs');
const Promise = require('bluebird');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

const fsP = Promise.promisify(fs.readFile);


//const port = 3000;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('./public/'));


//-----------ERROR HANDLING-------------------

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use('/', (err, req, res, next) =>{
    console.log(err);
    var error={
        'message': err.message,
        'status':err.status,
        'stack':err.stack,
    }
    res.send(error);
    //res.render('error.html', {error:error});
});

//-----------NO DATABASE & CONNECTION SYNC-------------------


	app.listen(process.env.PORT || 3000, function(){
      console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


