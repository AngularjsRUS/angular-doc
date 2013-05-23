'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngInclude
 * @restrict ECA
 *
 * @description
 * Извлекает, компилирует и включает внешний HTML-фрагмент.
 *
 * Помните о _правилах ограничения домена_ при включении ресурсов
 * (например, ngInclude не работает для кросс-доменных запросов во всех браузерах и для доступа к file:// 
 * в некоторых браузерах).
 * 
 * Кроме того, с помощью атрибута ngAnimate можно задать анимацию для эффектов **enter** и **leave**.
 *
 * @animations
 * enter - происходит только после изменения содержимого ngInclude и создания нового DOM-дом элемента и внедрения его в контейнер ngInclude
 * leave - происходит только после изменения содержимого ngInclude и только до того как прежнее содержимое удалено из DOM
 * 
 * @scope
 *
 * @param {string} ngInclude|src angular-выражение, возвращающее URL. При необходимости передать строку,
 *                заключите её в кавычки, например `src="'myPartialTemplate.html'"`.
 * @param {string=} onload Выражение, которое выполнится после загрузки новой части.
 *
 * @param {string=} autoscroll Вслед за `ngInclude` следует вызвать {@link ng.$anchorScroll
 *                  $anchorScroll} для прокрутки окна просмотра после загрузки контента.
 *
 *                  - Если атрибут не установлен, скроллинг отключается.
 *                  - Если атрибут установлен без значения, скроллинг включается.
 *                  - В противном случае скроллинг включается, только если выражение возвращает значение true.
 *
 * @example
  <example>
    <file name="index.html">
     <div ng-controller="Ctrl">
       <select ng-model="template" ng-options="t.name for t in templates">
        <option value="">(blank)</option>
       </select>
       url of the template: <tt>{{template.url}}</tt>
       <hr/>
       <div class="example-animate-container"
            ng-include="template.url"
            ng-animate="{enter: 'example-enter', leave: 'example-leave'}"></div>
     </div>
    </file>
    <file name="script.js">
      function Ctrl($scope) {
        $scope.templates =
          [ { name: 'template1.html', url: 'template1.html'}
          , { name: 'template2.html', url: 'template2.html'} ];
        $scope.template = $scope.templates[0];
      }
     </file>
    <file name="template1.html">
      <div>Content of template1.html</div>
    </file>
    <file name="template2.html">
      <div>Content of template2.html</div>
    </file>
    <file name="animations.css">
      .example-leave-setup,
      .example-enter-setup {
        -webkit-transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s;
        -moz-transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s;
        -ms-transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s;
        -o-transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s;
        transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s;

        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
      }

      .example-animate-container > * {
        display:block;
        padding:10px;
      }

      .example-enter-setup {
        top:-50px;
      }
      .example-enter-setup.example-enter-start {
        top:0;
      }

      .example-leave-setup {
        top:0;
      }
      .example-leave-setup.example-leave-start {
        top:50px;
      }
    </file>
    <file name="scenario.js">
      it('should load template1.html', function() {
       expect(element('.doc-example-live [ng-include]').text()).
         toMatch(/Content of template1.html/);
      });
      it('should load template2.html', function() {
       select('template').option('1');
       expect(element('.doc-example-live [ng-include]').text()).
         toMatch(/Content of template2.html/);
      });
      it('should change to blank', function() {
       select('template').option('');
       expect(element('.doc-example-live [ng-include]').text()).toEqual('');
      });
    </file>
  </example>
 */

/**
 * @ngdoc event
 * @name ng.directive:ngInclude#$includeContentRequested
 * @eventOf ng.directive:ngInclude
 * @eventType emit on область видимости, в которой была объявлена ngInclude
 * @description
 * Задействуется каждый раз когда запрашивается содержимое ngInclude.
 */

/**
 * @ngdoc event
 * @name ng.directive:ngInclude#$includeContentLoaded
 * @eventOf ng.directive:ngInclude
 * @eventType emit on текущаяя область видимости ngInclude
 * @description
 * Задействуется каждый раз когда загружается содержимое ngInclude.
 */
 
var ngIncludeDirective = ['$http', '$templateCache', '$anchorScroll', '$compile', '$animator',
                  function($http,   $templateCache,   $anchorScroll,   $compile,   $animator) {
  return {
    restrict: 'ECA',
    terminal: true,
    compile: function(element, attr) {
      var srcExp = attr.ngInclude || attr.src,
          onloadExp = attr.onload || '',
          autoScrollExp = attr.autoscroll;

      return function(scope, element, attr) {
        var animate = $animator(scope, attr);
        var changeCounter = 0,
            childScope;

        var clearContent = function() {
          if (childScope) {
            childScope.$destroy();
            childScope = null;
          }
          animate.leave(element.contents(), element);
        };

        scope.$watch(srcExp, function ngIncludeWatchAction(src) {
          var thisChangeId = ++changeCounter;

          if (src) {
            $http.get(src, {cache: $templateCache}).success(function(response) {
              if (thisChangeId !== changeCounter) return;

              if (childScope) childScope.$destroy();
              childScope = scope.$new();
              animate.leave(element.contents(), element);

              var contents = jqLite('<div/>').html(response).contents();

              animate.enter(contents, element);
              $compile(contents)(childScope);

              if (isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                $anchorScroll();
              }

              childScope.$emit('$includeContentLoaded');
              scope.$eval(onloadExp);
            }).error(function() {
              if (thisChangeId === changeCounter) clearContent();
            });
          } else {
            clearContent();
          }
        });
      };
    }
  };
}];
