/**
 * Mother class of all modules. Contains helper functions.
 * @class
 * @param {string} name - The name of the module.
 * @param {string} apiParams - An object with parameters passed from the user.
 */
 module.exports = function BaseModule(name, apiParams) {

  this.apiParams = apiParams
  this.parameters = {}
  this._name = name

  /**
   * Does callbacks to one or many functions
   * @function
   * @param {Object} data - a json data object
   * @param {Array} callBackList - an array of functions to call with data
   */
  this._callback = function(error, data, callBackList){
    if (!(callBackList instanceof Array)){
      //Make array if it isn't already
      callBackList = [callBackList]
    }
    for (callBack of callBackList){
      //Check that callback is a function, otherwise do nothing
      callback = (typeof callback === 'function') ? callback : function() {}
      callBack(error, data, this._name)
    }
  }

  this.get = function(callBackList){
    this._callback ("The baseModule.get method should be overridden", callBackList)
  }

  this.post = function(callBackList){
    this._callback ("The baseModule.post method should be overridden", callBackList)
  }

  this.put = function(callBackList){
    this._callback ("The baseModule.put method should be overridden", callBackList)
  }

  this.delete = function(callBackList){
    this._callback ("The baseModule.delete method should be overridden", callBackList)
  }

/*  BaseModule.instances[name] = this
  BaseModule.instances[name].result = null*/
  return this

}
