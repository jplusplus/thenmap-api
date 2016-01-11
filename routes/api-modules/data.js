var Api = require(__dirname + '/baseModule.js')
var csv = require("fast-csv")
var path = require("path")
var utils = require('../utils')

module.exports = function Data(ApiParams) {

  var api = new Api("data", ApiParams)

  api.getProp = function(obj, lang){
    /* extract possibly localized values for property */
    var self = this
    if ( obj instanceof Array ){
      /* this is an array of props */
      var output = []

      for (var subObj of obj){
        /* todo code duplication */
        /* skip if not in date range */
        if (self.date !== null) {
          var reqDate = new Date(self.date).toISOString()
          var from = subObj["from"] || "0"
          var to = subObj["to"] || "9"
          if ( from > reqDate || to < reqDate) {
            continue
          }
        }
        output.push(self.getProp(subObj["value"], lang))
      }
      return output
    }

    if ( typeof(obj) === 'string' ){
      /* this is a non translatable string */
      return obj
    }

    if (lang in obj) {
      /* direct match */
      return obj[lang]
    } else if (self.apiParams.config.languageFallbacks[lang] in obj) {
      /* fallback lang */
      return obj[self.apiParams.config.languageFallbacks[lang]]
    } else if (self.defaultLanguage in obj) {
      /* dataset default language */
      return obj[self.defaultLanguage]
    } else if (self.apiParams.config.languageFallbacks[self.defaultLanguage] in obj) {
      /* fallback for default */
      return obj[self.apiParams.config.languageFallbacks[self.defaultLanguage]]
    }
  }

  api.get = function(callback) {
    var self = this

    this.getCallbackList = callback
    this.defaultLanguage = this.apiParams.config.datasets[this.apiParams.dataset].defaultLanguage
    this.language = utils.getParam(this.parameters["language"], this.parameters["data_lang"], this.defaultLanguage)
    if (typeof self.apiParams.date == "undefined"){
      this.date = null
    } else {
      this.date = self.apiParams.date
    }

    // data_props might not be set if called from a module
    // but it must have a value
    if (this.parameters["data_props"]) {
      this.dataProperties = this.parameters["data_props"].split("|")
    } else {
      this.dataProperties = []
    }

    var variants = {}
    utils.getParam(this.parameters["data_variant"], "")
         .split(";")
         .forEach(function( element ){
           var parts = element.split("=")
           variants[parts[0]] = parts[1]
         })
    this.variants = variants

    // Use a CSV for testing
    var dataPath = path.join(__dirname, "..", "..", "testdata", this.apiParams.dataset) + path.sep
    var dataCsv = dataPath + "1.csv"
    var i18nCsv = dataPath + "i18n.json"
    /* Get translated properties (synchronous) */
    var i18nJSON = require(i18nCsv)

    var output = {}

    csv.fromPath(dataCsv, {headers: true})
    .on('data', function (data){

      /* Overwrite or add properties as requested */
      // FIXME
      var current_i18n = i18nJSON[data["id"]];

      for (var prop_key in current_i18n){
        data[prop_key] = self.getProp(current_i18n[prop_key], self.language);
      }

      // Apply filters
      var includeThisRow = true;
 
     // Filter by date, if given
      if (self.date !== null) {
          var reqDate = new Date(self.date).toISOString()
          if (data["sdate"] > reqDate || data["edate"] < reqDate) {
            includeThisRow = false
          }
      }
      // Filter by variant, if the dataset has them
      if ( ("version" in data) && ("versionset" in data) && data["versionset"] ){
        if ( data["versionset"] in self.variants ){
          if ( self.variants[data["versionset"]] !== data["version"] ){
            includeThisRow = false
          }
        } else if (data["version"] > 1) {
            //Default: Only include 0 and 1
            includeThisRow = false
        }
      }
  
      //Add properties
      if (includeThisRow){
        var item = {}
        var shapeid = data["shapeid"]
        entity = {}
        for (var dataProperty of self.dataProperties){
          if (dataProperty in data){
            entity[dataProperty] = data[dataProperty]
          }
        }
        if (shapeid in output) {
          output[shapeid].push(entity)
        } else {
          output[shapeid] = [entity]
        }
      }

    })
    .on("end", function (){
      self._callback(null, output, self.getCallbackList)
    })
    .on("error", function (err){
      console.log("[data] returning error", err)
      self._callback(err, null, self.getCallbackList)
    })

  }

  return api

}