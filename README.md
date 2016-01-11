#Thenmap API

This is an API for fetching Thenmap data from the Thenmap database(s). It delivers three things:

 * Shapes (as geoJSON)
 * Data about those shapes
 * Prerendered SVG's

The the URI is constructed like this: `version/dataset/modules/date`.

For full documentation, see [api.thenmap.net](http://api.thenmap.net)

##Credits and licences
All code is released under the [MIT license](LICENSE) (in short, do with it whatever you wish, but keep it free), where nothing else is indicated.

The list of [projection definitions](resources/epsg.js) is from [github.com/yuletide](https://gist.github.com/yuletide/3909348).

##Change log
 
* 1.1.0
 * Include Wikidata properties

* 1.0.0
 * First version 