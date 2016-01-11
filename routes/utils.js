/* Various useful functions for parameter handling etc */

exports.getParam = function() {
  /* Return the first of any number of arguments that is not undefined */
  /* Used to get a parameter from multiple places */
  var args = Array.prototype.slice.call(arguments);//put all args into array
  while (args.length) {
    var arg = args.shift();
    if (arg !== undefined && arg !== null) {
      return arg;
    }
  }
}

exports.getParams = function() {
  /* Return the first of any number of arguments that is not undefined */
  /* Used to get a parameter from multiple places */
  /* Will return an array, by splitting resulting argument on `|` if needed*/
  var args = Array.prototype.slice.call(arguments);//put all args into array
  while (args.length) {
    var arg = args.shift();
    if (arg !== undefined) {
      if (typeof(arg) === 'string'){
        return arg.split('|');
      } else if (arg instanceof Array) {
        return arg;
      } else {
        return [arg];
      }
    }
  }
}