'use strict';


function $TimeoutProvider() {
  this.$get = ['$rootScope', '$browser', '$q', '$exceptionHandler',
       function($rootScope,   $browser,   $q,   $exceptionHandler) {
    var deferreds = {};


     /**
      * @ngdoc function
      * @name ng.$timeout
      * @requires $browser
      *
      * @description
      * Angular обертка над `window.setTimeout`. Передаваемая внутрь функция fn обернута в блок 
      * try/catch и при любом исключении обработка проводится сервисом 
      * {@link ng.$exceptionHandler $exceptionHandler}.
      * 
      * Возвращает значение для зарегистрированной функции являющееся обещанием, которое будет выполнено,
      * когда установленное время истечет, и функция будут выполнена.
      * 
      * Для отмены запроса на установку таймаута, вызовите `$timeout.cancel(promise)`.
      * 
      * В тестах можно использовать {@link ngMock.$timeout `$timeout.flush()`} для синхронизации очереди 
      * функций должников.
      *
      * @param {function()} fn функция, выполнение которой должно быть отложено.
      * @param {number=} [delay=0] Задержка в миллисекундах.
      * @param {boolean=} [invokeApply=true] Если установить в false пропускается проверка модели 
      *   на изменения, иначе функция `fn` будет вызвана в блоке {@link ng.$rootScope.Scope#$apply $apply}.
      * @returns {Promise} Обещание которое будет выполнено по истечению времени таймаута. Значение этого
      *   обещания будет принято возвращенным значением из функции `fn`.
      */
    function timeout(fn, delay, invokeApply) {
      var deferred = $q.defer(),
          promise = deferred.promise,
          skipApply = (isDefined(invokeApply) && !invokeApply),
          timeoutId, cleanup;

      timeoutId = $browser.defer(function() {
        try {
          deferred.resolve(fn());
        } catch(e) {
          deferred.reject(e);
          $exceptionHandler(e);
        }

        if (!skipApply) $rootScope.$apply();
      }, delay);

      cleanup = function() {
        delete deferreds[promise.$$timeoutId];
      };

      promise.$$timeoutId = timeoutId;
      deferreds[timeoutId] = deferred;
      promise.then(cleanup, cleanup);

      return promise;
    }


     /**
      * @ngdoc function
      * @name ng.$timeout#cancel
      * @methodOf ng.$timeout
      *
      * @description
      * Отменяет задачу, ассоциированную с обещанием. Как результате обещание будет принято как отклоненное.
      *
      * @param {Promise=} promise Обещание, возвращенное функцией `$timeout`.
      * @returns {boolean} Возвращает `true` если задача еще не выполнена или была успешно отменена.
      */
    timeout.cancel = function(promise) {
      if (promise && promise.$$timeoutId in deferreds) {
        deferreds[promise.$$timeoutId].reject('canceled');
        return $browser.defer.cancel(promise.$$timeoutId);
      }
      return false;
    };

    return timeout;
  }];
}
