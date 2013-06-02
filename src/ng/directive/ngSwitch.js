'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngSwitch
 * @restrict EA
 *
 * @description
 * Директива ngSwitch используется чтобы заменить DOM структуру на ваш шаблон в зависимости от условного выражения
 * в области видимости. Элементы внутри ngSwitch но без ngSwitchWhen или ngSwitchDefault директив будут сохранены
 * в том же месте, как указано в шаблоне.
 * 
 * Сама директива работает аналогично ngInclude, однако, вместо загрузки кода шаблона (или загрузки шаблона 
 * из кэша), ngSwitch просто выбирает один из вложенных элементов и делает его видимым, основываясь на том,
 * какой элемент соответствует значению, полученному в результате вычисления выражения . Другими словами, 
 * вы определяете элемент контейнера (куда помещена эта директива), помещаете выражение в атрибут **on="..."**
 * (или в атрибут **ng-switch="..."**), определяете любой внутренний элемент внутри директивы и помесщаете
 * когда атрибут каждого элемента. Когда атрибут используется для указания ngSwitch какой элемент отображается, 
 * когда выражение вычислено. Если соответствующее выражение не найдено через когда атрибут то отображается 
 * элемент с атрибутом по умолчанию.
  *
  * Кроме того, также можно показать анимацию с помощью атрибута ngAnimate для эффектов анимации **enter**
 * и **leave**.
 *
 * @animations
 * enter - происходит после изменения выражения в ngSwitch и после того, как дочерний элемент добавлен в контейнер
 * leave - происходит сразу после изменения выражения в ngSwitch и до того, как предыдущий элемент удалён из DOM
 *
 * @usage
 * <ANY ng-switch="expression">
 *   <ANY ng-switch-when="matchValue1">...</ANY>
 *   <ANY ng-switch-when="matchValue2">...</ANY>
 *   <ANY ng-switch-default>...</ANY>
 * </ANY>
 *
 * @scope
 * @param {*} ngSwitch|on выражение, результат которого сравнивается с содержимым <tt>ng-switch-when</tt>.
 * @paramDescription
 * Дочерним элементам добавляется:
 *
 * * `ngSwitchWhen`: случай заявлении для сравнения. Если совпадают, то это дело будет отображаться. 
 *   Если же сравнение совпадает несколько раз, все элементы будут отображаться.
 * * `ngSwitchDefault`: вариант по умолчанию, когда ничего не совпало. Если имеется несколько случаев по умолчанию,
 *   все они будут отображаться, когда ничего не совпало.
 *
 * @example
  <example animations="true">
    <file name="index.html">
      <div ng-controller="Ctrl">
        <select ng-model="selection" ng-options="item for item in items">
        </select>
        <tt>selection={{selection}}</tt>
        <hr/>
        <div
          class="example-animate-container"
          ng-switch on="selection"
          ng-animate="{enter: 'example-enter', leave: 'example-leave'}">
            <div ng-switch-when="settings">Settings Div</div>
            <div ng-switch-when="home">Home Span</div>
            <div ng-switch-default>default</div>
        </div>
      </div>
    </file>
    <file name="script.js">
      function Ctrl($scope) {
        $scope.items = ['settings', 'home', 'other'];
        $scope.selection = $scope.items[0];
      }
    </file>
    <file name="animations.css">
      .example-leave-setup, .example-enter-setup {
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
      .example-enter-start.example-enter-start {
        top:0;
      }

      .example-leave-setup {
        top:0;
      }
      .example-leave-start.example-leave-start {
        top:50px;
      }
    </file>
    <file name="scenario.js">
      it('should start in settings', function() {
        expect(element('.doc-example-live [ng-switch]').text()).toMatch(/Settings Div/);
      });
      it('should change to home', function() {
        select('selection').option('home');
        expect(element('.doc-example-live [ng-switch]').text()).toMatch(/Home Span/);
      });
      it('should select default', function() {
        select('selection').option('other');
        expect(element('.doc-example-live [ng-switch]').text()).toMatch(/default/);
      });
    </file>
  </example>
 */
var ngSwitchDirective = ['$animator', function($animator) {
  return {
    restrict: 'EA',
    require: 'ngSwitch',

    // asks for $scope to fool the BC controller module
    controller: ['$scope', function ngSwitchController() {
     this.cases = {};
    }],
    link: function(scope, element, attr, ngSwitchController) {
      var animate = $animator(scope, attr);
      var watchExpr = attr.ngSwitch || attr.on,
          selectedTranscludes,
          selectedElements,
          selectedScopes = [];

      scope.$watch(watchExpr, function ngSwitchWatchAction(value) {
        for (var i= 0, ii=selectedScopes.length; i<ii; i++) {
          selectedScopes[i].$destroy();
          animate.leave(selectedElements[i]);
        }

        selectedElements = [];
        selectedScopes = [];

        if ((selectedTranscludes = ngSwitchController.cases['!' + value] || ngSwitchController.cases['?'])) {
          scope.$eval(attr.change);
          forEach(selectedTranscludes, function(selectedTransclude) {
            var selectedScope = scope.$new();
            selectedScopes.push(selectedScope);
            selectedTransclude.transclude(selectedScope, function(caseElement) {
              var anchor = selectedTransclude.element;

              selectedElements.push(caseElement);
              animate.enter(caseElement, anchor.parent(), anchor);
            });
          });
        }
      });
    }
  }
}];

var ngSwitchWhenDirective = ngDirective({
  transclude: 'element',
  priority: 500,
  require: '^ngSwitch',
  compile: function(element, attrs, transclude) {
    return function(scope, element, attr, ctrl) {
      ctrl.cases['!' + attrs.ngSwitchWhen] = (ctrl.cases['!' + attrs.ngSwitchWhen] || []);
      ctrl.cases['!' + attrs.ngSwitchWhen].push({ transclude: transclude, element: element });
    };
  }
});

var ngSwitchDefaultDirective = ngDirective({
  transclude: 'element',
  priority: 500,
  require: '^ngSwitch',
  compile: function(element, attrs, transclude) {
    return function(scope, element, attr, ctrl) {
      ctrl.cases['?'] = (ctrl.cases['?'] || []);
      ctrl.cases['?'].push({ transclude: transclude, element: element });
    };
  }
});
