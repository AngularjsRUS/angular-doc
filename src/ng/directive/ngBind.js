'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngBind
 *
 * @description
 * Атрибут `ngBind` говорит Angular заменить содержимое специального HTML-элемента значением заданного выражения 
 * и обновлять его содержимое при изменении значения выражения.
 * 
 * Как правило, `ngBind` не используется явно, вместо этого используется выражение в двойных фигурных скобках, 
 * `{{ expression }}` которое имитирует предыдущую возможность.
 * 
 * Однако первый сценарий предпочтительнее, т.к. использование `ngBind`, в отличие от привязки с помощью 
 * `{{ expression }}` не выводится в браузер перед компиляцией. Так как `ngBind` является атрибутом элемента, 
 * то он не отображается в браузере и делает привязку невидимой для пользователя во время загрузки.
 * 
 * Альтернативным решением проблемы является использование директивы {@link ng.directive:ngCloak ngCloak}.
 *
 *
 * @element ANY
 * @param {expression} ngBind {@link guide/expression Выражение} для вычисления.
 *
 * @example
 * Введите имя в поле живого простмотра; приветствие под текстовым полем изменится мгновенно.
   <doc:example>
     <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.name = 'Whirled';
         }
       </script>
       <div ng-controller="Ctrl">
         Enter name: <input type="text" ng-model="name"><br>
         Hello <span ng-bind="name"></span>!
       </div>
     </doc:source>
     <doc:scenario>
       it('should check ng-bind', function() {
         expect(using('.doc-example-live').binding('name')).toBe('Whirled');
         using('.doc-example-live').input('name').enter('world');
         expect(using('.doc-example-live').binding('name')).toBe('world');
       });
     </doc:scenario>
   </doc:example>
 */
var ngBindDirective = ngDirective(function(scope, element, attr) {
  element.addClass('ng-binding').data('$binding', attr.ngBind);
  scope.$watch(attr.ngBind, function ngBindWatchAction(value) {
    element.text(value == undefined ? '' : value);
  });
});


/**
 * @ngdoc directive
 * @name ng.directive:ngBindTemplate
 *
 * @description
 * Директива `ngBindTemplate` указывает, что текст в элементе должен быть заменен на результат привязки 
 * ngBindTemplate. В отличие от ngBind, ngBindTemplate может содержать внутри множество выражений
 * привязки данных `{{` `}}` . (Требуется для некоторых элементов HTML, которые не могут содержать внутри 
 * элементы SPAN, таких как TITLE, или OPTION).
 *
 * @element ANY
 * @param {string} ngBindTemplate шаблон формы
 *   <tt>{{</tt> <tt>expression</tt> <tt>}}</tt> для вычисления.
 *
 * @example
 * Введите текст в текстовое поле и понаблюдайте за изменением приветствия.
   <doc:example>
     <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.salutation = 'Hello';
           $scope.name = 'World';
         }
       </script>
       <div ng-controller="Ctrl">
        Salutation: <input type="text" ng-model="salutation"><br>
        Name: <input type="text" ng-model="name"><br>
        <pre ng-bind-template="{{salutation}} {{name}}!"></pre>
       </div>
     </doc:source>
     <doc:scenario>
       it('should check ng-bind', function() {
         expect(using('.doc-example-live').binding('salutation')).
           toBe('Hello');
         expect(using('.doc-example-live').binding('name')).
           toBe('World');
         using('.doc-example-live').input('salutation').enter('Greetings');
         using('.doc-example-live').input('name').enter('user');
         expect(using('.doc-example-live').binding('salutation')).
           toBe('Greetings');
         expect(using('.doc-example-live').binding('name')).
           toBe('user');
       });
     </doc:scenario>
   </doc:example>
 */
var ngBindTemplateDirective = ['$interpolate', function($interpolate) {
  return function(scope, element, attr) {
    // TODO: move this to scenario runner
    var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));
    element.addClass('ng-binding').data('$binding', interpolateFn);
    attr.$observe('ngBindTemplate', function(value) {
      element.text(value);
    });
  }
}];


/**
 * @ngdoc directive
 * @name ng.directive:ngBindHtmlUnsafe
 *
 * @description
 * Создает привязку через свойство innerHTML к результату выполнения выражения `expression` в текущем элементе. 
 * *Содержимое innerHTML не проверяется на наличие недопустимых знаков!* Эту директиву следует использовать 
 * только тогда, когда не устраивает директива {@link ngSanitize.directive:ngBindHtml ngBindHtml}, и вы абсолютно 
 * доверяете источнику привязки.
 * 
 * См. документацию {@link ngSanitize.$sanitize $sanitize} для примера.
 *
 * @element ANY
 * @param {expression} ngBindHtmlUnsafe {@link guide/expression Выражение} для вычисления.
 */
var ngBindHtmlUnsafeDirective = [function() {
  return function(scope, element, attr) {
    element.addClass('ng-binding').data('$binding', attr.ngBindHtmlUnsafe);
    scope.$watch(attr.ngBindHtmlUnsafe, function ngBindHtmlUnsafeWatchAction(value) {
      element.html(value || '');
    });
  };
}];
