'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:script
 *
 * @description
 * Загружает содержимое тега script с типом `text/ng-template`, в `$templateCache`,
 * так что шаблон может быть использован в `ngInclude`,` ngView` или шаблонах директив.
 *
 * @restrict E
 * @param {'text/ng-template'} type должен быть установлен в `'text/ng-template'`
 *
 * @example  
  <doc:example>
    <doc:source>
      <script type="text/ng-template" id="/tpl.html">
        Содержимое шаблона.
      </script>

      <a ng-click="currentTpl='/tpl.html'" id="tpl-link">Загрузить содержимое шаблона</a>
      <div id="tpl-content" ng-include src="currentTpl"></div>
    </doc:source>
    <doc:scenario>
      it('should load template defined inside script tag', function() {
        element('#tpl-link').click();
        expect(element('#tpl-content').text()).toMatch(/Содержимое шаблона/);
      });
    </doc:scenario>
  </doc:example> 
 */
var scriptDirective = ['$templateCache', function($templateCache) {
  return {
    restrict: 'E',
    terminal: true,
    compile: function(element, attr) {
      if (attr.type == 'text/ng-template') {
        var templateUrl = attr.id,
            // IE is not consistent, in scripts we have to read .text but in other nodes we have to read .textContent
            text = element[0].text;

        $templateCache.put(templateUrl, text);
      }
    }
  };
}];
