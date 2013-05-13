'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngNonBindable
 * @priority 1000
 *
 * @description
 * Иногда требуется написать код, который является корректным angular-выражением, но которое должно отображаться как
 * есть, без вычисления. Используйте `ngNonBindable` чтобы заставить Angular игнорировать содержимое HTML.
 *
 * @element ANY
 *
 * @example
 * В этом примере связывание данных (`{{}}`) присутствует в двух местах, но в одном завернуто в `ngNonBindable` и
 * не вычисляется.
 *
 * @example
    <doc:example>
      <doc:source>
        <div>Normal: {{1 + 2}}</div>
        <div ng-non-bindable>Ignored: {{1 + 2}}</div>
      </doc:source>
      <doc:scenario>
       it('should check ng-non-bindable', function() {
         expect(using('.doc-example-live').binding('1 + 2')).toBe('3');
         expect(using('.doc-example-live').element('div:last').text()).
           toMatch(/1 \+ 2/);
       });
      </doc:scenario>
    </doc:example>
 */
var ngNonBindableDirective = ngDirective({ terminal: true, priority: 1000 });
