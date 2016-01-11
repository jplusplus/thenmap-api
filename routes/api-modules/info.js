var Api = require(__dirname + '/baseModule.js');
var path = require("path")
var csv = require("fast-csv")

module.exports = function(ApiParams) {

  var api = new Api("info", ApiParams);

  api.get = function(callback) {

  	var output = ApiParams.config.datasets[ApiParams.dataset];

    // Use a CSV for testing
    var dataPath = path.join(__dirname, "..", "..", "testdata", this.apiParams.dataset) + path.sep
    var dataCsv = dataPath + "1.csv"
    var i18nCsv = dataPath + "i18n.json"
    var i18nJSON = require(i18nCsv)

    /* Add i18n props */
    var i18nProps = new Set()
    for (var key in i18nJSON) {
      for (var propName of Object.keys(i18nJSON[key])){
        i18nProps.add(propName)
      }
    }
    /* Add static props */
    csv.fromPath(dataCsv, {headers: true})
     .on('data', function (data){
       for (var propName of Object.keys(data)){
         i18nProps.add(propName)
       }
     })
     .on('end', function(){
       output["data_props"] = Array.from(i18nProps)
       callback(null, output, "info")
     })

  }

  return api

}