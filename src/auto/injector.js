'use strict';

/**
 * @ngdoc function
 * @name angular.injector
 * @function
 *
 * @description
 * Создает функцию инжектор, которая будет использоваться для извлечения сервисов при 
 * инъекциях зависимости (см. {@link guide/di инъекция зависимости}).
 *

 * @param {Array.<string|Function>} modules Список функций модулей или их псевдонимов. См. {@link angular.module}
 *        Модуль `ng` будет добавлен по умолчанию.
 * @returns {function()} Функция инжектор. См. {@link AUTO.$injector $injector}.
 *
 * @example
 * Typical usage
 * <pre>
 *   // создание инжектора
 *   var $injector = angular.injector(['ng']);
 *
 *   // используйте инжектор для старта вашего приложения
 *   // для автоматической инъекции зависимостей или явно
 *   $injector.invoke(function($rootScope, $compile, $document){
 *     $compile($document)($rootScope);
 *     $rootScope.$digest();
 *   });
 * </pre>
 */


/**
 * @ngdoc overview
 * @name AUTO
 * @description
 *
 * Неявный модуль, который автоматически добавляется к каждому {@link AUTO.$injector $injector}.
 */

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function annotate(fn) {
  var $inject,
      fnText,
      argDecl,
      last;

  if (typeof fn == 'function') {
    if (!($inject = fn.$inject)) {
      $inject = [];
      fnText = fn.toString().replace(STRIP_COMMENTS, '');
      argDecl = fnText.match(FN_ARGS);
      forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg){
        arg.replace(FN_ARG, function(all, underscore, name){
          $inject.push(name);
        });
      });
      fn.$inject = $inject;
    }
  } else if (isArray(fn)) {
    last = fn.length - 1;
    assertArgFn(fn[last], 'fn')
    $inject = fn.slice(0, last);
  } else {
    assertArgFn(fn, 'fn', true);
  }
  return $inject;
}

///////////////////////////////////////

/**
 * @ngdoc object
 * @name AUTO.$injector
 * @function
 *
 * @description
 *
 * `$injector` используется для извлечения экземпляров объектов как определено в {@link AUTO.$provide provider},
 * создания типов, вызова методов и загрузки модулей.
 *
 * Следующий код всегда выполнится успешно:
 *
 * <pre>
 *   var $injector = angular.injector();
 *   expect($injector.get('$injector')).toBe($injector);
 *   expect($injector.invoke(function($injector){
 *     return $injector;
 *   }).toBe($injector);
 * </pre>
 *
 * # Запись функции для инъекции
 *
 * JavaScript не имеет нотаций, но нотации нужны для инъекции зависимостей. Ниже показаны все допустимые 
 * способы нотаций функций для инъекции аргументов. Эти способы эквивалентны.
 *
 * <pre>
 *   // выведением (работает только если код не минифицирован / обфусцирован)
 *   $injector.invoke(function(serviceA){});
 *
 *   // нотацией
 *   function explicit(serviceA) {};
 *   explicit.$inject = ['serviceA'];
 *   $injector.invoke(explicit);
 *
 *   // в одну строку
 *   $injector.invoke(['serviceA', function(serviceA){}]);
 * </pre>
 *
 * ## Вывод
 *
 * В JavaScript вызов `toString()` для функции возвращает ее определение. Это определение можно разобрать 
 * и извлечь аргументы. **Примечание:** Это не работает с минификацией кода и обфрускацией, т.к. эти 
 * инструменты меняют названия переменных.
 *
 * ## Запись `$inject`
 * Параметры могут быть заданы путем добавления `$inject` в функцию инъекции.
 *
 * ## В одну строку
 * В этом случае передается массив и именами для инъекции, в котором последним элементом является выполняемая функция.
 */

/**
 * @ngdoc method
 * @name AUTO.$injector#get
 * @methodOf AUTO.$injector
 *
 * @description
 * Возвращает экземпляр сервиса
 *
 * @param {string} name Имя, по которому ищется экземпляр.
 * @return {*} Экземпляр.
 */

/**
 * @ngdoc method
 * @name AUTO.$injector#invoke
 * @methodOf AUTO.$injector
 *
 * @description
 * Вызывает метод и предоставляет ему аргументы с помощью сервиса `$injector`.
 *
 * @param {!function} fn Функция для вызова. Аргументы функции должны иметь допустимую нотацию.
 * @param {Object=} self Контекст `this` для вызываемого метода.
 * @param {Object=} locals Необязательный объект. Если предоставлен, тогда перед тем как вызвать `$injector`, 
 *     аргументы для метода будут искаться в одноименных свойствах этого объекта.
 * @returns {*} значение, которое возвращает вызываемая функция.
 */

