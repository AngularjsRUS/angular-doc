'use strict';

/**
 * @ngdoc object
 * @name ng.$filterProvider
 * @description
 *
 * Фильтры это всего лишь функции, которые преобразуют входные данные в выходные. Однако в фильтры должны быть 
 * внедрены зависимости. Поэтому определение фильтра содержит фабричную функцию, которая определяет зависимости 
 * и отвечает за создание функции фильтрации.
 *
 * <pre>
 *   // Регистрация фильтра
 *   function MyModule($provide, $filterProvider) {
 *     // создание сервиса для демонстрации зависимости (нужно не всегда)
 *     $provide.value('greet', function(name){
 *       return 'Hello ' + name + '!';
 *     });
 *
 *     // регистрация фабричной функции, которая использует
 *     // сервис greet для демонстрации внедрения зависимости.
 *     $filterProvider.register('greet', function(greet){
 *       // возврат функции фильтрации, которая использует сервис greet
 *       // для создания приветственной фразы
 *       return function(text) {
 *         // фильтрам необходимо быть снисходительными при проверке входных данных
 *         return text && greet(text) || text;
 *       };
 *     });
 *   }
 * </pre>
 *
 * Функция фильтрации зарегистрирована в `$injector` под именем suffixe с `Filter`.
 * <pre>
 *   it('should be the same instance', inject(
 *     function($filterProvider) {
 *       $filterProvider.register('reverse', function(){
 *         return ...;
 *       });
 *     },
 *     function($filter, reverseFilter) {
 *       expect($filter('reverse')).toBe(reverseFilter);
 *     });
 * </pre>
 *
 *
 * Чтобы узнать больше о работе фильтров в Angular, и о создании собственных фильтров, см.
 * {@link guide/dev_guide.templates.filters Фильтры} в руководстве разработчика.
 */
/**
 * @ngdoc method
 * @name ng.$filterProvider#register
 * @methodOf ng.$filterProvider
 * @description
 * Регистрация функции фильтрации.
 *
 * @param {String} name Название фильтра.
 * @param {function} fn Внедренная фабричная функция фильтра.
 */


/**
 * @ngdoc function
 * @name ng.$filter
 * @function
 * @description
 * Фильтры используются для форматирования данных, показываемых пользователю.
 *
 * Основной синтаксис:
 *
 *         {{ expression | [ filter_name ] }}
 *
 * @param {String} name Имя функции фильтрации для поиска
 * @return {Function} функция фильтрации
 */
$FilterProvider.$inject = ['$provide'];
function $FilterProvider($provide) {
  var suffix = 'Filter';

  function register(name, factory) {
    return $provide.factory(name + suffix, factory);
  }
  this.register = register;

  this.$get = ['$injector', function($injector) {
    return function(name) {
      return $injector.get(name + suffix);
    }
  }];

  ////////////////////////////////////////

  register('currency', currencyFilter);
  register('date', dateFilter);
  register('filter', filterFilter);
  register('json', jsonFilter);
  register('limitTo', limitToFilter);
  register('lowercase', lowercaseFilter);
  register('number', numberFilter);
  register('orderBy', orderByFilter);
  register('uppercase', uppercaseFilter);
}
