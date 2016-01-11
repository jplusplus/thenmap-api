/* Class for storing d3 style bounding boxes
   [[e, s],[w, n]]
*/
module.exports = function Bbox(bbox){

	this.e = bbox[1][0]
	this.s = bbox[0][1]
	this.w = bbox[0][0]
	this.n = bbox[1][1]
    this.height = Math.abs(this.n - this.s)
    this.width = Math.abs(this.e - this.w)

	/* Calculate a scale factory for d3.geo.projection,
	   given this bbox and a width and height */
	this.scale = function(w, h){

		return 0.95 / Math.max((this.width) / w,
			                   (this.height) / h)
	}

	return this

}
