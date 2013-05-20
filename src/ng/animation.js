/**
 * @ngdoc object
 * @name ng.$animationProvider
 * @description
 *
 * $AnimationProvider позволяет разработчикам зарегистрировать и получить доступ к обычной JavaScript-анимации
 * непосредственно внутри модуля.
 *
 */
$AnimationProvider.$inject = ['$provide'];
function $AnimationProvider($provide) {
  var suffix = 'Animation';

  /**
   * @ngdoc function
   * @name ng.$animation#register
   * @methodOf ng.$animationProvider
   *
   * @description
   * Регистрирует новую внедряемую фабричную функцию анимации. Фабричная функция создает объект анимации, который
   * имеет два параметра:
   *
   *   * `setup`: `function(Element):*` Функция, получающая начальное состояние элемента. Ее цель —
   *   подготовить элемент к анимации. Опционально может вернуть напоминание, передаваемое в
   *   функцию `start`.
   *   * `start`: `function(Element, doneFunction, *)` Элемент для анимации, функция `doneFunction` будет
   *   вызвана при завершении анимации элемента и опционально, напоминанием из функции `setup`.
   *
   * @param {string} name Имя анимации.
   * @param {function} factory Фабричная функция, возвращающая объект анимациипосле выполнения.
   * 
   */
  this.register = function(name, factory) {
    $provide.factory(camelCase(name) + suffix, factory);
  };

  this.$get = ['$injector', function($injector) {
    /**
     * @ngdoc function
     * @name ng.$animation
     * @function
     *
     * @description
     * Сервис $animation используется, чтобы вернуть любую определенную функцию анимации. При выполнении сервис
     * $animation вернет объект, содержащий параметры и функцию запуска, определенные для анимации.
     *
     * @param {String} name Имя возвращаемой функции анимации. Функция анимации регистрируется и хранится
     *        в системе внедрения зависимости AngularJS и вызывается как $animate('custom') являясь так же
     *        внедренной `customAnimation` через внедрение зависимости.
     * @return {Object} объект анимации, содержащий функции `setup` и `start` воспроизводимые при анимации.
     */
    return function $animation(name) {
      if (name) {
        try {
          return $injector.get(camelCase(name) + suffix);
        } catch (e) {
          //TODO(misko): this is a hack! we should have a better way to test if the injector has a given key.
          // The issue is that the animations are optional, and if not present they should be silently ignored.
          // The proper way to fix this is to add API onto the injector so that we can ask to see if a given
          // animation is supported.
        }
      }
    }
  }];
};