/**
 * @ngdoc method
 * @name AUTO.$injector#instantiate
 * @methodOf AUTO.$injector
 * @description
 * Создает новый экземпляр типа JS. Этот метод вызывает функцию конструктора оператором new, и снабжает ее всеми 
 * аргументами, которые указаны в нотации.
 *
 * @param {function} Type нотация функции конструктора.
 * @param {Object=} locals Необязательный объект. Если предоставлен, тогда любые аргументы, перед тем как вызвать 
 *    `$injector`, сначала ищутся в одноименном свойстве этого объекта.
 * @returns {Object} новый экземпляр указанного типа.
 */

/**
 * @ngdoc method
 * @name AUTO.$injector#annotate
 * @methodOf AUTO.$injector
 *
 * @description
 * Возвращает массив имен сервисов, которые функция запрашивает для инъекции. Это API используется для указания, 
 * какие сервисы нужны для инъекции в функцию для ее выполнения. Есть три способа, как функция должна 
 *
 * # Имена аргументов
 *
 * Простая форма при которой зависимости извлекаются из аргументов функции. Это делается с помощью преобразования
 * функции в строку используя метод `toString()` и извлечения имен переменных.
 * <pre>
 *   // Получаем
 *   function MyController($scope, $route) {
 *     // ...
 *   }
 *
 *   // Затем
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * </pre>
 *
 * Этот метод не работает когда применяется минификация / обфрускация. Это поддерживается следующими способами 
 * аннотации.
 *
 * # Свойство `$inject`
 *
 * Если функция имеет свойство `$inject` и его значением является массив строк, тогда строки будут 
 * интерпретироваться как имена сервисов для инъекции в функцию.
 * <pre>
 *   // Получаем
 *   var MyController = function(obfuscatedScope, obfuscatedRoute) {
 *     // ...
 *   }
 *   // Определяем зависимости функции
 *   MyController.$inject = ['$scope', '$route'];
 *
 *   // Проверяем
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * </pre>
 *
 * # Нотация в виде массива
 *
 * Часто желательно в одной строке определять функцию с зависимостями, и тогда использование свойства `$inject`
 * не очень удобно. В этом случае следует использовать нотацию с массивом, что не страдает при минификации 
 * и часто является лучшим выбором:
 *
 * <pre>
 *   // Мы можем написать так (не безопасно для minification / obfuscation)
 *   injector.invoke(function($compile, $rootScope) {
 *     // ...
 *   });
 *
 *   // Вынуждены написать, сломав строку
 *   var tmpFn = function(obfuscatedCompile, obfuscatedRootScope) {
 *     // ...
 *   };
 *   tmpFn.$inject = ['$compile', '$rootScope'];
 *   injector.invoke(tmpFn);
 *
 *   // Для более удобной работы поддерживается нотации в одну строку
 *   injector.invoke(['$compile', '$rootScope', function(obfCompile, obfRootScope) {
 *     // ...
 *   }]);
 *
 *   // Поэтому
 *   expect(injector.annotate(
 *      ['$compile', '$rootScope', function(obfus_$compile, obfus_$rootScope) {}])
 *    ).toEqual(['$compile', '$rootScope']);
 * </pre>
 *
 * @param {function|Array.<string|Function>} fn Функция, для которой нужны имена сервисов, от которых она 
 *    зависит, для их извлечения в дальнейшем.
 *
 * @returns {Array.<string>} Имена сервисов, которые требуются функции.
 */




/**
 * @ngdoc object
 * @name AUTO.$provide
 *
 * @description
 * 
 * Сервис `$provide` регистрирует новых провайдеров для `$injector`. Провайдеры, это фабрики для создания 
 * экземпляров. Провайдеры разделяют имена с экземплярами и именуются с использованием суффикса `Provider`.
 * 
 * Объект провайдера имеет метод `$get()`. Инжектор вызывает метод `$get` для создания нового экземпляра 
 * сервиса. Провайдер может иметь дополнительные методы, которые позволяют его настраивать.
 *
 * <pre>
 *   function GreetProvider() {
 *     var salutation = 'Hello';
 *
 *     this.salutation = function(text) {
 *       salutation = text;
 *     };
 *
 *     this.$get = function() {
 *       return function (name) {
 *         return salutation + ' ' + name + '!';
 *       };
 *     };
 *   }
 *
 *   describe('Greeter', function(){
 *
 *     beforeEach(module(function($provide) {
 *       $provide.provider('greet', GreetProvider);
 *     });
 *
 *     it('should greet', inject(function(greet) {
 *       expect(greet('angular')).toEqual('Hello angular!');
 *     }));
 *
 *     it('should allow configuration of salutation', function() {
 *       module(function(greetProvider) {
 *         greetProvider.salutation('Ahoj');
 *       });
 *       inject(function(greet) {
 *         expect(greet('angular')).toEqual('Ahoj angular!');
 *       });
 *     )};
 *
 *   });
 * </pre>
 */

