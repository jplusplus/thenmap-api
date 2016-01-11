/* This module will use one of the path generators in the
   svg directory, to render a svg.
*/
var Api = require(__dirname + '/baseModule.js');
Api._cache = {}

var D3PathGenerator = require(__dirname + '/svg/d3PathGenerator.js');

var cheerio = require('cheerio');

module.exports = function(ApiParams) {

  var api = new Api("svg", ApiParams);

  api.get = function(callback) {
    var self = this;
    this.datasetConfig = this.apiParams.config.datasets[this.apiParams.dataset];
    this.getCallback = callback;

    //Use the first recommended projection for this dataset, if none given
    this.projection = this.parameters["projection"] || this.parameters["svg_proj"]
                     || this.datasetConfig.recommendedProjections[0]
    this.width = this.parameters["width"] || this.parameters["svg_width"]
    this.height = this.parameters["height"] || this.parameters["svg_height"]
    this.lang = this.parameters["svg_lang"] || null
    this.variant = this.parameters["svg_variant"] || null
 
    self.cacheKey = self.apiParams.date + self.apiParams.dataset + self.projection + self.width + self.height + this.parameters["svg_props"] + this.lang + this.variant
    if (self.cacheKey in Api._cache){
      self._callback(null, Api._cache[self.cacheKey], self.getCallback)
      return
    }

    /* call geo module */
    var geo = require(__dirname + '/geo')(ApiParams)
    geo.parameters["geo_type"] = "geojson"
    geo.parameters["geo_props"] = this.parameters["svg_props"]
    geo.parameters["geo_lang"] = this.lang
    geo.parameters["geo_variant"] = this.variant
    geo.parameters["geo_scale"] = "s"

    geo.get(function createSvg(err, geojson){

      self.geojson = geojson
//      console.log(geojson.features[0].geometry.coordinates)

      if ( D3PathGenerator().canConvertTo(self.projection) ){
        var pathGenerator = D3PathGenerator(geojson, self.projection, self.apiParams.dataset,
                                {width: self.width,
                                height: self.height,
                                bbox: self.datasetConfig.bbox})
      } else {
        self.apiParams.res.status(501).send('Sorry, no SVG path generator was found for that projection.')
        return
      }

      pathGenerator.getPaths(function(error, paths){
        Api._cache[self.cacheKey] = paths
        self._callback(null, paths, self.getCallback)
      })

    });

  }
  return api
}