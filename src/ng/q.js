'use strict';

/**
 * @ngdoc service
 * @name ng.$q
 * @requires $rootScope
 *
 * @description
 * Это promise/deferred реализация, навеяная [Q Криса Коваля](https://github.com/kriskowal/q). 
 * 
 * [The CommonJS Promise proposal](http://wiki.commonjs.org/wiki/Promises) описывает promise как интерфейс 
 * для взаимодействия с объектом, который предоставляет результат своих действий в асинхронной манере, 
 * и может в момент взаимодействия быть еще неопределенным.
 * 
 * С точки зрения борьбы с ошибками, deferred и promise API ключевые слова `try`, `catch` и `throw` 
 * программируются асинхронно даже в синхронном программах.
 *
 * <pre>
 *   // для целей этого примера, посмотрите применение переменных `$q` и `scope`,
 *   // доступных в текущей области видимости (они должны быть инъекцированы или вставлены в нее).
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
 * Не очевидно, для чего это нужно и зачем так усложнять код. Выигрыш появляется в результате [гарантий 
 * выполнения promise и deferred API](https://github.com/kriskowal/uncommonjs/blob/master/promises/specification.md).
 * 
 * Дополнительно promise api позволяет использовать композицию, что очень трудно сделать с традиционным
 * подходом ([CPS](http://en.wikipedia.org/wiki/Continuation-passing_style)) к колбэкам. Для большей информации
 * смотрите [документацию по Q](https://github.com/kriskowal/q), особенно раздел о последовательном 
 * и параллельном присоединении promise.
 * 
 *
 * # The Deferred API
 *
 * Новый экземпляр объекта deferred создается вызовом функции `$q.defer()`.
 * 
 * Цель объекта deferred используя ассоциированный экземплят Promise уведомить об успешном или нет 
 * завершении асинхронной задачи.
 *
 * **Методы**
 *
 * - `resolve(value)` – разрешает производный promise значением `value`. Если значение `value` отвергнуто
 *   с помощью конструктора `$q.reject`, promise будет отвергнут.
 * - `reject(reason)` – отвергает производный promise с указанием причины `reason`. Это эквивалентно разрешению
 *   с использованием конструктора `$q.reject`.
 *
 * **Свойства**
 *
 * - promise – `{Promise}` – объект promise ассоциированный с deferred.
 *
 *
 * # Promise API
 *
 * Новый экземпляр promise создается когда создается экземпляр объекта и может извлекаться с помощью 
 * метода `deferred.promise`.
 * 
 * Целью объекта promise является позволить заинтересованным объектам получить доступ к результату отложенной
 * (deferred) задаче, когда она закончится.
 * 
 * **Методы**
 *
 * - `then(successCallback, errorCallback)` – независимо от того, когда promise было или будет разрешено 
 *   или отвергнуто, выполнится один из колбэков, как только результат станет доступным. В колбэк 
 *   передается один аргумент – результат или причина неудачи.
 *
 *   Этот метод *возвращает новый promise*, который разрешается или отвергается с возвращаемым значением 
 *   для `successCallback` или `errorCallback`.
 * 
 *
 * # Цепочки promise
 *
 * Потому что вызов `then` возвращает новый отложенный promise, это позволяет легко создавать цепочку из promise:
 *
 * <pre>
 *   promiseB = promiseA.then(function(result) {
 *     return result + 1;
 *   });
 *
 *   // promiseB будет разрешен после разрешения promiseA и его значением будет
 *   // результат promiseA увеличенный на 1
 * </pre>
 *
 * Это позволяет создавать цепочки из любого количества promise которые могут разрешаться другими
 * promise (каждый отложит свое разрешение), это позволяет установить паузу/отложить определение 
 * promise в любой части цепочки. Это делает простым реализацию полного api для перехватчика ответов 
 * $http.
 *
 *
 * # Различия между Q Криса Ковала и $q
 *
 *  Они имеют три главных отличия:
 *
 * - $q интегрирован с {@link ng.$rootScope.Scope} Модель области видимости имеет механизм наблюдения, 
 *   что означает быстрое распространение разрешения или отказа в вашу модель, избегая ненужных 
 *   перерисовок в браузере, что привело бы к мерцанию пользовательского интерфейса.
 * - $q promise признаются движком шаблонов в Angular, что означает, что в шаблонах вы можете использовать 
 *   promise в области видимости, так, как будто это результирующие значения.
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
 *      // Симуляция разрешения для promise
 *      deferred.resolve(123);
 *      // Заметьте, что функция 'then' не вызывается синхронно.
 *      // Это потому, что мы хотим чтобы promise API всегда работало асинхронно,
 *      // не зависимо от синхронного или асинхронного вызова.
 *      expect(resolvedValue).toBeUndefined();
 * 
 *      // Распространение promise разрешений функцией 'then' используя $apply().
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
   * Создает объект `Deferred` который представляет задачу, которая будет завершена в будущем.
   *
   * @returns {Deferred} Возвращает новый экземпляр объекта deferred.
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
   * Создает promise с состоянием отвергнут с указанием причины этого reason. Это будет отвергать всю 
   * вышестоящую цепочку promise. Если в отвергните последний promise в цепочке, вам не нужно делать
   * это для остальных.
   * 
   * Если сравнивать deferred/promise с поведением обработки ошибок try/catch/throw, тогда reject это
   * как ключевое слово throw в JavaScript. Это также означает, что если вы «ловите» ошибку через 
   * колбэк promise и вы хотите переслать ошибку из текущего другому promise, вы используете повторный 
   * вызов «throw» , а здесь возврат ошибки построен через вызов reject.
   * 
   *
   * <pre>
   *   promiseB = promiseA.then(function(result) {
   *     // success: сделать что-то и разрешить promiseB
   *     //          со старым или новым результатом
   *     return result;
   *   }, function(reason) {
   *     // error: обработка ошибки, если получилось обработать,
   *     //        разрешаем promiseB с newPromiseOrValue,
   *     //        иначе передаем отклонено в promiseB
   *     if (canHandle(reason)) {
   *      // обработка ошибок и востановление
   *      return newPromiseOrValue;
   *     }
   *     return $q.reject(reason);
   *   });
   * </pre>
   *
   * @param {*} reason Константа, сообщение, исключение или любой другой объект, объясняющий причину отказа.
   * @returns {Promise} Возвращает promise разрешенный отказом с причиной `reason`.
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
   * Обертывает объект, который может стать значением или возможно promise в $q promise. Это полезно, 
   * когда вы имеете дело с объектом, которое может быть или не быть promise, или если promise исходит 
   * от источника, которому нет доверия.
   *
   * @param {*} value Значение или обещание (promise)
   * @returns {Promise} возвращает promise для переданного значения или promise
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
   * Комбинирует несколько promise в один promise, и разрешается когда все входные promise будут разрешены.
   *
   * @param {Array.<Promise>|Object.<Promise>} promises Массив объектов promise.
   * @returns {Promise} Возвращает единственный promise, который будет разрешен с массивом значений, каждое 
   * значение которого соответствует promise с тем же индексом, что и в массиве promises. Если любой из
   * promise будет отвергнут, результат общего promise также будет отвергнут.
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
