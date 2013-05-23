'use strict';

/**
 * @ngdoc service
 * @name ng.$q
 * @requires $rootScope
 *
 * @description
 * Реализация обещаний/должников (promise/deferred) навеяна библиотекой 
 * [Q Криса Коваля](https://github.com/kriskowal/q). 
 * 
 * Раздел [Promises](http://wiki.commonjs.org/wiki/Promises) учебника CommonJS описывает обещание как интерфейс 
 * для взаимодействия с объектом, определенным асинхронно, т. е. результат его действий появится в будущем и 
 * в момент взаимодействия может быть неопределенным.
 * 
 * С точки зрения обработки ошибок, операторы `try`, `catch` и `throw` в API должников и обещаний  
 * используются асинхронно даже в синхронном программировании.
 *
 * <pre>
 *   // чтобы лучше понять пример, посмотрите применение переменных `$q` и `scope`,
 *   // доступных в текущей области видимости (они должны быть внедрены или переданы в нее).
 *
 *   function asyncGreet(name) {
 *     var deferred = $q.defer();
 *
 *     setTimeout(function() {
 *       // функция выполняется асинхронно в будущем цикле событий, нам нужно обернуть
 *       // ваш код и передать в вызов $apply чтобы уведомить об его изменениях.
 *       scope.$apply(function() {
 *         if (okToGreet(name)) {
 *           deferred.resolve('Hello, ' + name + '!');
 *         } else {
 *           deferred.reject('Greeting ' + name + ' is not allowed.');
 *         }
 *       });
 *     }, 1000);
 *
 *     return deferred.promise;
 *   }
 *
 *   var promise = asyncGreet('Robin Hood');
 *   promise.then(function(greeting) {
 *     alert('Success: ' + greeting);
 *   }, function(reason) {
 *     alert('Failed: ' + reason);
 *   });
 * </pre>
 *
 * Не совсем очевидно, для чего это нужно и зачем так усложнять код. Выигрыш появляется в результате [гарантий 
 * выполнения обещания и долга](https://github.com/kriskowal/uncommonjs/blob/master/promises/specification.md).
 * 
 * Дополнительно api обещания позволяет использовать композицию, что очень трудно сделать с традиционным
 * подходом ([CPS](http://en.wikipedia.org/wiki/Continuation-passing_style)) к колбэкам. Для большей информации
 * смотрите [документацию по Q](https://github.com/kriskowal/q), особенно раздел о последовательном 
 * и параллельном присоединении обещания.
 * 
 *
 * # API должника (deferred)
 *
 * Новый экземпляр должника создается вызовом функции `$q.defer()`.
 * 
 * Должник, используя ассоциированный экземпляр обещания, уведомляет об успешном или нет 
 * завершении асинхронной задачи.
 *
 * **Методы**
 *
 * - `resolve(value)` – принимает обещанное значение `value`. Если `value` отклонено `$q.reject` как 
 *   ошибочное, то обещание будет определено ошибочным.
 * - `reject(reason)` – отклоняет обещание с указанием причины `reason`. Это эквивалентно приему и
 *   последующему отклонению с использованием конструктора `$q.reject`.
 *
 * **Свойства**
 *
 * - promise – `{Promise}` – объект обещания ассоциированный с должником.
 *
 *
 * # API обещания (promise)
 *
 * Новый экземпляр обещания создается вместе с экземпляром должника и может извлекаться с помощью 
 * метода `deferred.promise`.
 * 
 * Обещание позволяет заинтересованным объектам получить доступ к результату отложенной
 * задачи, после ее выполнения.
 * 
 * **Методы**
 *
 * - `then(successCallback, errorCallback)` – независимо от того, было ли обещание принято или 
 *   отклонено, выполнится один из колбэков, как только результат станет доступным. В колбэк 
 *   передается один аргумент – результат или причина отказа.
 *
 *   Этот метод *возвращает новое обещание*, которое принимается или откланяется с возвращаемым значением 
 *   для `successCallback` или `errorCallback`.
 * 
 * - `always(callback)` – позволяет наблюдать за каждым выполнением или отклонением обещания, но делать 
 *    это без изменения конечного значения, что полезно для освобождения ресурсов или для любой
 *    чистки, которая должна быть проведена после того как обещание было принято или отклонено. См. так же
 *    [полную спецификацию](https://github.com/kriskowal/q/wiki/API-Reference#promisefinallycallback).
 * 
 *
 * # Цепочки обещаний
 *
 * Вызов `then` возвращает новое обещание, что позволяет легко создавать цепочку обещаний:
 *
 * <pre>
 *   promiseB = promiseA.then(function(result) {
 *     return result + 1;
 *   });
 *
 *   // promiseB будет принято после принятия promiseA и его значением будет
 *   // результат promiseA увеличенный на 1
 * </pre>
 *
 * Это позволяет создавать цепочки из любого количества обещаний, которые могут приниматься другими
 * обещаниями (каждое будет должно следующему), поэтому можно установить паузу/отложить определение 
 * обещания в любой части цепочки. Это делает простым реализацию полного api для перехватчика ответов 
 * $http.
 *
 *
 * # Различия между Q Криса Коваля и $q
 *
 *  Они имеют три главных отличия:
 *
 * - $q интегрирован в модель {@link ng.$rootScope.Scope области видимости} и имеет механизм наблюдения, 
 *   что означает быстрое распространение принятия или отклонения в модели, избегая ненужных 
 *   перерисовок в браузере, что привело бы к мерцанию пользовательского интерфейса.
 * - $q обещание поддерживается движком шаблонов в Angular, поэтому в шаблонах можно использовать 
 *   обещания в области видимости, так, как будто это результирующие значения.
 * - Q имеет больше возможностей, чем $q, но это делает его более увесистым. $q маленький, но содержит всю 
 *   требующуюся функциональность для реализации асинхронных задач.
 * 
 * 
 *  # Тестирование
 * 
 *  <pre>
 *    it('should simulate promise', inject(function($q, $rootScope) {
 *      var deferred = $q.defer();
 *      var promise = deferred.promise;
 *      var resolvedValue;
 * 
 *      promise.then(function(value) { resolvedValue = value; });
 *      expect(resolvedValue).toBeUndefined();
 * 
 *      // Симуляция принятия обещания
 *      deferred.resolve(123);
 *      // Заметьте, что функция 'then' не вызывается синхронно.
 *      // Это потому, что мы хотим чтобы обещание всегда работало асинхронно,
 *      // не зависимо от синхронного или асинхронного вызова.
 *      expect(resolvedValue).toBeUndefined();
 * 
 *      // Распространение обещания функцией 'then' используя $apply().
 *      $rootScope.$apply();
 *      expect(resolvedValue).toEqual(123);
 *    });
 *  </pre>
 */
