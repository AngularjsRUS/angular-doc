'use strict';

/**
 * @ngdoc object
 * @name ng.$document
 * @requires $window
 *
 * @description
 * Это {@link angular.element jQuery (lite)}-обертка, ссылающаяся на элемент браузера `window.document`.
 */
function $DocumentProvider(){
  this.$get = ['$window', function(window){
    return jqLite(window.document);
  }];
}
