'use strict';


/**
 * @ngdoc directive
 * @name ngSanitize.directive:ngBindHtml
 *
 * @description
 * Создает привязки, которые очищают результат вычисления выражения `expression` с помощью сервиса 
 * {@link ngSanitize.$sanitize $sanitize} и результат устанавливается с помощью innerHTML в текущий элемент.
 * 
 * См. пример в документации по {@link ngSanitize.$sanitize $sanitize}.
 *
 * @element ANY
 * @param {expression} ngBindHtml {@link guide/expression Выражение} для вычисления.
 */
angular.module('ngSanitize').directive('ngBindHtml', ['$sanitize', function($sanitize) {
  return function(scope, element, attr) {
    element.addClass('ng-binding').data('$binding', attr.ngBindHtml);
    scope.$watch(attr.ngBindHtml, function ngBindHtmlWatchAction(value) {
      value = $sanitize(value);
      element.html(value || '');
    });
  };
}]);
