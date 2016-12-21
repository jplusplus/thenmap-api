/* This path generator uses d3-geo-projection,
   to handle various useful world projections
   and interrupted projections. */

var d3 = require("d3")
require("d3-geo-projection")(d3)
var jsdom = require("node-jsdom").jsdom
var Bbox = require(__dirname + "/bbox.js")
var PathGenerator = require(__dirname + '/basePathGenerator.js')

module.exports = function(geojson, projection, dataset, options) {

  var pathGenerator = new PathGenerator(geojson, projection, dataset, options)

  // Everything from https://github.com/d3/d3-geo-projection
  pathGenerator.predefinedProjections = ["albersUsa", "aitoff", "airy", "albers", "armadillo", "august", "azimuthalEqualArea", "azimuthalEquidistant", "baker", "berghaus", "boggs", "bonne", "bromley", "chamberlin", "collignon", "conicConformal", "conicEquidistant", "craig", "craster", "cylindricalEqualArea", "cylindricalStereographic", "eckert1", "eckert2", "eckert3", "eckert4", "eckert5", "eckert6", "eisenlohr", "equirectangular", "fahey", "foucaut", "gilbert", "gingery", "ginzburg4", "ginzburg5", "ginzburg6", "ginzburg8", "ginzburg9", "gnomonic", "gringorten", "guyou", "hammer", "hammerRetroazimuthal", "healpix", "hill", "homolosine", "kavrayskiy7", "lagrange", "larrivee", "laskowski", "littrow", "loximuthal", "mercator", "miller", "modifiedStereographic", "mollweide", "mtFlatPolarParabolic", "mtFlatPolarQuartic", "mtFlatPolarSinusoidal", "naturalEarth", "nellHammer", "orthographic", "patterson", "peirceQuincuncial", "polyconic", "rectangularPolyconic", "robinson", "satellite", "sinusoidal", "sinuMollweide", "stereographic", "times", "transverseMercator", "twoPointAzimuthal", "twoPointEquidistant", "vanDerGrinten", "vanDerGrinten2", "vanDerGrinten3", "vanDerGrinten4", "wagner4", "wagner6", "wagner7", "wiechel", "winkel3",
                                         "robinson-pacific", "winkel3-pacific"]
  // projections that can not be rotated or centered
  pathGenerator.noTransformation = ["albersUsa"]
  pathGenerator.pacific = {
    "robinson-pacific": "robinson",
    "winkel3-pacific": "winkel3"

  }
  //Define UTM projections
  pathGenerator.utmProjections = {
    sweref99tm: {
      rotate: [-15,-65,0],
      offsetDenom: [2.85, 3.3]
    },
    tm35fin: {
      rotate: [-27,-65,0],
      offsetDenom: [1.85, 2.1]
    },
    gr96: {
      rotate: [40,-75,0],
      offsetDenom: [1.85, 2.8]
    },
    swissgrid: {
      rotate: [-7.439583, -46.95241],
      offsetDenom: [2.9, 2.4]
    },
    euref89no: {
      rotate: [-14,-66,0],
      offsetDenom: [2.4, 2.4]
    }
  }
  //All projections in one  array
  pathGenerator.validProjections = pathGenerator.predefinedProjections.concat(Object.keys(pathGenerator.utmProjections))

  pathGenerator.projection = projection

  pathGenerator.getPaths = function(callback){
    var self = this
    var doc = jsdom()


    var svg = d3.select(doc.body)
                .append('svg')
                .attr('xmlns', d3.ns.prefix.svg)
                .attr('preserveAspectRatio', "xMidYMin meet")
                .attr("class", "thenmap")
                .attr('width', self.w)
                .attr('height', self.h)
                .attr('viewBox', [0, 0, self.w, self.h].join(" "))
                .style('width', self.w + "px")
                .style('height', self.h + "px")
                .style('fill', self.landColor)

    if (self.projection in self.utmProjections) {
      /* UTM, use presets */

      //Try something, anything really, as long as it is large enough
      var firstScale = 5000
      var projection = d3.geo.transverseMercator()
                             .scale(firstScale)
      var path = d3.geo.path().projection(projection)
      var bbox = new Bbox(path.bounds(self.geojson))

      var up = self.utmProjections[self.projection]
      var offset  = [self.w/up.offsetDenom[0], self.h/up.offsetDenom[1]]
      var scaleFactor = bbox.scale(self.w, self.h)
      
      projection = d3.geo.transverseMercator()
                         .rotate(up.rotate)
                         .scale(scaleFactor * firstScale)
                         .translate(offset)

      path = path.projection(projection)

    } else {
      /* Predefined projection */

      // first, make an educated guess
      var firstScale = Math.min(self.w,self.h) / 6
      var offset = [self.w / 2, self.h / 2];
      if (self.projection in self.pacific){
        self.projection = self.pacific[self.projection]
        self.isPacific = true
      } else {
        self.isPacific = false
      }
      var projection = d3.geo[self.projection]()
                         .scale(firstScale)
      if (self.noTransformation.indexOf(self.projection) == -1){
        projection.translate(offset)
      }
      if (self.isPacific){
        projection.rotate([200, 0, 0])
      }
      var path = d3.geo.path().projection(projection)
      var bbox = new Bbox(path.bounds(self.geojson))

//      if (self.noTransformation.indexOf(self.projection) == -1){
//        var offset  = [self.w - (bbox.w + bbox.e)/2.2,
//                       self.h - (bbox.s + bbox.n)/1.6]
//        var center = d3.geo.centroid(self.geojson)
//        projection
//          .center(center)
//          .translate(offset)
//      }
      var scaleFactor = bbox.scale(self.w, self.h)
      projection.scale(firstScale * scaleFactor)
      path = path.projection(projection)
    }

    svg.selectAll("path")
       .data(self.geojson.features, function(d, i) { return d + i})
       .enter()
       .append("path")
       .attr("d", path)
       .attr("data-id", function(data){
         return data.properties.id
       })
       .each(function(data) {
         // add any extra properties
         var header = d3.select(this)
         var ents = data.properties.entities || []
         var i = 1
         ents.forEach(function(ent) {
           d3.keys(ent).forEach(function(key) {
             header.attr("data-"+key+"_"+i, ent[key])
           })
           i++
         })
       })

    if (this.dataset === "world-2"){
      svg.append("path")
      .datum({type: "Sphere"})
      .attr("id", "sphere")
      .attr("d", path)
      .attr("stroke", "black")
      .attr("fill", "none")
    }
    var defs = svg
      .append("defs")
    defs
      .append("pattern")
      .attr({
        "height": "2",
        "width": "2",
        "id": "diagonalHatch",
        "patternTransform": "rotate(45 2 2)",
        "patternUnits": "userSpaceOnUse"
      })
      .append("path")
      .attr("d", "M -1,2 l 6,0")
      .attr("stroke", self.landColor)
      .attr("stroke-width", "2")
    defs
      .append("style")
      .html(".limit{fill:url('#diagonalHatch')}")

    var html = svg.node().outerHTML.replace( //ugly: regex truncating
                  /\.(\d{2})\d+/g
                  , '.$1'
                  )
    callback(null, html)
  }

  return pathGenerator

}
