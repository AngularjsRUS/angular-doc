'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngCsp
 * @priority 1000
 *
 * @description
 * Включает поддержку [CSP (Правила безопасности контента)](https://developer.mozilla.org/en/Security/CSP). 
 * Эта директива должна быть использована в корневом элементе приложения (обычно это `<html>` элемент или 
 * другой элемент, {@link ng.directive:ngApp ngApp}).
 * 
 * Если ее включить, производительность шаблонов незначительно пострадает, поэтому не включайте без крайней 
 * необходимости.
 *
 * @element html
 */

var ngCspDirective = ['$sniffer', function($sniffer) {
  return {
    priority: 1000,
    compile: function() {
      $sniffer.csp = true;
    }
  };
}];
