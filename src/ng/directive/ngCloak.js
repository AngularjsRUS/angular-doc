'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngCloak
 *
 * @description
 * Директива `ngCloak` используется для предотвращения показа в браузере шаблона Angular (до того как он будет
 * скомпилирован) при загрузке приложения. Используйте эту директиву, чтобы избежать нежелательного эффекта мерцания, вызванного кратковременным 
 * отображением html-шаблона.
 * 
 * Она может быть применена к элементу `<body>`, но обычно детализированное управление позволяет извлечь 
 * большую выгоду, при отображении представлений в окне браузера.
 * 
 * `ngCloak` работает совместно с css-стилем, который определен в файлах angular.js и angular.min.js. Вот этот 
 * css-стиль:
 *
 * <pre>
 * [ng\:cloak], [ng-cloak], [data-ng-cloak], [x-ng-cloak], .ng-cloak, .x-ng-cloak {
 *   display: none;
 * }
 * </pre>
 *
 * Когда css-стиль будет загружен браузером, все html элементы (включая дочерние) внутри элемента с директивой 
 * `ng-cloak` будут скрыты. Когда Angular найдет все директивы, и выполнит компиляцию шаблона, он удалит из 
 * элемента атрибут `ngCloak`, что сделает скомпилированные элементы видимыми.
 * 
 * По-хорошему скрипт `angular.js` должен быть загружен в секции head вашего html файла; альтернативный подход, 
 * поместить определение css-стиля во включаемую внешнюю таблицу стилей приложения.
 * 
 * Старые браузеры, такие как IE7, не поддерживают селекторы атрибутов (добавлены в CSS 2.1) поэтому они 
 * не поймут селектор `[ng\:cloak]`. Чтобы обойти это ограничение, необходимо добавить css класс `ngCloak` 
 * в дополнение к директиве `ngCloak`, как это показано в примере ниже.
 *
 * @element ANY
 *
 * @example
   <doc:example>
     <doc:source>
        <div id="template1" ng-cloak>{{ 'hello' }}</div>
        <div id="template2" ng-cloak class="ng-cloak">{{ 'hello IE7' }}</div>
     </doc:source>
     <doc:scenario>
       it('should remove the template directive and css class', function() {
         expect(element('.doc-example-live #template1').attr('ng-cloak')).
           not().toBeDefined();
         expect(element('.doc-example-live #template2').attr('ng-cloak')).
           not().toBeDefined();
       });
     </doc:scenario>
   </doc:example>
 *
 */
var ngCloakDirective = ngDirective({
  compile: function(element, attr) {
    attr.$set('ngCloak', undefined);
    element.removeClass('ng-cloak');
  }
});
