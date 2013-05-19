'use strict';

/**
 * @ngdoc object
 * @name ng.$window
 *
 * @description
 * Просто ссылка на объект браузера `window`. Хотя `window` и доступен глобально в JavaScript, 
 * при его использовании возникает проблема при тестировании, т.к. он является глобальной переменной.
 * В Angular мы всегда ссылаемся на него через сервис `$window`, т.к. в этом случае его можно переопределить,
 * удалить или заменить другим при тестировании.
 * 
 * Любые выражения, вычисляемые в любой области видимости не должны работать с глобальным объектом `window`.
 *
 * @example
   <doc:example>
     <doc:source>
       <input ng-init="$window = $service('$window'); greeting='Hello World!'" type="text" ng-model="greeting" />
       <button ng-click="$window.alert(greeting)">ALERT</button>
     </doc:source>
     <doc:scenario>
     </doc:scenario>
   </doc:example>
 */
function $WindowProvider(){
  this.$get = valueFn(window);
}
