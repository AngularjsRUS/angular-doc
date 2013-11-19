'use strict';

function classDirective(name, selector) {
  name = 'ngClass' + name;
  return ngDirective(function(scope, element, attr) {
    var oldVal = undefined;

    scope.$watch(attr[name], ngClassWatchAction, true);

    attr.$observe('class', function(value) {
      var ngClass = scope.$eval(attr[name]);
      ngClassWatchAction(ngClass, ngClass);
    });


    if (name !== 'ngClass') {
      scope.$watch('$index', function($index, old$index) {
        var mod = $index % 2;
        if (mod !== old$index % 2) {
          if (mod == selector) {
            addClass(scope.$eval(attr[name]));
          } else {
            removeClass(scope.$eval(attr[name]));
          }
        }
      });
    }


    function ngClassWatchAction(newVal) {
      if (selector === true || scope.$index % 2 === selector) {
        if (oldVal && !equals(newVal,oldVal)) {
          removeClass(oldVal);
        }
        addClass(newVal);
      }
      oldVal = copy(newVal);
    }


    function removeClass(classVal) {
      if (isObject(classVal) && !isArray(classVal)) {
        classVal = map(classVal, function(v, k) { if (v) return k });
      }
      element.removeClass(isArray(classVal) ? classVal.join(' ') : classVal);
    }


    function addClass(classVal) {
      if (isObject(classVal) && !isArray(classVal)) {
        classVal = map(classVal, function(v, k) { if (v) return k });
      }
      if (classVal) {
        element.addClass(isArray(classVal) ? classVal.join(' ') : classVal);
      }
    }
  });
}

/**
 * @ngdoc directive
 * @name ng.directive:ngClass
 *
 * @description
 * Директива `ngClass` позволяет вам динамически устанавливать CSS-класс для HTML элементов, путем привязки данных 
 * и переопределяет их при изменении.
 * 
 * Эта директива не станет добавлять класс, если он уже установлен. 
 * 
 * Когда значение выражения изменится, ранее добавленные классы будут удалены, а затем будут установлены новые.
 *
 * @element ANY
 * @param {expression} ngClass {@link guide/expression Выражение} для вычисления. Результатом может быть строка с именами классов, 
 * разделенными пробелами, или массив с именами классов, или объект со свойствами вида имя класса: логическое 
 * значение.
 *
 * @example
   <example>
     <file name="index.html">
      <input type="button" value="set" ng-click="myVar='my-class'">
      <input type="button" value="clear" ng-click="myVar=''">
      <br>
      <span ng-class="myVar">Sample Text</span>
     </file>
     <file name="style.css">
       .my-class {
         color: red;
       }
     </file>
     <file name="scenario.js">
       it('should check ng-class', function() {
         expect(element('.doc-example-live span').prop('className')).not().
           toMatch(/my-class/);

         using('.doc-example-live').element(':button:first').click();

         expect(element('.doc-example-live span').prop('className')).
           toMatch(/my-class/);

         using('.doc-example-live').element(':button:last').click();

         expect(element('.doc-example-live span').prop('className')).not().
           toMatch(/my-class/);
       });
     </file>
   </example>
 */
var ngClassDirective = classDirective('', true);

/**
 * @ngdoc directive
 * @name ng.directive:ngClassOdd
 *
 * @description
 * Директивы `ngClassOdd` и `ngClassEven` работают так же, как {@link ng.directive:ngClass ngClass}, исключая то, 
 * что их можно использовать только с директивой `ngRepeat`, и они добавляют классы соответственно для нечетных 
 * (четных) строк.
 * 
 * Эта директива может применяться только в области видимости {@link ng.directive:ngRepeat ngRepeat}.
 *
 * @element ANY
 * @param {expression} ngClassOdd {@link guide/expression Выражение} для вычисления. Результатом может быть 
 * строка с именами классов, разделенными пробелами, или массив с именами классов.
 *
 * @example
   <example>
     <file name="index.html">
        <ol ng-init="names=['John', 'Mary', 'Cate', 'Suz']">
          <li ng-repeat="name in names">
           <span ng-class-odd="'odd'" ng-class-even="'even'">
             {{name}}
           </span>
          </li>
        </ol>
     </file>
     <file name="style.css">
       .odd {
         color: red;
       }
       .even {
         color: blue;
       }
     </file>
     <file name="scenario.js">
       it('should check ng-class-odd and ng-class-even', function() {
         expect(element('.doc-example-live li:first span').prop('className')).
           toMatch(/odd/);
         expect(element('.doc-example-live li:last span').prop('className')).
           toMatch(/even/);
       });
     </file>
   </example>
 */
var ngClassOddDirective = classDirective('Odd', 0);

/**
 * @ngdoc directive
 * @name ng.directive:ngClassEven
 *
 * @description
 * Директивы `ngClassOdd` и `ngClassEven` работают так же, как {@link ng.directive:ngClass ngClass}, исключая то, 
 * что их можно использовать только с директивой `ngRepeat`, и они добавляют классы соответственно для нечетных 
 * (четных) строк.
 * 
 * Эта директива может применяться только в области видимости {@link ng.directive:ngRepeat ngRepeat}.
 *
 * @element ANY
 * @param {expression} ngClassEven {@link guide/expression Выражение} для вычисления. Результатом может быть 
 * строка с именами классов, разделенными пробелами, или массив с именами классов.
 *
 * @example
   <example>
     <file name="index.html">
        <ol ng-init="names=['John', 'Mary', 'Cate', 'Suz']">
          <li ng-repeat="name in names">
           <span ng-class-odd="'odd'" ng-class-even="'even'">
             {{name}} &nbsp; &nbsp; &nbsp;
           </span>
          </li>
        </ol>
     </file>
     <file name="style.css">
       .odd {
         color: red;
       }
       .even {
         color: blue;
       }
     </file>
     <file name="scenario.js">
       it('should check ng-class-odd and ng-class-even', function() {
         expect(element('.doc-example-live li:first span').prop('className')).
           toMatch(/odd/);
         expect(element('.doc-example-live li:last span').prop('className')).
           toMatch(/even/);
       });
     </file>
   </example>
 */
var ngClassEvenDirective = classDirective('Even', 1);