/**
 * @ngdoc method
 * @name AUTO.$provide#provider
 * @methodOf AUTO.$provide
 * @description
 *
 * Регистрирует провайдер для сервиса. Провайдеры могут извлекаться и могут иметь дополнительные методы для настройки.
 *
 * @param {string} name Имя экземпляра. Примечание: провайдер будет доступен через `name` + 'Provider'.
 * @param {(Object|function())} provider Если это:
 *
 *   - `Object`: который должен иметь метод `$get`. Метод `$get` будет вызываться используя 
 *               {@link AUTO.$injector#invoke $injector.invoke()}, когда нужно создать экземпляр.
 *   - `Constructor`: новый экземпляр провайдера будет создан используя
 *               {@link AUTO.$injector#instantiate $injector.instantiate()}, который рассматривается как `object`..
 *
 * @returns {Object} зарегистрированный экземпляр провайдера
 */

/**
 * @ngdoc method
 * @name AUTO.$provide#factory
 * @methodOf AUTO.$provide
 * @description
 *
 * Короткая запись для конфигурации сервиса, если требуется только метод `$get`.
 *
 * @param {string} name Имя экземпляра.
 * @param {function()} $getFn Функция $getFn для создания экземпляра. Внутри это преобразуется в 
 *          `$provide.provider(name, {$get: $getFn})`.
 * @returns {Object} зарегистрированный экземпляр провайдера
 */


/**
 * @ngdoc method
 * @name AUTO.$provide#service
 * @methodOf AUTO.$provide
 * @description
 *
 * Короткая запись для регистрации службы данного класса.
 *
 * @param {string} name Имя экземпляра.
 * @param {Function} constructor Класс (конструктор), экземпляр которого создается.
 * @returns {Object} зарегистрированный экземпляр провайдера
 */


/**
 * @ngdoc method
 * @name AUTO.$provide#value
 * @methodOf AUTO.$provide
 * @description
 *
 * Короткая запись для настройки сервисов, если метод `$get` является константой.
 *
 * @param {string} name Имя экземпляра.
 * @param {*} value Значение.
 * @returns {Object} зарегистрированный экземпляр провайдера
 */


/**
 * @ngdoc method
 * @name AUTO.$provide#constant
 * @methodOf AUTO.$provide
 * @description
 *
 * Значение константы, но в отличии от {@link AUTO.$provide#value value} может быть использовано в 
 * конфигурационной функции (других модулей) и оно не перехватывается {@link AUTO.$provide#decorator decorator}.
 *
 * @param {string} name Имя константы.
 * @param {*} value Значение константы.
 * @returns {Object} зарегистрированный экземпляр
 */


/**
 * @ngdoc method
 * @name AUTO.$provide#decorator
 * @methodOf AUTO.$provide
 * @description
 *
 * Декоратор для сервиса позволяет перехватывать создание экземпляра сервиса. Возвращаемый экземпляр может 
 * быть оригинальным экземпляром или новым экземпляром, который делегирует работу оригинальному экземпляру.
 *
 * @param {string} name Имя сервиса декоратора.
 * @param {function()} decorator Эта функция будет вызвана, когда необходимо создать требуемый сервис.
 *    Эта функция вычисляется с помощью метода @link AUTO.$injector#invoke injector.invoke} и соответственно
 *    поддерживает все возможности внедрения зависимостей. Локально внедряемые аргументы:
 *
 *    * `$delegate` - Экземпляр оригинального сервиса, для которого нужно изменить api, настроить, применить 
 *      паттерн декоратор, или просто вернуть его.
 */


