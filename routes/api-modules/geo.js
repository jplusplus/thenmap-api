var Api = require(__dirname + '/baseModule.js')

var fs = require('fs')
var utils = require('../utils')

var Proj4 = require('proj4')
var Epsg = require('../../resources/epsg.js')(Proj4)
var Reproject = require("reproject")

module.exports = function(ApiParams) {

  var api = new Api("geo", ApiParams)
  api.crss_aliases = {
    "sweref99": "EPSG:3006",
    "rt90": "EPSG:3021",
    "wgs84": "EPSG:4326",
    "tm35fin": "EPSG:3067",
    "gr96": "EPSG:4908",
  }

  api.cleanup = function(geodata){
    // Clean up feature, including only the ID property
    // TODO remove, but need to have a look at shapefiles first
    var features = [];
    for (feature of geodata.features){
      var cleanedFeature = {
        "type":"Feature",
        "properties": {
          "id": feature.properties.ID || feature.properties.id
        },
        "geometry": feature.geometry
      }
      features.push(cleanedFeature)
    }
    geodata.features = features
    return geodata

  }
 
  api.get = function(callbackList) {
    var self = this

    this.getCallbackList = callbackList
    this.geoType = this.parameters["geo_type"]
    this.ver = "1"
    this.defaultCrs = "EPSG:4326"  // WGS84
    this.crs = this.crss_aliases[this.parameters["geo_crs"]] || this.defaultCrs

    // Get geodata
    var filename = self.ver + "-" + self.parameters["geo_scale"]
    var file = __dirname + "/../../testdata/" + self.apiParams.dataset + "/" + filename + ".geojson";
    fs.readFile(file, 'utf-8', function(err, geodata){
      if (err) {
        return console.log(err);
      }
      geodata = JSON.parse(geodata);

      // Call data module, so we can filter the result by date and/or variant
      var data = require(__dirname + '/data')(ApiParams)
      data.parameters["data_props"] = self.parameters["geo_props"]
      if ("geo_lang" in self.parameters){
        data.parameters["data_lang"] = self.parameters["geo_lang"]
      }
      if ("geo_variant" in self.parameters){
        data.parameters["data_variant"] = self.parameters["geo_variant"]
      }
      data.get(function filterGeoData(err, datadata){

        // cleanup
        geodata = self.cleanup(geodata)

        // filter geodata
        var res = geodata.features.filter(function (feature) {
          return (parseInt(feature.properties.id) in datadata)
        })
        geodata.features = res

        //Add properties
        if ("geo_props" in self.parameters) {
          var features = [];
          for (feature of geodata.features){
            var featureId = feature.properties.id
            var newFeature = {
              "type":"Feature",
              "properties": {
                "id": featureId
              },
              "geometry": feature.geometry
            }
            if (self.parameters.geo_props !== '') {
              if (self.parameters.geo_flatten_props === "true"){
                var counter = 1
                for (entity of datadata[featureId]){
                  for (var prop in entity){
                    if (entity[prop] instanceof Array){
                      var name = entity[prop].join(', ')
                    } else {
                      var name = entity[prop]
                    }
                    var flatPropName = prop + "_" + counter
                    newFeature.properties[flatPropName] = name
                  }
                  counter++
                }
              } else {
                newFeature.properties["entities"] = datadata[featureId]
              }
            }

            features.push(newFeature)
          }
          geodata.features = features
        }

        // Reprojection
        if (self.crs !== self.defaultCrs){
          geodata = Reproject.reproject(geodata, self.defaultCrs, self.crs, Proj4.defs)
        }

        // Return geojson or topojson
        if (self.geoType === "geojson"){
          self._callback(null, geodata, self.getCallbackList);
        } else if (self.geoType === "topojson"){
          var Topojson = require("topojson");

          var geojson = JSON.parse(JSON.stringify(geodata))//deep copy
          var topojson = Topojson.topology({collection: geojson},
            { // options
              id: function(d) {
                return d.properties.id
              },
              "property-transform": function (feature) {
                return feature.properties
              }
            }
          )
          self._callback(null, topojson, self.getCallbackList);
        } else {
          return (console.log("geo formatmissing"))
        }

      })


    })

  }

  return api
}