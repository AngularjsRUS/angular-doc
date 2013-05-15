'use strict';

/**
 * @ngdoc interface
 * @name angular.Module
 * @description
 *
 * Интерфейс для настройки {@link angular.module модулей} Angular.
 */

function setupModuleLoader(window) {

  function ensure(obj, name, factory) {
    return obj[name] || (obj[name] = factory());
  }

  return ensure(ensure(window, 'angular', Object), 'module', function() {
    /** @type {Object.<string, angular.Module>} */
    var modules = {};

    /**
     * @ngdoc function
     * @name angular.module
     * @description
     * 
     * `Angular.module` это глобальное место для создания и регистрации angular-модулей. Все модули 
     * (из ядра Angular или сторонние), которые должны быть доступны в приложении должны быть зарегистрированы 
     * с использованием этого механизма.
     * 
     * # Модуль
     * 
     * Модуль представляет собой набор сервисов, директив, фильтров и информацию о конфигурации. Модуль 
     * используется для настройки {@link AUTO.$injector $injector}.
     *
     * <pre>
     * // Создание нового модуля
     * var myModule = angular.module('myModule', []);
     *
     * // регистрация нового сервиса
     * myModule.value('appName', 'MyCoolApp');
     *
     * // настройка существующих сервисов внутри блоков инициализации.
     * myModule.config(function($locationProvider) {
     *   // настройка существующих провайдеров
     *   $locationProvider.hashPrefix('!');
     * });
     * </pre>
     *
     * Затем можно создать инжектором и загрузить модули следующим образом:
     *
     * <pre>
     * var injector = angular.injector(['ng', 'MyModule'])
     * </pre>
     *
     * Однако более вероятно, что вы будете просто использовать
     * {@link ng.directive:ngApp ngApp} или
     * {@link angular.bootstrap} для облегчения процесса.
     *
     * @param {!string} name Имя модуля для создания или восстановления.
     * @param {Array.<string>=} requires Если задано, то новый модуль создается. Если не задано, то модуль 
     *        будет восстановлен в дальнейшей конфигурации.
     * @param {Function} configFn Не обязательная функция настройки для модуля. Такая как
     *        {@link angular.Module#config Module#config()}.
     * @returns {module} новый модуль с {@link angular.Module} api.
     */
    return function module(name, requires, configFn) {
      if (requires && modules.hasOwnProperty(name)) {
        modules[name] = null;
      }
      return ensure(modules, name, function() {
        if (!requires) {
          throw Error('No module: ' + name);
        }

        /** @type {!Array.<Array.<*>>} */
        var invokeQueue = [];

        /** @type {!Array.<Function>} */
        var runBlocks = [];

        var config = invokeLater('$injector', 'invoke');

        /** @type {angular.Module} */
        var moduleInstance = {
          // Private state
          _invokeQueue: invokeQueue,
          _runBlocks: runBlocks,

          /**
           * @ngdoc property
           * @name angular.Module#requires
           * @propertyOf angular.Module
           * @returns {Array.<string>} Список всех модулей, которые инжектор будет загружать перед загрузкой текущего модуля.
           * @description
           * Список имен модулей, которые должны быть загружены перед текущим модулем.
           */
          requires: requires,

          /**
           * @ngdoc property
           * @name angular.Module#name
           * @propertyOf angular.Module
           * @returns {string} Имя модуля
           * @description
           */
          name: name,


          /**
           * @ngdoc method
           * @name angular.Module#provider
           * @methodOf angular.Module
           * @param {string} name Имя сервиса
           * @param {Function} providerType Конструктор для создания нового экземпляра сервиса.
           * @description
           * См. {@link AUTO.$provide#provider $provide.provider()}.
           */
          provider: invokeLater('$provide', 'provider'),

          /**
           * @ngdoc method
           * @name angular.Module#factory
           * @methodOf angular.Module
           * @param {string} name Имя сервиса
           * @param {Function} providerFunction Конструктор для создания нового экземпляра сервиса.
           * @description
           * See {@link AUTO.$provide#factory $provide.factory()}.
           */
          factory: invokeLater('$provide', 'factory'),

          /**
           * @ngdoc method
           * @name angular.Module#service
           * @methodOf angular.Module
           * @param {string} name Имя сервиса
           * @param {Function} constructor Конструктор, экземпляр которого будет создан
           * @description
           * См. {@link AUTO.$provide#service $provide.service()}.
           */
          service: invokeLater('$provide', 'service'),

          /**
           * @ngdoc method
           * @name angular.Module#value
           * @methodOf angular.Module
           * @param {string} name Имя сервиса
           * @param {*} object Экземпляр объекта сервиса
           * @description
           * См. {@link AUTO.$provide#value $provide.value()}.
           */
          value: invokeLater('$provide', 'value'),

          /**
           * @ngdoc method
           * @name angular.Module#constant
           * @methodOf angular.Module
           * @param {string} name Имя константы
           * @param {*} object Значение константы.
           * @description
           * Так как константы являются фиксированными значениями, они устанавливаются перед выполнением 
           * других методов. См. {@link AUTO.$provide#constant $provide.constant()}.
           */
          constant: invokeLater('$provide', 'constant', 'unshift'),

          /**
           * @ngdoc method
           * @name angular.Module#animation
           * @methodOf angular.Module
           * @param {string} name Имя анимации
           * @param {Function} animationFactory Фабричная функция для создания нового экземпляра анимации.
           * @description
           *
           * Определяет привязку анимации, которая в дальнейшем может использоваться с
           * {@link ng.directive:ngAnimate ngAnimate} наряду с обычными 
           * {@link ng.directive:ngAnimate#Description ng директивами}, а также пользовательскими директивами.
           * 
           * <pre>
           * module.animation('animation-name', function($inject1, $inject2) {
           *   return {
           *     //вызывается во время подготовки к запуску анимации
           *     setup : function(element) { ... },
           *
           *     //вызывается один раз во время выполнения анимации
           *     start : function(element, done, memo) { ... }
           *   }
           * })
           * </pre>
           *
           * См. {@link ng.$animationProvider#register $animationProvider.register()} и
           * {@link ng.directive:ngAnimate ngAnimate} для большей информации.
           */
          animation: invokeLater('$animationProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#filter
           * @methodOf angular.Module
           * @param {string} name Имя фильтра.
           * @param {Function} filterFactory Фабричная функция для создания нового экземпляра фильтра.
           * @description
           * См. {@link ng.$filterProvider#register $filterProvider.register()}.
           */
          filter: invokeLater('$filterProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#controller
           * @methodOf angular.Module
           * @param {string} name Имя контроллера.
           * @param {Function} constructor Конструктор контроллера.
           * @description
           * См.{@link ng.$controllerProvider#register $controllerProvider.register()}.
           */
          controller: invokeLater('$controllerProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#directive
           * @methodOf angular.Module
           * @param {string} name Имя директивы.
           * @param {Function} directiveFactory Фабричная функция для создания нового экземпляра директивы.
           * @description
           * См. {@link ng.$compileProvider#directive $compileProvider.directive()}.
           */
          directive: invokeLater('$compileProvider', 'directive'),

          /**
           * @ngdoc method
           * @name angular.Module#config
           * @methodOf angular.Module
           * @param {Function} configFn Эта функция выполняется во время загрузки модуля. Обычно используется 
           *    для конфигурации сервиса.
           * @description
           * Используйте этот метод для регистрации работы, которую нужно сделать во время загрузки модулю.
           */
          config: config,

          /**
           * @ngdoc method
           * @name angular.Module#run
           * @methodOf angular.Module
           * @param {Function} initializationFn Эта функция выполнится после создания инжектора. Используется 
           *    для инициализации приложения.
           * @description
           * Используйте этот метод для регистрации работы, которую нужно сделать когда инжектор загрузит все модули.
           */
          run: function(block) {
            runBlocks.push(block);
            return this;
          }
        };

        if (configFn) {
          config(configFn);
        }

        return  moduleInstance;

        /**
         * @param {string} provider
         * @param {string} method
         * @param {String=} insertMethod
         * @returns {angular.Module}
         */
        function invokeLater(provider, method, insertMethod) {
          return function() {
            invokeQueue[insertMethod || 'push']([provider, method, arguments]);
            return moduleInstance;
          }
        }
      });
    };
  });

}
