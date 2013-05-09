'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngShow
 *
 * @description
 * Директивы `ngShow` и `ngHide` показывают или скрывают часть дерева DOM (HTML)
 * в зависимости от того **правдиво ли** значение, вычисленное в {expression}. Другими 
 * словами, если выражение, назначаемое **ngShow вычисляет значение true** тогда **элемент показывается**
 * (через `display:block` в css) и **если false** тогда **элемент скрывается** (display:none).
 * С ngHide обратная ситуация, значение true скрывает элемент.
 *
 * Кроме того, можно задать анимацию с помощью атрибута ngAnimate для эффектов **show**
 * и **hide**.
 * 
 * @animations
 * show - происходит после того как выражение ngShow вычислит значение true и содержимое начнет показываться
 * hide - происходит после того как выражение ngShow вычислит значение false и содержимое начнет скрываться
 *
 * @element ANY
 * @param {expression} ngShow Если {@link guide/expression expression} правдиво
 *     то элемент показан или скрыт соответственно
 *
 * @example
  <example animations="true">
    <file name="index.html">
      Click me: <input type="checkbox" ng-model="checked"><br/>
      <div>
        Show:
        <span class="check-element"
              ng-show="checked"
              ng-animate="{show: 'example-show', hide: 'example-hide'}">
          <span class="icon-thumbs-up"></span> I show up when your checkbox is checked.
        </span>
      </div>
      <div>
        Hide:
        <span class="check-element"
              ng-hide="checked"
              ng-animate="{show: 'example-show', hide: 'example-hide'}">
          <span class="icon-thumbs-down"></span> I hide when your checkbox is checked.
        </span>
      </div>
    </file>
    <file name="animations.css">
      .example-show-setup, .example-hide-setup {
        -webkit-transition:all linear 0.5s;
        -moz-transition:all linear 0.5s;
        -ms-transition:all linear 0.5s;
        -o-transition:all linear 0.5s;
        transition:all linear 0.5s;
      }

      .example-show-setup {
        line-height:0;
        opacity:0;
        padding:0 10px;
      }
      .example-show-start.example-show-start {
        line-height:20px;
        opacity:1;
        padding:10px;
        border:1px solid black;
        background:white;
      }

      .example-hide-setup {
        line-height:20px;
        opacity:1;
        padding:10px;
        border:1px solid black;
        background:white;
      }
      .example-hide-start.example-hide-start {
        line-height:0;
        opacity:0;
        padding:0 10px;
      }

      .check-element {
        padding:10px;
        border:1px solid black;
        background:white;
      }
    </file>
    <file name="scenario.js">
       it('should check ng-show / ng-hide', function() {
         expect(element('.doc-example-live span:first:hidden').count()).toEqual(1);
         expect(element('.doc-example-live span:last:visible').count()).toEqual(1);

         input('checked').check();

         expect(element('.doc-example-live span:first:visible').count()).toEqual(1);
         expect(element('.doc-example-live span:last:hidden').count()).toEqual(1);
       });
    </file>
  </example>
 */
//TODO(misko): refactor to remove element from the DOM
var ngShowDirective = ['$animator', function($animator) {
  return function(scope, element, attr) {
    var animate = $animator(scope, attr);
    scope.$watch(attr.ngShow, function ngShowWatchAction(value){
      animate[toBoolean(value) ? 'show' : 'hide'](element);
    });
  };
}];


/**
 * @ngdoc directive
 * @name ng.directive:ngHide
 *
 * @description
 * Директивы `ngShow` и `ngHide` показывают или скрывают часть дерева DOM (HTML)
 * в зависимости от того **правдиво ли** значение, вычисленное в {expression}. Другими 
 * словами, если выражение, назначаемое **ngShow вычисляет значение true** тогда **элемент показывается**
 * (через `display:block` в css) и **если false** тогда **элемент скрывается** (display:none).
 * С ngHide обратная ситуация, значение true скрывает элемент.
 *
 * Кроме того, можно задать анимацию с помощью атрибута ngAnimate для эффектов **show**
 * и **hide**.
 *
 * @animations
 * show - происходит после того как выражение ngShow вычислит значение true и содержимое начнет показываться
 * hide - происходит после того как выражение ngShow вычислит значение false и содержимое начнет скрываться
 * 
 * @element ANY
 * @param {expression} ngHide Если {@link guide/expression expression} правдиво
 *     то элемент показан или скрыт соответственно
 *
 * @example
  <example animations="true">
    <file name="index.html">
      Click me: <input type="checkbox" ng-model="checked"><br/>
      <div>
        Show:
        <span class="check-element"
              ng-show="checked"
              ng-animate="{show: 'example-show', hide: 'example-hide'}">
          <span class="icon-thumbs-up"></span> I show up when your checkbox is checked.
        </span>
      </div>
      <div>
        Hide:
        <span class="check-element"
              ng-hide="checked"
              ng-animate="{show: 'example-show', hide: 'example-hide'}">
          <span class="icon-thumbs-down"></span> I hide when your checkbox is checked.
        </span>
      </div>
    </file>
    <file name="animations.css">
      .example-show-setup, .example-hide-setup {
        -webkit-transition:all linear 0.5s;
        -moz-transition:all linear 0.5s;
        -ms-transition:all linear 0.5s;
        -o-transition:all linear 0.5s;
        transition:all linear 0.5s;
      }

      .example-show-setup {
        line-height:0;
        opacity:0;
        padding:0 10px;
      }
      .example-show-start.example-show-start {
        line-height:20px;
        opacity:1;
        padding:10px;
        border:1px solid black;
        background:white;
      }

      .example-hide-setup {
        line-height:20px;
        opacity:1;
        padding:10px;
        border:1px solid black;
        background:white;
      }
      .example-hide-start.example-hide-start {
        line-height:0;
        opacity:0;
        padding:0 10px;
      }

      .check-element {
        padding:10px;
        border:1px solid black;
        background:white;
      }
    </file>
    <file name="scenario.js">
       it('should check ng-show / ng-hide', function() {
         expect(element('.doc-example-live .check-element:first:hidden').count()).toEqual(1);
         expect(element('.doc-example-live .check-element:last:visible').count()).toEqual(1);

         input('checked').check();

         expect(element('.doc-example-live .check-element:first:visible').count()).toEqual(1);
         expect(element('.doc-example-live .check-element:last:hidden').count()).toEqual(1);
       });
    </file>
  </example>
 */
//TODO(misko): refactor to remove element from the DOM
var ngHideDirective = ['$animator', function($animator) {
  return function(scope, element, attr) {
    var animate = $animator(scope, attr);
    scope.$watch(attr.ngHide, function ngHideWatchAction(value){
      animate[toBoolean(value) ? 'hide' : 'show'](element);
    });
  };
}];
