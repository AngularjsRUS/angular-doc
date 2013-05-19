'use strict';

/**
 * @ngdoc function
 * @name ng.$exceptionHandler
 * @requires $log
 *
 * @description
 * Любое не перехваченное исключение в angular-выражениях обрабатывается этим сервисом. 
 * По умолчанию реализована обработка с помощью `$log.error`, которая просто выводит сообщение 
 * об исключении в консоль браузера.
 * 
 * В юнит тестах, если загружен `angular-mocks.js`, этот сервис будет переопределен на 
 * {@link ngMock.$exceptionHandler mock $exceptionHandler} с вспомогательными средствами для тестирования.
 *
 * @param {Error} exception Исключение, ассоциированное с ошибкой.
 * @param {string=} необязательная информация о контексте в котором возникла ошибка.
 *
 */
function $ExceptionHandlerProvider() {
  this.$get = ['$log', function($log) {
    return function(exception, cause) {
      $log.error.apply($log, arguments);
    };
  }];
}
