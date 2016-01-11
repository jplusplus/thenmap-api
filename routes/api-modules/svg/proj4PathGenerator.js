//var geojson2svg = require('geojson2svg');
var Proj4 = require('proj4');
var Epsg = require('../../resources/epsg.js')(Proj4);


        //FIXME: test
/*        if (geo.projection === "ESRI:54030"){
          var leftbottom = [-14000000, -12000000]
          var righttop = [14000000, 12000000]
        } else if (geo.projection === "ESRI:54012"){
          var leftbottom = [-12000000, -11000000]
          var righttop = [12000000, 11000000]
        } else {
          // translate bbox coordinates
          if (geo.projection !== geo.defaultProjection){
            var leftbottom = Proj4(geo.projectionDef, [self.bbox[0], self.bbox[1]]);
            var righttop = Proj4(geo.projectionDef, [self.bbox[2], self.bbox[3]]);
          } else {
            var leftbottom = [self.bbox[0], self.bbox[1]];
            var righttop = [self.bbox[2], self.bbox[3]];
          }
        }

/*        var options = {
          viewportSize: {
            width: self.parameters.width,
            height: self.parameters.height
          },
          mapExtent: {
              left: leftbottom[0],
              right: righttop[0],
              bottom: leftbottom[1],
              top: righttop[1]
          },
          attributes: {},
          output: "svg",
          explode: true,
        }
*/


