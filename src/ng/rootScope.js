'use strict';

/**
 * DESIGN NOTES
 *
 * The design decisions behind the scope are heavily favored for speed and memory consumption.
 *
 * The typical use of scope is to watch the expressions, which most of the time return the same
 * value as last time so we optimize the operation.
 *
 * Closures construction is expensive in terms of speed as well as memory:
 *   - No closures, instead use prototypical inheritance for API
 *   - Internal state needs to be stored on scope directly, which means that private state is
 *     exposed as $$____ properties
 *
 * Loop operations are optimized by using while(count--) { ... }
 *   - this means that in order to keep the same order of execution as addition we have to add
 *     items to the array at the beginning (shift) instead of at the end (push)
 *
 * Child scopes are created and removed often
 *   - Using an array would be slow since inserts in middle are expensive so we use linked list
 *
 * There are few watches then a lot of observers. This is why you don't want the observer to be
 * implemented in the same way as watch. Watch requires return of initialization function which
 * are expensive to construct.
 */


/**
 * @ngdoc object
 * @name ng.$rootScopeProvider
 * @description
 *
 * Провайдер сервиса $rootScope.
 */

/**
 * @ngdoc function
 * @name ng.$rootScopeProvider#digestTtl
 * @methodOf ng.$rootScopeProvider
 * @description 
 * Устанавливает число итераций цикла digest, в который пытается проверить область видимости перед тем
 * как решить, что модель нестабильна.
 *
 * По умолчанию 10 итераций.
 *
 * @param {number} limit Число итераций цикла digest.
 */


/**
 * @ngdoc object
 * @name ng.$rootScope
 * @description
 *
 * Каждое приложение имеет одну корневую {@link ng.$rootScope.Scope область видимости}. Все другие области  
 * являются ее потомками. Области видимости обеспечивают механизм для отслеживания изменений в модели и 
 * обработку событий жизненного цикла. См. {@link guide/scope Руководство по областям видимости}.
 */