function $QProvider() {

  this.$get = ['$rootScope', '$exceptionHandler', function($rootScope, $exceptionHandler) {
    return qFactory(function(callback) {
      $rootScope.$evalAsync(callback);
    }, $exceptionHandler);
  }];
}


/**
 * Constructs a promise manager.
 *
 * @param {function(function)} nextTick Function for executing functions in the next turn.
 * @param {function(...*)} exceptionHandler Function into which unexpected exceptions are passed for
 *     debugging purposes.
 * @returns {object} Promise manager.
 */
function qFactory(nextTick, exceptionHandler) {

  /**
   * @ngdoc
   * @name ng.$q#defer
   * @methodOf ng.$q
   * @description
   * Создает объект должника (`deferred`) представляющего задачу, которая будет завершена в будущем.
   *
   * @returns {Deferred} Возвращает новый экземпляр должника.
   */
  var defer = function() {
    var pending = [],
        value, deferred;

    deferred = {

      resolve: function(val) {
        if (pending) {
          var callbacks = pending;
          pending = undefined;
          value = ref(val);

          if (callbacks.length) {
            nextTick(function() {
              var callback;
              for (var i = 0, ii = callbacks.length; i < ii; i++) {
                callback = callbacks[i];
                value.then(callback[0], callback[1]);
              }
            });
          }
        }
      },


      reject: function(reason) {
        deferred.resolve(reject(reason));
      },


      promise: {
        then: function(callback, errback) {
          var result = defer();

          var wrappedCallback = function(value) {
            try {
              result.resolve((callback || defaultCallback)(value));
            } catch(e) {
              exceptionHandler(e);
              result.reject(e);
            }
          };

          var wrappedErrback = function(reason) {
            try {
              result.resolve((errback || defaultErrback)(reason));
            } catch(e) {
              exceptionHandler(e);
              result.reject(e);
            }
          };

          if (pending) {
            pending.push([wrappedCallback, wrappedErrback]);
          } else {
            value.then(wrappedCallback, wrappedErrback);
          }

          return result.promise;
        }
      }
    };

    return deferred;
  };


  var ref = function(value) {
    if (value && value.then) return value;
    return {
      then: function(callback) {
        var result = defer();
        nextTick(function() {
          result.resolve(callback(value));
        });
        return result.promise;
      }
    };
  };


  /**
   * @ngdoc
   * @name ng.$q#reject
   * @methodOf ng.$q
   * @description
   * Создает обещание (`promise`) с состоянием «отклонено» с указанием причины отклонения `reason`. Это 
   * отклонит всю вышестоящую цепочку обещаний. Если отклонено последнее обещание в цепочке, не нужно делать
   * это для остальных.
   * 
   * Если проводить параллель должников/обещаний с операторами обработки ошибок try/catch/throw, тогда `reject` это
   * как `throw` в JavaScript. Поэтому, когда вы «ловите» ошибку через 
   * колбэк обещания и хотите переслать ошибку из текущего другому обещанию, то используете повторный 
   * вызов «выкидывания» ошибки, который здесь построен через вызов `reject`.
   * 
   *
   * <pre>
   *   promiseB = promiseA.then(function(result) {
   *     // success: сделать что-то и принять promiseB
   *     //          со старым или новым результатом
   *     return result;
   *   }, function(reason) {
   *     // error: обработка ошибки, если получилось обработать,
   *     //        принимаем promiseB с newPromiseOrValue,
   *     //        иначе передаем отказ в promiseB
   *     if (canHandle(reason)) {
   *      // обработка ошибок и востановление
   *      return newPromiseOrValue;
   *     }
   *     return $q.reject(reason);
   *   });
   * </pre>
   *
   * @param {*} reason Константа, сообщение, исключение или любой другой объект, объясняющий причину отказа.
   * @returns {Promise} Возвращает обещание, принятое с отказом и его причиной `reason`.
   */
  var reject = function(reason) {
    return {
      then: function(callback, errback) {
        var result = defer();
        nextTick(function() {
          result.resolve((errback || defaultErrback)(reason));
        });
        return result.promise;
      }
    };
  };


  /**
   * @ngdoc
   * @name ng.$q#when
   * @methodOf ng.$q
   * @description
   * Обертывает объект, который может стать значением или другим обещанием в $q promise. Это полезно, 
   * когда вы имеете дело с объектом, которое может быть или не быть обещанием, или если обещание исходит 
   * от источника, которому нет доверия.
   *
   * @param {*} value Значение или обещание
   * @returns {Promise} возвращает обещание для переданного значения или обещания
   */
  var when = function(value, callback, errback) {
    var result = defer(),
        done;

    var wrappedCallback = function(value) {
      try {
        return (callback || defaultCallback)(value);
      } catch (e) {
        exceptionHandler(e);
        return reject(e);
      }
    };

    var wrappedErrback = function(reason) {
      try {
        return (errback || defaultErrback)(reason);
      } catch (e) {
        exceptionHandler(e);
        return reject(e);
      }
    };

    nextTick(function() {
      ref(value).then(function(value) {
        if (done) return;
        done = true;
        result.resolve(ref(value).then(wrappedCallback, wrappedErrback));
      }, function(reason) {
        if (done) return;
        done = true;
        result.resolve(wrappedErrback(reason));
      });
    });

    return result.promise;
  };


  function defaultCallback(value) {
    return value;
  }


  function defaultErrback(reason) {
    return reject(reason);
  }


  /**
   * @ngdoc
   * @name ng.$q#all
   * @methodOf ng.$q
   * @description
   * Комбинирует несколько обещаний в одно, и принимается когда все входные обещания будут выполнены.
   *
   * @param {Array.<Promise>|Object.<Promise>} promises Массив обещаний.
   * @returns {Promise} Возвращает единственное обещание, который будет принято с массивом значений, каждое 
   * из которых соответствует обещанию с тем же индексом, что и в массиве обещаний. Если любое мз
   * обещаний не выполняется, общее обещание так же будет считаться не выполненым.
   */
  function all(promises) {
    var deferred = defer(),
        counter = 0,
        results = isArray(promises) ? [] : {};

    forEach(promises, function(promise, key) {
      counter++;
      ref(promise).then(function(value) {
        if (results.hasOwnProperty(key)) return;
        results[key] = value;
        if (!(--counter)) deferred.resolve(results);
      }, function(reason) {
        if (results.hasOwnProperty(key)) return;
        deferred.reject(reason);
      });
    });

    if (counter === 0) {
      deferred.resolve(results);
    }

    return deferred.promise;
  }

  return {
    defer: defer,
    reject: reject,
    when: when,
    all: all
  };
}
