'use strict'

var debug = require('debug')
var compression = require('compression')
var express = require('express')
var morgan = require('morgan')
var config = require(__dirname + '/config.js')

var app = express()

app.set('view engine', 'jade')
app.set('views', __dirname + '/views')
app.set('config', config)
app.set('baseDir', __dirname)
debug(config)

// compress all requests
app.use(compression())

// logging
app.use(morgan('API/v1 :url'))

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Cache-Control", "public,max-age=604800") //one week
  next()
})

/* Add routes */
// API
var apiv1 = require(__dirname + '/routes/apiv1.js')
app.use('/v1', apiv1)

// Docs
var reverseMapFromMap = function(map, f) {  //reverse datasets obj
  var identity = function(x) {return x;};
  return Object.keys(map).reduce(function(acc, k) {
    acc[map[k]] = (acc[map[k]] || []).concat((f || identity)(k))
    return acc
  },{})
}

app.get('/', function(req, res) {
  res.render('doc', { pageData: {
  	  modules: Object.keys(config.modules),
      modulesettings: config.modules,
  	  datasets: config.datasets,
  	  datasetAliases: reverseMapFromMap(config.datasetAliases),
      languageFallbacks: config.languageFallbacks
    }
  })
})

// Errors
app.use(function(req, res, next) {
  res.status(404).send('Sorry, can\'t find that!')
})

//Start server
var server = app.listen(process.env.PORT || 3000, function() {

  var host = server.address().address
  var port = server.address().port

  console.log('Thenmap API listening at http://%s:%s', host, port)

})