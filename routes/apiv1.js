var debug = require('debug');
var utils = require('./utils');
var express = require('express');
var router = express.Router();



router.all('/:dataset?/:modules?/:date?', function (req, res, next) {

  res.set({ 'content-type': 'application/json; charset=utf-8' });
  var config = req.app.get('config');

  /* Check if dataset exists or return */
  var dataset = utils.getParam(req.params.dataset, req.query.dataset);
  if (dataset in config.datasetAliases) {
    dataset = config.datasetAliases[dataset];
  }
  if (dataset === undefined){
    res.status(401).send('No valid data specified. Available datasets are: ' + Object.keys(config.datasets).join(', '));
    return;
  }
  if (!(dataset in config.datasets)) {
    res.status(501).send('Sorry, that dataset does not exist (yet!) Available datasets are: ' + Object.keys(config.datasets).join(', '));
    return;
  }

  /* Check that at least one valid module was called */
  var availableModules = Object.keys(config.modules);
  var modules = utils.getParams(req.params.modules, req.query.modules, availableModules);
  var validModules = []
  for (var modulename of modules){
    if (modulename in config.modules){
      validModules.push(modulename);
    }
  }
  if (validModules.length === 0) {
    res.status(401).send('No valid modules specified. Available modules are: ' + availableModules.join(', '));
    return;
  } else {
    modules = validModules;
  }


  var output = {};
  var datasetConfig = config.datasets[dataset];
  var apiParams = {
    dataset: dataset,
    date: utils.getParam( req.params.date, req.query.date, null ),
    version: utils.getParam( req.query.version, datasetConfig.defaultVersion ),
    query: req.query,
    config: config,
    res: res
  };
  debug(apiParams);

  /* Execute all modules */
  for (var modulename of modules){

    //for now just ignore everything but get
    if (req.method !== "GET") {
      return;
    }

    var module = require(__dirname + '/api-modules/' + config.modules[modulename]["file"])(apiParams);
    /* get module specific parameters */

    if ("parameters" in config.modules[modulename]){
      var parameterConfig = config.modules[modulename].parameters.get
    } else {
      var parameterConfig = {}
    }

    for (var param of Object.keys(parameterConfig)) {

      if (param in req.query){
        var isAllowed = true

        if ("allowed" in parameterConfig[param]){
          isAllowed = false;
          var l = parameterConfig[param].allowed.length;
          while (l--){
            if (req.query[param] === parameterConfig[param].allowed[l]) {
              isAllowed = true;
            }
          }
        }

        if (isAllowed){
          module.parameters[param] = req.query[param];
        }
      }
      //Fall back to default, if any
      if (!(param in module.parameters)){
        if ("default" in parameterConfig[param]){
          module.parameters[param] = parameterConfig[param].default
        }
      }
    }
    /* execute module */
    module.get(appendOutputData);
  }
  function appendOutputData(err, data, modulename){
    debug("api got data from " + modulename);
    /* callback function for all modules */
    if (err) {
      output[modulename] = {};
      return console.log(err);
    } else {
      output[modulename] = data;
    }

    // Did all modules return?
    if (Object.keys(output).length >= modules.length) {
      res.json(output);
    }
  }

});

module.exports = router;