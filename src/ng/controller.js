'use strict';

/**
 * @ngdoc object
 * @name ng.$controllerProvider
 * @description
 * Сервис {@link ng.$controller $controller} используется Angular'ом для создания новых
 * контроллеров.
 *
 * Этот провайдер позволяет контроллеру регистрироваться с помощью метода
 * {@link ng.$controllerProvider#register register}.
 */
function $ControllerProvider() {
  var controllers = {};


  /**
   * @ngdoc function
   * @name ng.$controllerProvider#register
   * @methodOf ng.$controllerProvider
   * @param {string} name Имя контроллера
   * @param {Function|Array} constructor Конструктор контроллера (опционально представленный в виде DI аннотации
   *    в виде массива).
   */
  this.register = function(name, constructor) {
    if (isObject(name)) {
      extend(controllers, name)
    } else {
      controllers[name] = constructor;
    }
  };


  this.$get = ['$injector', '$window', function($injector, $window) {

    /**
     * @ngdoc function
     * @name ng.$controller
     * @requires $injector
     *
     * @param {Function|string} constructor Если это функция, то считается что это конструктор контроллера. 
     *    В противном случае, считается что это строка, которая будет использоваться для извлечения 
     *    конструктора контроллера, используя следующие шаги:
     *
     *    * проверяет, зарегистрирован ли контроллер с нужным именем через сервис `$controllerProvider`
     *    * проверяет, есть ли в текущей области видимости свойство с требуемым именем, которое возвращает конструктор
     *    * проверяет `window[constructor]` в глобальном объекте `window`
     *
     * @param {Object} locals Зависимости внедряемые в контроллер.
     * @return {Object} Экземпляр требуемого контроллера.
     *
     * @description
     * Сервис `$controller` отвечает за создание контроллеров.
     * 
     * Он просто вызывает {@link AUTO.$injector $injector}, но извлекает его как сервис, так что можно 
     * переопределить этот сервис на {@link https://gist.github.com/1649788 BC версию}.
     */
    return function(constructor, locals) {
      if(isString(constructor)) {
        var name = constructor;
        constructor = controllers.hasOwnProperty(name)
            ? controllers[name]
            : getter(locals.$scope, name, true) || getter($window, name, true);

        assertArgFn(constructor, name, true);
      }

      return $injector.instantiate(constructor, locals);
    };
  }];
}
