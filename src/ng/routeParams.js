'use strict';

/**
 * @ngdoc object
 * @name ng.$routeParams
 * @requires $route
 *
 * @description
 * Текущие параметры для маршрутизации. Параметры маршрутизации, это комбинация методов сервиса
 * {@link ng.$location $location} `search()`, и `path()`. Параметр `path` извлечен, когда найдет путь в 
 * {@link ng.$route $route}.
 * 
 * В случае конфликта имен параметров, параметры `path` приоритетнее параметров `search`.
 * 
 * Сервис гарантирует что объект `$routeParams` не будет изменяться (но его свойства будут меняться) 
 * даже когда маршрут будет изменен.
 *
 * @example
 * <pre>
 *  // Дано:
 *  // URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
 *  // Маршрут: /Chapter/:chapterId/Section/:sectionId
 *  //
 *  // Тогда
 *  $routeParams ==> {chapterId:1, sectionId:2, search:'moby'}
 * </pre>
 */
function $RouteParamsProvider() {
  this.$get = valueFn({});
}
