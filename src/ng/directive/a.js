'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:a
 * @restrict E
 *
 * @description
 * Изменяет стандартное поведение html тега A, если атрибут href пустой то действие по умолчанию будет
 * отменено.
 *
 * Смысл этого изменения в том, чтобы можно было легко создавать ссылки с директивой
 * `ngClick` и при этом не волноваться о перезагрузке страницы или изменении адреса. Пример:
 * `<a href="" ng-click="model.$save()">Save</a>`
 */
var htmlAnchorDirective = valueFn({
  restrict: 'E',
  compile: function(element, attr) {

    if (msie <= 8) {
      // превращение <a href ng-click="..">link</a> в стилизованную ссылку IE
      // но только если она не имеет названия и никуда не ведет, в нашем случае не имеет якоря
      if (!attr.href && !attr.name) {
        attr.$set('href', '');
      }

      // добавление комментария для якоря, чтобы обойти IE баг, приводящий к сбросу содержания элемента
      // к новому содержанию атрибута, если атрибут обновлялся значением, содержащим @ или
      // содержал значение с @
      // см. issue #1949
      element.append(document.createComment('IE fix'));
    }

    return function(scope, element) {
      element.bind('click', function(event){
        // если в href не содержится url, то мы никуда не переходим
        if (!element.attr('href')) {
          event.preventDefault();
        }
      });
    }
  }
});
