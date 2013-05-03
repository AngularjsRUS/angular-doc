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
 * Смысл этого изменения в том, что бы можно было легко создавать ссылки с директивой
 * `ngClick` и при этом не волноваться о перезагрузке страницы или изменении адреса. Пример:
 * `<a href="" ng-click="model.$save()">Save</a>`
 */
var htmlAnchorDirective = valueFn({
  restrict: 'E',
  compile: function(element, attr) {

    if (msie <= 8) {

      // turn <a href ng-click="..">link</a> into a stylable link in IE
      // but only if it doesn't have name attribute, in which case it's an anchor
      if (!attr.href && !attr.name) {
        attr.$set('href', '');
      }

      // add a comment node to anchors to workaround IE bug that causes element content to be reset
      // to new attribute content if attribute is updated with value containing @ and element also
      // contains value with @
      // see issue #1949
      element.append(document.createComment('IE fix'));
    }

    return function(scope, element) {
      element.bind('click', function(event){
        // if we have no href url, then don't navigate anywhere.
        if (!element.attr('href')) {
          event.preventDefault();
        }
      });
    }
  }
});
