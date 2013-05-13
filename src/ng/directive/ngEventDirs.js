'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngClick
 *
 * @description
 * Директива ngClick позволяет установить действие, которое будет выполнено, когда произойдет клик по элементу.
 *
 * @element ANY
 * @param {expression} ngClick {@link guide/expression Выражение} для обработки щелчка мышью (click). 
 * (Объект события доступен через `$event`)
 *
 * @example
   <doc:example>
     <doc:source>
      <button ng-click="count = count + 1" ng-init="count=0">
        Increment
      </button>
      count: {{count}}
     </doc:source>
     <doc:scenario>
       it('should check ng-click', function() {
         expect(binding('count')).toBe('0');
         element('.doc-example-live :button').click();
         expect(binding('count')).toBe('1');
       });
     </doc:scenario>
   </doc:example>
 */
/*
 * A directive that allows creation of custom onclick handlers that are defined as angular
 * expressions and are compiled and executed within the current scope.
 *
 * Events that are handled via these handler are always configured not to propagate further.
 */
var ngEventDirectives = {};
forEach(
  'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress'.split(' '),
  function(name) {
    var directiveName = directiveNormalize('ng-' + name);
    ngEventDirectives[directiveName] = ['$parse', function($parse) {
      return function(scope, element, attr) {
        var fn = $parse(attr[directiveName]);
        element.bind(lowercase(name), function(event) {
          scope.$apply(function() {
            fn(scope, {$event:event});
          });
        });
      };
    }];
  }
);

/**
 * @ngdoc directive
 * @name ng.directive:ngDblclick
 *
 * @description
 * Директива `ngDblclick` позволяет задать пользовательскую функцию, которая выполнится при двойном щелчке мышью
 * на элементе.
 *
 * @element ANY
 * @param {expression} ngDblclick {@link guide/expression Выражение} для обработки двойного щелчка мышью (dbclick). 
 * (Объект события доступен через `$event`)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngMousedown
 *
 * @description
 * Директива ngMousedown позволяет задать функцию, которая будет вызвана для обработки события mousedown 
 * (нажатие клавиши мыши).
 *
 * @element ANY
 * @param {expression} ngMousedown {@link guide/expression Выражение} для обработки события mousedown. 
 * (Объект события доступен через `$event`)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngMouseup
 *
 * @description
 * Задает обработчик для события mouseup (отпускание нажатой кнопки мыши).
 *
 * @element ANY
 * @param {expression} ngMouseup {@link guide/expression Выражение} для обработки события mouseup. 
 * (Объект события доступен через `$event`)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */

/**
 * @ngdoc directive
 * @name ng.directive:ngMouseover
 *
 * @description
 * Задает обработчик для события mouseover (появление курсора над элементом).
 * 
 * Для предотвращения всплывания события воспользуйтесь {@link api/ng.directive:ngMouseenter ngMouseenter}
 *
 * @element ANY
 * @param {expression} ngMouseover {@link guide/expression Выражение} для обработки события mouseover. 
 * (Объект события доступен через `$event`)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngMouseenter
 *
 * @description
 * Задает обработчик для события mouseenter (появление курсора над элементом).
 * 
 * По своему назначению, mouseenter совпадает с событием {@link api/ng.directive:ngMouseover mouseover}. Однако у них
 * имеются заметные отличия. Дело в том, что mouseover, как и многие другие стандартные события javascript, 
 * обладает свойством «всплытия» вверх по иерархии. То есть, после выполнения на элементе, событие передается 
 * родительскому элементу, потом прародительскому, и так далее, вплоть до начала дерева DOM. Эта особенность 
 * может приводить к различным проблемам. Событие mouseenter таким свойством не обладает, и выполняется только 
 * один раз, на самом элементе. Поэтому, в некоторых случаях, оно может быть гораздо удобнее.
 *
 * @element ANY
 * @param {expression} ngMouseenter {@link guide/expression Выражение} для обработки события mouseenter. 
 * (Объект события доступен через `$event`)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngMouseleave
 *
 * @description
 * Задает обработчик для события mouseleave (уход курсора за пределы элемента).
 *
 * @element ANY
 * @param {expression} ngMouseleave {@link guide/expression Выражение} для обработки события mouseleave. 
 * (Объект события доступен через `$event`)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngMousemove
 *
 * @description
 * Задает обработчик для события mousemove (перемещение курсора над элементом).
 *
 * @element ANY
 * @param {expression} ngMousemove {@link guide/expression Выражение} для обработки события mousemove. 
 * (Объект события доступен через `$event`)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngKeydown
 *
 * @description
 * Задает обработчик для события keydown (нажатие клавиши на клавиатуре).
 *
 * @element ANY
 * @param {expression} ngKeydown {@link guide/expression Выражение} для обработки события keydown. 
 * (Объект события доступен через `$event` и может быть опрощен для получения keyCode, altKey и т.д.)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngKeyup
 *
 * @description
 * Задает обработчик для события keyup (отпускание нажатой клавиши на клавиатуре).
 *
 * @element ANY
 * @param {expression} ngKeyup {@link guide/expression Выражение} для обработки события keyup. 
 * (Объект события доступен через `$event` и может быть опрощен для получения keyCode, altKey и т.д.)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngKeypress
 *
 * @description
 * Задает обработчик для события keypress (ввод символа с клавиатуры).
 *
 * @element ANY
 * @param {expression} ngKeypress {@link guide/expression Выражение} для обработки события keypress. 
 * (Объект события доступен через `$event` и может быть опрощен для получения keyCode, altKey и т.д.)
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */


/**
 * @ngdoc directive
 * @name ng.directive:ngSubmit
 *
 * @description
 * Привязывает angular-выражение к событию onsubmit (отправка формы). 
 * 
 * Дополнительно отключает поведение по умолчанию (отправка формы на сервер и перезагрузка текущей страницы).
 *
 * @element form
 * @param {expression} ngSubmit {@link guide/expression Выражение} для вычисления.
 *
 * @example
   <doc:example>
     <doc:source>
      <script>
        function Ctrl($scope) {
          $scope.list = [];
          $scope.text = 'hello';
          $scope.submit = function() {
            if (this.text) {
              this.list.push(this.text);
              this.text = '';
            }
          };
        }
      </script>
      <form ng-submit="submit()" ng-controller="Ctrl">
        Enter text and hit enter:
        <input type="text" ng-model="text" name="text" />
        <input type="submit" id="submit" value="Submit" />
        <pre>list={{list}}</pre>
      </form>
     </doc:source>
     <doc:scenario>
       it('should check ng-submit', function() {
         expect(binding('list')).toBe('[]');
         element('.doc-example-live #submit').click();
         expect(binding('list')).toBe('["hello"]');
         expect(input('text').val()).toBe('');
       });
       it('should ignore empty strings', function() {
         expect(binding('list')).toBe('[]');
         element('.doc-example-live #submit').click();
         element('.doc-example-live #submit').click();
         expect(binding('list')).toBe('["hello"]');
       });
     </doc:scenario>
   </doc:example>
 */
var ngSubmitDirective = ngDirective(function(scope, element, attrs) {
  element.bind('submit', function() {
    scope.$apply(attrs.ngSubmit);
  });
});