function $RootScopeProvider(){
  var TTL = 10;

  this.digestTtl = function(value) {
    if (arguments.length) {
      TTL = value;
    }
    return TTL;
  };

  this.$get = ['$injector', '$exceptionHandler', '$parse',
      function( $injector,   $exceptionHandler,   $parse) {

    /**
     * @ngdoc function
     * @name ng.$rootScope.Scope
     *
     * @description
     * Корневая область видимости может быть возвращена с использованием ключа {@link ng.$rootScope $rootScope} 
     * из сервиса {@link AUTO.$injector $injector}. Дочерние области создаются с использованием метода 
     * {@link ng.$rootScope.Scope#$new $new()}. (Другие области создаются автоматически, при компиляции HTML-шаблона.)
     * 
     * Ниже пример кода простой области видимости, который демонстрирует взаимодействие с областью видимости.
     * <pre>
     * <file src="./test/ng/rootScopeSpec.js" tag="docs1" />
     * </pre>
     *
     * # Наследование
     * Область видимости может наследоваться от другой области, как показано в этом примере:
     * <pre>
         var parent = $rootScope;
         var child = parent.$new();

         parent.salutation = "Hello";
         child.name = "World";
         expect(child.salutation).toEqual('Hello');

         child.salutation = "Welcome";
         expect(child.salutation).toEqual('Welcome');
         expect(parent.salutation).toEqual('Hello');
     * </pre>
     *
     *
     * @param {Object.<string, function()>=} providers Набор фабричных функций сервисов, которые необходимо 
     *     задействовать для текущей области видимости. По умолчанию {@link ng}.
     * @param {Object.<string, *>=} instanceCache Представляет предварительно созданные сервисы, которыми необходимо 
     *     добавить/заменить сервисы, указанные в `providers`. Это облегчает переопределение сервисов по умолчанию 
     *     в модульном тестировании.
     * @returns {Object} Новая область видимости.
     *
     */
    function Scope() {
      this.$id = nextUid();
      this.$$phase = this.$parent = this.$$watchers =
                     this.$$nextSibling = this.$$prevSibling =
                     this.$$childHead = this.$$childTail = null;
      this['this'] = this.$root =  this;
      this.$$destroyed = false;
      this.$$asyncQueue = [];
      this.$$listeners = {};
      this.$$isolateBindings = {};
    }

    /**
     * @ngdoc property
     * @name ng.$rootScope.Scope#$id
     * @propertyOf ng.$rootScope.Scope
     * @returns {number} уникальный идентификатор области видимости (монотонно возрастающая цифровая 
     *    последовательность) обычно используемый для отладки.
     */


    Scope.prototype = {
      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$new
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Создает новую дочернюю {@link ng.$rootScope.Scope область видимости}.
       * 
       * Родительская область будет распространять {@link ng.$rootScope.Scope#$digest $digest()} и события 
       * {@link ng.$rootScope.Scope#$digest $digest()}. Область может быть удалена из иерархии используя метод 
       * {@link ng.$rootScope.Scope#$destroy $destroy()}.
       * 
       * {@link ng.$rootScope.Scope#$destroy $destroy()} должен быть вызван для области видимости и, если необходимо, 
       * для нее и ее потомков, чтобы навсегда отделить ее от родительской области, и перестать следить за 
       * изменениями, а также прослушивать события.
       *
       * @param {boolean} isolate Если установлено true, то область видимости не наследуется прототипически от 
       *         родительской области. Область видимости изолируется и не может читать свойства родительской области. 
       *         При создании виджетов это используется для, чтобы виджет не мог случайно прочитать состояние 
       *         родительской области видимости.
       * 
       *
       * @returns {Object} Новая дочерняя область видимости.
       *
       */
      $new: function(isolate) {
        var Child,
            child;

        if (isFunction(isolate)) {
          // TODO: remove at some point
          throw Error('API-CHANGE: Use $controller to instantiate controllers.');
        }
        if (isolate) {
          child = new Scope();
          child.$root = this.$root;
        } else {
          Child = function() {}; // should be anonymous; This is so that when the minifier munges
            // the name it does not become random set of chars. These will then show up as class
            // name in the debugger.
          Child.prototype = this;
          child = new Child();
          child.$id = nextUid();
        }
        child['this'] = child;
        child.$$listeners = {};
        child.$parent = this;
        child.$$watchers = child.$$nextSibling = child.$$childHead = child.$$childTail = null;
        child.$$prevSibling = this.$$childTail;
        if (this.$$childHead) {
          this.$$childTail.$$nextSibling = child;
          this.$$childTail = child;
        } else {
          this.$$childHead = this.$$childTail = child;
        }
        return child;
      },

      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$watch
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Регистрирует колбэк `listener`, который будет выполнен после изменения `watchExpression`.
       *
       * - Выражение `watchExpression` вычисляется при каждой итерации цикла 
       *   {@link ng.$rootScope.Scope#$digest $digest()} и должно возвращать значение, которое отслеживается. 
       *   (Поскольку {@link ng.$rootScope.Scope#$digest $digest()} выполняется когда обнаруживаются изменения, 
       *   выражение `watchExpression` может выполнятся несколько раз и должно быть идемпотентным.)
       * - Функция `listener` вызывается только когда текущее значение выражения `watchExpression` 
       *   и предыдущее значение этого выражения не эквивалентны (исключением является стартовое выполнение, 
       *   смотрите дальше). Эквивалентность определяется с помощью функции {@link angular.equals}. 
       *   Для сохранения значения объектов, которые в дальнейшем будут сравниваться, используется функция 
       *   {@link angular.copy}. Это также означает, что отслеживание множества свойств, будет иметь 
       *   неблагоприятные последствия для памяти и производительности.
       * - Обработка изменения подписчиком `listener` может изменять модель, в результате вновь будет вызван 
       *   обработчик `listener`. Процесс перезапуска будет продолжаться до тех пор, пока не будет обнаружено 
       *   новых изменений. Количество итераций перезапуска не может быть больше 10, для предотвращения бесконечных 
       *   циклов.
       *
       * 
       * Если нужно получать уведомления при каждом запуске {@link ng.$rootScope.Scope#$digest $digest}, можно 
       * зарегистрировать выражение `watchExpression` без подписчиков `listener`. (Т.к. `watchExpression` может 
       * выполняться несколько раз в течении цикла {@link ng.$rootScope.Scope#$digest $digest}, будьте готовы 
       * к тому, что ваш слушатель будет вызван это же количество раз.)
       * 
       * После регистрации слушателя в области видимости, функция `listener` будет вызываться асинхронно
       * (через {@link ng.$rootScope.Scope#$evalAsync $evalAsync}) при инициализации наблюдения. В редких 
       * случаях это не желательно, т.к. слушатель вызывается когда результат `watchExpression` еще не изменился. 
       * Для обнаружения этого в сценарии функции `listener`, вы может сравнивать `newVal` и `oldVal`. 
       * Если эти значения идентичны (`===`), значит слушать вызван процессом инициализации.
       *
       *
       * # Example
       * <pre>
           // давайте предположим, что зависимость область видимости $rootScope
           var scope = $rootScope;
           scope.name = 'misko';
           scope.counter = 0;

           expect(scope.counter).toEqual(0);
           scope.$watch('name', function(newValue, oldValue) { scope.counter = scope.counter + 1; });
           expect(scope.counter).toEqual(0);

           scope.$digest();
           // переменная не изменилась
           expect(scope.counter).toEqual(0);

           scope.name = 'adam';
           scope.$digest();
           expect(scope.counter).toEqual(1);
       * </pre>
       * 
       *
       *
       * @param {(function()|string)} watchExpression Выражение, которое будет вычисляться на каждой итерации цикла
       *    {@link ng.$rootScope.Scope#$digest $digest}. Если возвращаемое значение изменилось, будет вызван 
       *    слушатель `listener`.
       *
       *    - `string`: Вычисляется как {@link guide/expression выражение}
       *    - `function(scope)`: вычисляется с параметром, установленным в текущую область видимости.
       * @param {(function()|string)=} listener Колбэк, который вызывается при изменении возвращаемого значения 
       *    выражения `watchExpression`.
       *
       *    - `string`: Вычисляется как {@link guide/expression выражение}
       *    - `function(newValue, oldValue, scope)`: вычисляется с параметрами новое значение, старое значение 
       *    и текущая область видимости.
       *
       * @param {boolean=} objectEquality Поэлементное сравнение объектов/массивов, если false, то сравниваются только ссылки на объекты/массивы.
       * @returns {function()} Возвращает функцию для завершения прослушивания данного события данных слушателем.
       */
      $watch: function(watchExp, listener, objectEquality) {
        var scope = this,
            get = compileToFn(watchExp, 'watch'),
            array = scope.$$watchers,
            watcher = {
              fn: listener,
              last: initWatchVal,
              get: get,
              exp: watchExp,
              eq: !!objectEquality
            };

        // in the case user pass string, we need to compile it, do we really need this ?
        if (!isFunction(listener)) {
          var listenFn = compileToFn(listener || noop, 'listener');
          watcher.fn = function(newVal, oldVal, scope) {listenFn(scope);};
        }

        if (typeof watchExp == 'string' && get.constant) {
          var originalFn = watcher.fn;
          watcher.fn = function(newVal, oldVal, scope) {
            originalFn.call(this, newVal, oldVal, scope);
            arrayRemove(array, watcher);
          };
        }

        if (!array) {
          array = scope.$$watchers = [];
        }
        // we use unshift since we use a while loop in $digest for speed.
        // the while loop reads in reverse order.
        array.unshift(watcher);

        return function() {
          arrayRemove(array, watcher);
        };
      },


      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$watchCollection
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Поверхностно наблюдает за свойствами объекта и срабатывает при любом изменении свойств
       * (для массивов это означает наблюдение за элементами массива, для набора объектов, это означает
       * наблюдение за свойствами). Если обнаруживается изменение, то колбэк `listener` сбрасывается.
       * 
       * - Коллекция `obj` наблюдается через стандартные операции $watch, и рассматривается при каждом вызове $digest(),
       *   чтобы увидеть когда какие-либо элементы были добавлены, удалены или перемещены.
       * - `listener` вызывается всякий раз, когда что-нибудь было изменено в `obj. Примеры включают в себя 
       *   добавление новых элементов в объект или массив, удаление и перемещение файлов и папок.
       *
       *
       * # Example
       * <pre>
          $scope.names = ['igor', 'matias', 'misko', 'james'];
          $scope.dataCount = 4;

          $scope.$watchCollection('names', function(newNames, oldNames) {
            $scope.dataCount = newNames.length;
          });

          expect($scope.dataCount).toEqual(4);
          $scope.$digest();

          //с 4 ... нет изменений
          expect($scope.dataCount).toEqual(4);

          $scope.names.pop();
          $scope.$digest();

          // теперь есть изменение
          expect($scope.dataCount).toEqual(3);
       * </pre>
       *
       *
       * @param {string|Function(scope)} obj Вычисляется как {@link guide/expression выражение}. Значение выражения 
       *    следует вычислять к объекту или массиву, который наблюдается на каждом цикле
       *    {@link ng.$rootScope.Scope#$digest $digest}. Любые мелкие изменения в коллекции будет инициировать 
       *    вызов с `listener`.
       *
       * @param {function(newCollection, oldCollection, scope)} listener колбэк, срабатывающий с `newCollection` и 
       *    `oldCollection` в качестве параметров. Объект `newCollection` является недавно измененными данными, 
       *    полученными из выражения `obj` и объект `oldCollection` является копией полученных ранее данных.
       *    Область видимости относится к текущей области.
       *
       * @returns {function()} Возвращает разрегистрирующую функцию для этого слушателя. После выполнения
       * разрегистрирующей функции внутренняя работа наблюдателя прекращается.
       */
      $watchCollection: function(obj, listener) {
        var self = this;
        var oldValue;
        var newValue;
        var changeDetected = 0;
        var objGetter = $parse(obj);
        var internalArray = [];
        var internalObject = {};
        var oldLength = 0;

        function $watchCollectionWatch() {
          newValue = objGetter(self);
          var newLength, key;

          if (!isObject(newValue)) {
            if (oldValue !== newValue) {
              oldValue = newValue;
              changeDetected++;
            }
          } else if (isArray(newValue)) {
            if (oldValue !== internalArray) {
              // we are transitioning from something which was not an array into array.
              oldValue = internalArray;
              oldLength = oldValue.length = 0;
              changeDetected++;
            }

            newLength = newValue.length;

            if (oldLength !== newLength) {
              // if lengths do not match we need to trigger change notification
              changeDetected++;
              oldValue.length = oldLength = newLength;
            }
            // copy the items to oldValue and look for changes.
            for (var i = 0; i < newLength; i++) {
              if (oldValue[i] !== newValue[i]) {
                changeDetected++;
                oldValue[i] = newValue[i];
              }
            }
          } else {
            if (oldValue !== internalObject) {
              // we are transitioning from something which was not an object into object.
              oldValue = internalObject = {};
              oldLength = 0;
              changeDetected++;
            }
            // copy the items to oldValue and look for changes.
            newLength = 0;
            for (key in newValue) {
              if (newValue.hasOwnProperty(key)) {
                newLength++;
                if (oldValue.hasOwnProperty(key)) {
                  if (oldValue[key] !== newValue[key]) {
                    changeDetected++;
                    oldValue[key] = newValue[key];
                  }
                } else {
                  oldLength++;
                  oldValue[key] = newValue[key];
                  changeDetected++;
                }
              }
            }
            if (oldLength > newLength) {
              // we used to have more keys, need to find them and destroy them.
              changeDetected++;
              for(key in oldValue) {
                if (oldValue.hasOwnProperty(key) && !newValue.hasOwnProperty(key)) {
                  oldLength--;
                  delete oldValue[key];
                }
              }
            }
          }
          return changeDetected;
        }

        function $watchCollectionAction() {
          listener(newValue, oldValue, self);
        }

        return this.$watch($watchCollectionWatch, $watchCollectionAction);
      },

      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$digest
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Обрабатывает всех наблюдателей {@link ng.$rootScope.Scope#$watch watchers} для текущей области видимости и 
       * для ее дочерних областей видимости. Потому что слушатели {@link ng.$rootScope.Scope#$watch watcher} могут 
       * изменить модель, (что вновь вызовет `$digest()`) `$digest()` продолжает обработку
       * {@link ng.$rootScope.Scope#$watch watchers} до того момента, пока не отработают все слушатели. 
       * Это означает, что можно попасть в бесконечный цикл. Эта функция будет выкидывать исключение 
       * «Maximum iteration limit exceeded.» («Исчерпан лимит итераций.»), если количество итерации превышает 10.
       * 
       * Обычно нет необходимости вызывать `$digest()` в {@link ng.directive:ngController контроллерах} или в 
       * {@link ng.$compileProvider#directive директивах}. Вместо этого вызывайте 
       * {@link ng.$rootScope.Scope#$apply $apply()} (обычно из {@link ng.$compileProvider#directive директив}), 
       * которая сама вызовет `$digest()`.
       * 
       * Если необходимо получать уведомления каждый раз, когда вызывается `$digest()`, можно зарегистрировать 
       * функцию `watchExpression` с {@link ng.$rootScope.Scope#$watch $watch()} без прослушивания событий 
       * (без `listener`).
       * 
       * При необходимости можно вызвать `$digest()` внутри модульных тестов, чтобы симулировать жизненный цикл 
       * области видимости.
       *
       * # Пример
       * <pre>
           var scope = ...;
           scope.name = 'misko';
           scope.counter = 0;

           expect(scope.counter).toEqual(0);
           scope.$watch('name', function(newValue, oldValue) {
             scope.counter = scope.counter + 1;
           });
           expect(scope.counter).toEqual(0);

           scope.$digest();
           // переменная не изменилась
           expect(scope.counter).toEqual(0);

           scope.name = 'adam';
           scope.$digest();
           expect(scope.counter).toEqual(1);
       * </pre>
       *
       */
      $digest: function() {
        var watch, value, last,
            watchers,
            asyncQueue = this.$$asyncQueue,
            length,
            dirty, ttl = TTL,
            next, current, target = this,
            watchLog = [],
            logIdx, logMsg;

        beginPhase('$digest');

        do { // "while dirty" loop
          dirty = false;
          current = target;

          while(asyncQueue.length) {
            try {
              current.$eval(asyncQueue.shift());
            } catch (e) {
              $exceptionHandler(e);
            }
          }

          do { // "traverse the scopes" loop
            if ((watchers = current.$$watchers)) {
              // process our watches
              length = watchers.length;
              while (length--) {
                try {
                  watch = watchers[length];
                  // Most common watches are on primitives, in which case we can short
                  // circuit it with === operator, only when === fails do we use .equals
                  if ((value = watch.get(current)) !== (last = watch.last) &&
                      !(watch.eq
                          ? equals(value, last)
                          : (typeof value == 'number' && typeof last == 'number'
                             && isNaN(value) && isNaN(last)))) {
                    dirty = true;
                    watch.last = watch.eq ? copy(value) : value;
                    watch.fn(value, ((last === initWatchVal) ? value : last), current);
                    if (ttl < 5) {
                      logIdx = 4 - ttl;
                      if (!watchLog[logIdx]) watchLog[logIdx] = [];
                      logMsg = (isFunction(watch.exp))
                          ? 'fn: ' + (watch.exp.name || watch.exp.toString())
                          : watch.exp;
                      logMsg += '; newVal: ' + toJson(value) + '; oldVal: ' + toJson(last);
                      watchLog[logIdx].push(logMsg);
                    }
                  }
                } catch (e) {
                  $exceptionHandler(e);
                }
              }
            }

            // Insanity Warning: scope depth-first traversal
            // yes, this code is a bit crazy, but it works and we have tests to prove it!
            // this piece should be kept in sync with the traversal in $broadcast
            if (!(next = (current.$$childHead || (current !== target && current.$$nextSibling)))) {
              while(current !== target && !(next = current.$$nextSibling)) {
                current = current.$parent;
              }
            }
          } while ((current = next));

          if(dirty && !(ttl--)) {
            clearPhase();
            throw Error(TTL + ' $digest() iterations reached. Aborting!\n' +
                'Watchers fired in the last 5 iterations: ' + toJson(watchLog));
          }
        } while (dirty || asyncQueue.length);

        clearPhase();
      },


      /**
       * @ngdoc event
       * @name ng.$rootScope.Scope#$destroy
       * @eventOf ng.$rootScope.Scope
       * @eventType broadcast on scope being destroyed
       *
       * @description
       * Распространяется при уничтожении области видимости или ее потомков.
       */

      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$destroy
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Удаляет текущую область видимости (и все дочерние области видимости) из родительской области видимости. 
       * Удаление подразумевает, что вызовы метода {@link ng.$rootScope.Scope#$digest $digest()} больше не 
       * должны распространяться на текущую область видимости и на ее дочерние области. Удаление также подразумевает, 
       * что удаленные области видимости доступны для уничтожения сборщику мусора.
       * 
       * Метод `$destroy()` обычно используется в директивах, таких как {@link ng.directive:ngRepeat ngRepeat} 
       * для управления развертыванием элементов в цикле.
       * 
       * Перед удалением области видимости будет послано событие `$destroy` удаляемой области видимости и 
       * всем ее дочерним областям видимости. Код приложения может регистрировать обработчики для события 
       * `$destroy`, чтобы перед удалением можно было выполнить требуемый код очистки.
       */
      $destroy: function() {
        // we can't destroy the root scope or a scope that has been already destroyed
        if ($rootScope == this || this.$$destroyed) return;
        var parent = this.$parent;

        this.$broadcast('$destroy');
        this.$$destroyed = true;

        if (parent.$$childHead == this) parent.$$childHead = this.$$nextSibling;
        if (parent.$$childTail == this) parent.$$childTail = this.$$prevSibling;
        if (this.$$prevSibling) this.$$prevSibling.$$nextSibling = this.$$nextSibling;
        if (this.$$nextSibling) this.$$nextSibling.$$prevSibling = this.$$prevSibling;

        // This is bogus code that works around Chrome's GC leak
        // see: https://github.com/angular/angular.js/issues/1313#issuecomment-10378451
        this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead =
            this.$$childTail = null;
      },

      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$eval
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Выполняет выражение `expression` в текущей области видимости и возвращает его результат. 
       * Любые исключения, возникшие в выражении, распространяются (необработанные). Обычно используется 
       * когда нужно выполнить выражение Angular.
       *
       * # Пример
       * <pre>
           var scope = ng.$rootScope.Scope();
           scope.a = 1;
           scope.b = 2;

           expect(scope.$eval('a+b')).toEqual(3);
           expect(scope.$eval(function(scope){ return scope.a + scope.b; })).toEqual(3);
       * </pre>
       *
       * @param {(string|function())=} expression angular-выражение, которое должно быть выполнено.
       *
       *    - `string`: выполняется используя синтаксис, определенный для {@link guide/expression выражения}.
       *    - `function(scope)`: выполняется функция, параметром которой является текущая область видимости.
       *
       * @returns {*} Результат вычисления выражения.
       */
      $eval: function(expr, locals) {
        return $parse(expr)(this, locals);
      },

      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$evalAsync
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Выполняет выражение в текущей области видимости в асинхронной манере.
       *
       * `$evalAsync` гарантирует, что выражение `expression` будет выполнено только так:
       *
       *   - будет выполнено в текущем контексте выполнения скрипта (перед формированием любого DOM).
       *   - после вычисления выражения `expression` вызовется итерация цикла 
       *     {@link ng.$rootScope.Scope#$digest $digest}.
       *
       * Любое исключение, возникшее при выполнении выражения, будет передано на обработку сервису
       * {@link ng.$exceptionHandler $exceptionHandler}.
       *
       * @param {(string|function())=} expression angular-выражение, которое будет выполнено.
       *
       *    - `string`: выполняется с использование синтаксиса для {@link guide/expression выражения}.
       *    - `function(scope)`: выполняется функция с параметром, установленным в текущую область видимости.
       *
       */
      $evalAsync: function(expr) {
        this.$$asyncQueue.push(expr);
      },

      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$apply
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * `$apply()` используется для выполнения angular-выражений из кода вне angular-фреймворка. 
       * (К примеру, из обработчика события DOM в браузере, setTimeout, XHR или других библиотек). 
       * Так когда код выполняется внутри angular-фреймворка, нам нужно выполнить определенные этапы 
       * жизненного цикла области видимости, это обработка исключений, отслеживание изменений.
       *
       * ## Жизненный цикл
       *
       * # Псевдо код `$apply()`
       * <pre>
           function $apply(expr) {
             try {
               return $eval(expr);
             } catch (e) {
               $exceptionHandler(e);
             } finally {
               $root.$digest();
             }
           }
       * </pre>
       * 
       * 
       * Метод области видимости `$apply()` проходит следующие стадии:
       *
       * 1. {@link guide/expression Выражение} Выражение выполняется используя метод
       *    {@link ng.$rootScope.Scope#$eval $eval()}.
       * 2. Любые исключения возникшие при выполнении выражения передаются на обработку сервису
       *    {@link ng.$exceptionHandler $exceptionHandler}.
       * 3. Слушатели событий изменения {@link ng.$rootScope.Scope#$watch watch } будут немедлено оповещены
       *    после выполнения выражения через вызов метода {@link ng.$rootScope.Scope#$digest $digest()}.
       *
       *
       * @param {(string|function())=} exp angular-выражение для выполнения.
       *
       *    - `string`: выполняется с использование синтаксиса для {@link guide/expression выражения}.
       *    - `function(scope)`: выполняется функция с параметром, установленным в текущую область видимости.
       *
       * @returns {*} Результат вычисления выражения.
       */
      $apply: function(expr) {
        try {
          beginPhase('$apply');
          return this.$eval(expr);
        } catch (e) {
          $exceptionHandler(e);
        } finally {
          clearPhase();
          try {
            $rootScope.$digest();
          } catch (e) {
            $exceptionHandler(e);
            throw e;
          }
        }
      },

      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$on
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Подписка слушателя для события определенного типа. Смотрите {@link ng.$rootScope.Scope#$emit $emit} для 
       * понимания жизненного цикла событий.
       * 
       * Функция слушатель события имеет формат: `function(event, args...)`. Объект события `event` передается 
       * слушателю и содержит следующие атрибуты:
       *
       *   - `targetScope` - `{Scope}`: область видимости, в которой был вызван один из методов: `$emit` или `$broadcast`.
       *   - `currentScope` - `{Scope}`: текущая область видимости, в которой обрабатывается событие.
       *   - `name` - `{string}`: имя события.
       *   - `stopPropagation` - `{function=}`:  вызов функции `stopPropagation` будет отменять дальнейшее 
       *     распространение события (доступно только для событий вызванных с помощью `$emit`).
       *   - `preventDefault` - `{function}`: вызов `preventDefault` устанавливает флаг `defaultPrevented` в true.
       *   - `defaultPrevented` - `{boolean}`: true если был вызван `preventDefault`.
       *
       * @param {string} name Имя события для подписки.
       * @param {function(event, args...)} listener Функция обработчик события.
       * @returns {function()} Возвращает функцию, выполнение которой отменяет прослушивание события для текущего слушателя.
       */
      $on: function(name, listener) {
        var namedListeners = this.$$listeners[name];
        if (!namedListeners) {
          this.$$listeners[name] = namedListeners = [];
        }
        namedListeners.push(listener);

        return function() {
          namedListeners[indexOf(namedListeners, listener)] = null;
        };
      },


      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$emit
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * 
       * Отправляет событие с именем `name` вверх по всей иерархии областей видимости, уведомляя всех 
       * зарегистрированных с помощью {@link ng.$rootScope.Scope#$on} слушателей.
       * 
       * Жизненный цикл события начинается с области видимости, в которой вызван `$emit`. Все слушатели 
       * {@link ng.$rootScope.Scope#$on listeners} для события с именем `name` в этой области видимости 
       * будут извещены. После чего событие всплывает вплоть до корневой области видимости, по пути уведомляя 
       * всех зарегистрированных слушателей. Распространение события можно отменить, если один из слушателей 
       * сделает это.
       * 
       * Любое исключение, возникшее в слушателях {@link ng.$rootScope.Scope#$on listeners} будет передано 
       * сервису {@link ng.$exceptionHandler $exceptionHandler} для обработки.
       *
       * @param {string} name Имя события.
       * @param {...*} args Необязательно установленный аргумент, который будет передан внутрь обработчикам события.
       * @return {Object} Объект, представляющий событие, см. {@link ng.$rootScope.Scope#$on}
       */
      $emit: function(name, args) {
        var empty = [],
            namedListeners,
            scope = this,
            stopPropagation = false,
            event = {
              name: name,
              targetScope: scope,
              stopPropagation: function() {stopPropagation = true;},
              preventDefault: function() {
                event.defaultPrevented = true;
              },
              defaultPrevented: false
            },
            listenerArgs = concat([event], arguments, 1),
            i, length;

        do {
          namedListeners = scope.$$listeners[name] || empty;
          event.currentScope = scope;
          for (i=0, length=namedListeners.length; i<length; i++) {

            // if listeners were deregistered, defragment the array
            if (!namedListeners[i]) {
              namedListeners.splice(i, 1);
              i--;
              length--;
              continue;
            }
            try {
              namedListeners[i].apply(null, listenerArgs);
              if (stopPropagation) return event;
            } catch (e) {
              $exceptionHandler(e);
            }
          }
          //traverse upwards
          scope = scope.$parent;
        } while (scope);

        return event;
      },


      /**
       * @ngdoc function
       * @name ng.$rootScope.Scope#$broadcast
       * @methodOf ng.$rootScope.Scope
       * @function
       *
       * @description
       * Отправляет событие с именем `name` вниз, для всех дочерних областей видимости (и их дочерних тоже), 
       * уведомляя слушателей, зарегистрированных с помощью {@link ng.$rootScope.Scope#$on}.
       * 
       * Жизненный цикл события начинается в области видимости, для которой был вызван метод `$broadcast`.
       * Все слушатели {@link ng.$rootScope.Scope#$on listeners} события с именем `name` в текущей области 
       * видимости будут извещены. После этого событие распространяется на всех прямые и косвенные дочерние 
       * области видимости, по пути уведомляя о наступления события всех слушателей в них. Событие не может 
       * быть отменено.
       * 
       * Любые исключения, возникшие в обработчиках события для всех слушателей 
       * {@link ng.$rootScope.Scope#$on listeners} будут переданы на обработку сервису
       * {@link ng.$exceptionHandler $exceptionHandler}.
       *
       * @param {string} name Имя события.
       * @param {...*} args Необязательно установленный аргумент, который будет передан внутрь обработчикам события.
       * @return {Object} Объект, представляющий событие, см. {@link ng.$rootScope.Scope#$on}
       */
      $broadcast: function(name, args) {
        var target = this,
            current = target,
            next = target,
            event = {
              name: name,
              targetScope: target,
              preventDefault: function() {
                event.defaultPrevented = true;
              },
              defaultPrevented: false
            },
            listenerArgs = concat([event], arguments, 1),
            listeners, i, length;

        //down while you can, then up and next sibling or up and next sibling until back at root
        do {
          current = next;
          event.currentScope = current;
          listeners = current.$$listeners[name] || [];
          for (i=0, length = listeners.length; i<length; i++) {
            // if listeners were deregistered, defragment the array
            if (!listeners[i]) {
              listeners.splice(i, 1);
              i--;
              length--;
              continue;
            }

            try {
              listeners[i].apply(null, listenerArgs);
            } catch(e) {
              $exceptionHandler(e);
            }
          }

          // Insanity Warning: scope depth-first traversal
          // yes, this code is a bit crazy, but it works and we have tests to prove it!
          // this piece should be kept in sync with the traversal in $digest
          if (!(next = (current.$$childHead || (current !== target && current.$$nextSibling)))) {
            while(current !== target && !(next = current.$$nextSibling)) {
              current = current.$parent;
            }
          }
        } while ((current = next));

        return event;
      }
    };

    var $rootScope = new Scope();

    return $rootScope;


    function beginPhase(phase) {
      if ($rootScope.$$phase) {
        throw Error($rootScope.$$phase + ' already in progress');
      }

      $rootScope.$$phase = phase;
    }

    function clearPhase() {
      $rootScope.$$phase = null;
    }

    function compileToFn(exp, name) {
      var fn = $parse(exp);
      assertArgFn(fn, name);
      return fn;
    }

    /**
     * function used as an initial value for watchers.
     * because it's unique we can easily tell it apart from other values
     */
    function initWatchVal() {}
  }];
}
