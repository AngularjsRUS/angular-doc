'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngController
 *
 * @description
 * Директива ngController назначает поведение области видимости. Это ключевой аспект поддержки в Angular 
 * шаблона Модель-Вид-Контроллер.
 *
 * MVC коспоненты в Angular:
 *
 * * Model — модель, это данные из свойств области видимости; области видимости связаны с DOM.
 * * View — шаблон (HTML с привязками данных) из которого генерируется представление.
 * * Controller — директива `ngController`, определяющая класс контроллера; этот класс имеет методы и 
 *   типичные выражения для отражения бизнес-логики приложения.
 *
 * Обратите внимание на альтернативную возможность определения контроллера с использованием сервиса 
 * {@link ng.$route $route}.
 *
 * @element ANY
 * @scope
 * @param {expression} ngController Имя глобальной функции-конструктора или
 *     {@link guide/expression выражения} в текущей области видимости, которое возвращает функцию-контроллер.
 *     Экземпляр контроллера может быть дополнительно опубликован в области видимости c использованием конструкции
 *     `as localName` (где localName — псевдоним) в атрибуте с именем контроллера.
 *
 * @example
 * Здесь показана простая форма редактирования контактной информации пользователя. Добавление, удаление, очистка 
 * и вывод в окне реализованы с помощью методов в контроллере. Их можно легко вызвать из Angular-окружения. 
 * Обратите внимание, что внутри контроллера указатель `this` ссылается на текущую область видимости. 
 * Это позволяет обеспечить легкий доступ к данным контроллера из представления. А так же уведомлять об изменении 
 * данных и автоматически отображать их в представлении. Пример содержит два различных стиля декларирования,
 * на основе ваших стилевых предпочтений.
   <doc:example>
     <doc:source>
      <script>
        function SettingsController($scope) {
          $scope.name = "John Smith";
          $scope.contacts = [
            {type:'phone', value:'408 555 1212'},
            {type:'email', value:'john.smith@example.org'} ];

          $scope.greet = function() {
           alert(this.name);
          };

          $scope.addContact = function() {
           this.contacts.push({type:'email', value:'yourname@example.org'});
          };

          $scope.removeContact = function(contactToRemove) {
           var index = this.contacts.indexOf(contactToRemove);
           this.contacts.splice(index, 1);
          };

          $scope.clearContact = function(contact) {
           contact.type = 'phone';
           contact.value = '';
          };
        }
      </script>
      <div ng-controller="SettingsController">
        Name: <input type="text" ng-model="name"/>
        [ <a href="" ng-click="greet()">greet</a> ]<br/>
        Contact:
        <ul>
          <li ng-repeat="contact in contacts">
            <select ng-model="contact.type">
               <option>phone</option>
               <option>email</option>
            </select>
            <input type="text" ng-model="contact.value"/>
            [ <a href="" ng-click="clearContact(contact)">clear</a>
            | <a href="" ng-click="removeContact(contact)">X</a> ]
          </li>
          <li>[ <a href="" ng-click="addContact()">add</a> ]</li>
       </ul>
      </div>
     </doc:source>
     <doc:scenario>
       it('should check controller', function() {
         expect(element('.doc-example-live div>:input').val()).toBe('John Smith');
         expect(element('.doc-example-live li:nth-child(1) input').val())
           .toBe('408 555 1212');
         expect(element('.doc-example-live li:nth-child(2) input').val())
           .toBe('john.smith@example.org');

         element('.doc-example-live li:first a:contains("clear")').click();
         expect(element('.doc-example-live li:first input').val()).toBe('');

         element('.doc-example-live li:last a:contains("add")').click();
         expect(element('.doc-example-live li:nth-child(3) input').val())
           .toBe('yourname@example.org');
       });
     </doc:scenario>
   </doc:example>
 */
var ngControllerDirective = [function() {
  return {
    scope: true,
    controller: '@'
  };
}];
