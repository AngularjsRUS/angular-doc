'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngIf
 * @restrict A
 *
 * @description
 * Директива `ngIf` удаляет и восстанавливает часть дерева DOM (HTML) в зависимости от значения условного выражения 
 * {expression} **«true»** или **«false»**, соответственно. Другими словами, если выражение, присваиваемое `ngIf` 
 * оценивается как ложное, то элемент удаляется из DOM и если истинное, то копия элемента повторно вставляется в DOM.
 * 
 * `ngIf` отличается от `ngShow` и `ngHide` тем, что `ngIf` полностью удаляет и воссоздает элемент в DOM, а не 
 * изменяет его видимость через CSS-свойство `display`. В общем случае, разница является значительной 
 * при использовании CSS селекторов, которые берут за основу позицию элемента в DOM (HTML), такие как
 * псевдоклассы: `:first-child` или `:last-child`.
 * 
 * Обратите внимание, что, **когда элемент удаляется с помощью `ngIf`, то его область видимости уничтожается** 
 * и **новая область видимости создается при восстановлении элемента**. Область видимости, созданная в `ngIf`
 * наследует от своего родителя область видимости с помощью 
 * {@link https://github.com/angular/angular.js/wiki/The-Nuances-of-Scope-Prototypal-Inheritance prototypal inheritance}.
 * Важным следствием этого является то, что если `ngModel` используется в `ngIf`, то связанный JavaScript примитив
 * определен в родительской области. В этом случае любые изменения, внесенные в переменную в дочерней области
 * видимости будут перекрывать (скрывать) значение в родительской области.
 * 
 * Кроме того, `ngIf` воссоздает элементы, используя их компилированное состояние. Примерным сценарием такого 
 * поведения является случай когда атрибут класса элемента непосредственно изменен после своей компиляции, 
 * используя что-то вроде JQuery-метода `.addClass()`, и позже элемент удаляется. Когда `ngIf` воссоздает элемент
 * добавленые классы будут потеряны, поскольку для регенерации элемента используется оригинальное 
 * скомпилированное состояние.
 * 
 * Кроме того, можно задать анимацию с помощью атрибута ngAnimate для анимации эффектов **enter** и **leave**.
 *
 * @animations
 * enter - происходит после изменения содержимого `ngIf`, создания и внедрения нового DOM-элемента в контейнер `ngIf`
 * leave - происходит перед удалением содержимого `ngIf` из DOM
 * 
 * @element ANY
 * @scope
 * @param {expression} ngIf Если {@link guide/expression выражение} ложно, то элемент удаляется из дерева DOM (HTML).
 *
 * @example
   <doc:example>
     <doc:source>
        Click me: <input type="checkbox" ng-model="checked" ng-init="checked=true" /><br/>
        Show when checked: <span ng-if="checked">I'm removed when the checkbox is unchecked</span>
     </doc:source>
   </doc:example>
 */
var ngIfDirective = ['$animator', function($animator) {
  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    restrict: 'A',
    compile: function (element, attr, transclude) {
      return function ($scope, $element, $attr) {
        var animate = $animator($scope, $attr);
        var childElement, childScope;
        $scope.$watch($attr.ngIf, function ngIfWatchAction(value) {
          if (childElement) {
            animate.leave(childElement);
            childElement = undefined;
          }
          if (childScope) {
            childScope.$destroy();
            childScope = undefined;
          }
          if (toBoolean(value)) {
            childScope = $scope.$new();
            transclude(childScope, function (clone) {
              childElement = clone;
              animate.enter(clone, $element.parent(), $element);
            });
          }
        });
      }
    }
  }
}];