function createInjector(modulesToLoad) {
  var INSTANTIATING = {},
      providerSuffix = 'Provider',
      path = [],
      loadedModules = new HashMap(),
      providerCache = {
        $provide: {
            provider: supportObject(provider),
            factory: supportObject(factory),
            service: supportObject(service),
            value: supportObject(value),
            constant: supportObject(constant),
            decorator: decorator
          }
      },
      providerInjector = (providerCache.$injector =
          createInternalInjector(providerCache, function() {
            throw Error("Unknown provider: " + path.join(' <- '));
          })),
      instanceCache = {},
      instanceInjector = (instanceCache.$injector =
          createInternalInjector(instanceCache, function(servicename) {
            var provider = providerInjector.get(servicename + providerSuffix);
            return instanceInjector.invoke(provider.$get, provider);
          }));


  forEach(loadModules(modulesToLoad), function(fn) { instanceInjector.invoke(fn || noop); });

  return instanceInjector;

  ////////////////////////////////////
  // $provider
  ////////////////////////////////////

  function supportObject(delegate) {
    return function(key, value) {
      if (isObject(key)) {
        forEach(key, reverseParams(delegate));
      } else {
        return delegate(key, value);
      }
    }
  }

  function provider(name, provider_) {
    if (isFunction(provider_) || isArray(provider_)) {
      provider_ = providerInjector.instantiate(provider_);
    }
    if (!provider_.$get) {
      throw Error('Provider ' + name + ' must define $get factory method.');
    }
    return providerCache[name + providerSuffix] = provider_;
  }

  function factory(name, factoryFn) { return provider(name, { $get: factoryFn }); }

  function service(name, constructor) {
    return factory(name, ['$injector', function($injector) {
      return $injector.instantiate(constructor);
    }]);
  }

  function value(name, value) { return factory(name, valueFn(value)); }

  function constant(name, value) {
    providerCache[name] = value;
    instanceCache[name] = value;
  }

  function decorator(serviceName, decorFn) {
    var origProvider = providerInjector.get(serviceName + providerSuffix),
        orig$get = origProvider.$get;

    origProvider.$get = function() {
      var origInstance = instanceInjector.invoke(orig$get, origProvider);
      return instanceInjector.invoke(decorFn, null, {$delegate: origInstance});
    };
  }

  ////////////////////////////////////
  // Module Loading
  ////////////////////////////////////
  function loadModules(modulesToLoad){
    var runBlocks = [];
    forEach(modulesToLoad, function(module) {
      if (loadedModules.get(module)) return;
      loadedModules.put(module, true);
      if (isString(module)) {
        var moduleFn = angularModule(module);
        runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);

        try {
          for(var invokeQueue = moduleFn._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
            var invokeArgs = invokeQueue[i],
                provider = providerInjector.get(invokeArgs[0]);

            provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
          }
        } catch (e) {
          if (e.message) e.message += ' from ' + module;
          throw e;
        }
      } else if (isFunction(module)) {
        try {
          runBlocks.push(providerInjector.invoke(module));
        } catch (e) {
          if (e.message) e.message += ' from ' + module;
          throw e;
        }
      } else if (isArray(module)) {
        try {
          runBlocks.push(providerInjector.invoke(module));
        } catch (e) {
          if (e.message) e.message += ' from ' + String(module[module.length - 1]);
          throw e;
        }
      } else {
        assertArgFn(module, 'module');
      }
    });
    return runBlocks;
  }

  ////////////////////////////////////
  // internal Injector
  ////////////////////////////////////

  function createInternalInjector(cache, factory) {

    function getService(serviceName) {
      if (typeof serviceName !== 'string') {
        throw Error('Service name expected');
      }
      if (cache.hasOwnProperty(serviceName)) {
        if (cache[serviceName] === INSTANTIATING) {
          throw Error('Circular dependency: ' + path.join(' <- '));
        }
        return cache[serviceName];
      } else {
        try {
          path.unshift(serviceName);
          cache[serviceName] = INSTANTIATING;
          return cache[serviceName] = factory(serviceName);
        } finally {
          path.shift();
        }
      }
    }

    function invoke(fn, self, locals){
      var args = [],
          $inject = annotate(fn),
          length, i,
          key;

      for(i = 0, length = $inject.length; i < length; i++) {
        key = $inject[i];
        args.push(
          locals && locals.hasOwnProperty(key)
          ? locals[key]
          : getService(key)
        );
      }
      if (!fn.$inject) {
        // this means that we must be an array.
        fn = fn[length];
      }


      // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
      switch (self ? -1 : args.length) {
        case  0: return fn();
        case  1: return fn(args[0]);
        case  2: return fn(args[0], args[1]);
        case  3: return fn(args[0], args[1], args[2]);
        case  4: return fn(args[0], args[1], args[2], args[3]);
        case  5: return fn(args[0], args[1], args[2], args[3], args[4]);
        case  6: return fn(args[0], args[1], args[2], args[3], args[4], args[5]);
        case  7: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        case  8: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
        case  9: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
        case 10: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
        default: return fn.apply(self, args);
      }
    }

    function instantiate(Type, locals) {
      var Constructor = function() {},
          instance, returnedValue;

      Constructor.prototype = (isArray(Type) ? Type[Type.length - 1] : Type).prototype;
      instance = new Constructor();
      returnedValue = invoke(Type, instance, locals);

      return isObject(returnedValue) ? returnedValue : instance;
    }

    return {
      invoke: invoke,
      instantiate: instantiate,
      get: getService,
      annotate: annotate
    };
  }
}
