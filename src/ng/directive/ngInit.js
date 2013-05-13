'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngInit
 *
 * @description
 * Директива `ngInit` выполняет код инициализации перед построением шаблона во время начальной 
 * инициализации приложения.
 *
 * @element ANY
 * @param {expression} ngInit {@link guide/expression Выражение} для вычисления.
 *
 * @example
   <doc:example>
     <doc:source>
    <div ng-init="greeting='Hello'; person='World'">
      {{greeting}} {{person}}!
    </div>
     </doc:source>
     <doc:scenario>
       it('should check greeting', function() {
         expect(binding('greeting')).toBe('Hello');
         expect(binding('person')).toBe('World');
       });
     </doc:scenario>
   </doc:example>
 */
var ngInitDirective = ngDirective({
  compile: function() {
    return {
      pre: function(scope, element, attrs) {
        scope.$eval(attrs.ngInit);
      }
    }
  }
});
