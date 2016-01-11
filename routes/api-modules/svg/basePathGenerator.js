/**
 * Mother class of SVG path generators.
 * @class
 * @param {string} geojson - Geo data in, well, geojson format
 * @param {string} projection - A projection that this module understands.
 */
 module.exports = function BasePathGenerator(geojson, projection, dataset, options) {

  this.geojson = geojson
  this.projection = projection || null
  this.options_ = options || {}
  this.w = ("width" in this.options_) ? options.width : null
  this.h = ("height" in this.options_) ? options.height : null
  this.bbox = ("bbox" in this.options_) ? options.bbox : null
  this.validProjections = []
  this.seaColor = "AliceBlue"
  this.landColor = "gainsboro"
  this.dataset = dataset

  /**
   * Checks whether this module thinks it can handle the specified projection
   * @function
   * @param {string} projectionName
   */
  this.canConvertTo = function(projectionName){
    var self = this
    return (self.validProjections.indexOf(projectionName) > -1)
  }

  /**
   * Return SVG
   * @function
   * @param {function} callback
   */
  this.getPaths = function(callback){
    callback("Error: BasePathGenerator.getPaths should be overriden.", null)
  }

  return this;

}