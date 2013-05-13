'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngPluralize
 * @restrict EA
 *
 * @description
 * # Обзор
 * Директива `ngPluralize` отображает сообщение в соответствии с установленной локализацией в en-US. 
 * Эта локализация встроена в файл angular.js и она может быть изменена на другую (см. 
 * {@link guide/i18n Локализация i18n} в руководстве разработчика). Директиву `ngPluralize` настраивается
 * для локализации 
 * {@link http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/language_plural_rules.html
 * склонения по числам}, и строки будут отображаться в соответствии с этими настройками.
 *
 * # Склонение по числам и явное указание правил для количества
 * По умолчанию в Angular есть две 
 * {@link http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/language_plural_rules.html
 * количественные категории}, применяемые для локализации en-US: «one» (первый элемент) и 
 * «other» (другой элемент).
 * 
 * Каждой категории могут соответствовать множество чисел (для примера, в локализации en-US, категории «other» 
 * соответствуют все числа больше 1), явно указать склонение можно только для одного числа. 
 * К примеру, склонение для «3» будет применяться только к числу 3. Читайте об использовании множественного
 * числа и явного задания склонений в следующих разделах статьи.
 *
 * # Настройка ngPluralize
 * Для настройки ngPluralize используются два атрибута: `count` и `when`. Можно также использовать необязательный 
 * атрибут `offset`.
 * 
 * Значение атрибута `count` может быть строкой или angular-выражением, которое вычисляется в текущей области 
 * видимости для получения значения.
 * 
 * Атрибут `when` специфицирует карту значений из категорий и строк для отображения. Его значением должен быть 
 * объект JSON, так как Angular сможет его корректно интерпретировать.
 * 
 * В следующем примере показано как настроить ngPluralize:
 *
 * <pre>
 * <ng-pluralize count="personCount"
                 when="{'0': 'Nobody is viewing.',
 *                      'one': '1 person is viewing.',
 *                      'other': '{} people are viewing.'}">
 * </ng-pluralize>
 *</pre>
 *
 * В примере, `"0: Nobody is viewing."` 'Это явное указание склонения для числа. Если не указать склонение, то 
 * число 0 будет соответствовать склонению для «other» и будет выводится «0 people are viewing» вместо «Nobody
 * is viewing». Можно указать склонения для других чисел, к примеру, 12  будет выводить "12 people are viewing",
 * можно указать "a dozen people are viewing".
 * 
 * Можно использовать закрытые фигурные скобки (`{}`), как якорь для обрабатываемого числа, которое будет вставлено
 * в результирующую строку. В предыдущем примере, Angular заменит `{}` на 
 * <span ng-non-bindable>`{{personCount}}`</span>. Вместо `{}`, может также находится тело выражения 
 * <span ng-non-bindable>{{numberExpression}}</span>.
 *
 * # Настройка ngPluralize с использованием offset
 * Атрибут `offset` кроме того позволяет еще больше управлять процессом склонения текста. Например, вместо 
 * сообщения «4 people are viewing this document», вы можете отобразить значение «John, Kate and 
 * 2 others are viewing this document». Атрибут `offset` позволяет задать сдвиг для номера на любое желаемое значение. 
 * Посмотрите на этот пример:
 *
 * <pre>
 * <ng-pluralize count="personCount" offset=2
 *               when="{'0': 'Nobody is viewing.',
 *                      '1': '{{person1}} is viewing.',
 *                      '2': '{{person1}} and {{person2}} are viewing.',
 *                      'one': '{{person1}}, {{person2}} and one other person are viewing.',
 *                      'other': '{{person1}}, {{person2}} and {} other people are viewing.'}">
 * </ng-pluralize>
 * </pre>
 *
 * Обратите внимание на используемый стиль в двух категориях (one, other), и мы добавили еще три склонения для чисел
 * 0, 1 и 2. Когда один человек, возможно John, посмотрит документ, будет показано "John is viewing". Когда три 
 * человека посмотрят документ, явного склонения не будет найдено, так как сдвиг равен 2 и текущее количество равно 3, 
 * Angular использует 1 для решения о том, какую категорию использовать. В нашем случае будет применена категория 
 * 'one' и будет выведено "John, Marry and one other person are viewing".
 * 
 * Заметьте, что когда вы определили сдвиг, необходимо явно указать склонения для чисел от 0 и до значения сдвига. 
 * Если вы используете сдвиг равный, например, 3, нужно явно указать склонения для чисел 0, 1, 2 и 3. Необходимо 
 * также указать строки для категорий «one» и «other».
 *
 * @param {string|expression} count привязанное значение для обработки
 * @param {string} when Набор количественных категорий, значения которых являются форматом выводимой строки.
 * @param {number=} offset Сдвиг для вычитания от переданного номера.
 *
 * @example
    <doc:example>
      <doc:source>
        <script>
          function Ctrl($scope) {
            $scope.person1 = 'Igor';
            $scope.person2 = 'Misko';
            $scope.personCount = 1;
          }
        </script>
        <div ng-controller="Ctrl">
          Person 1:<input type="text" ng-model="person1" value="Igor" /><br/>
          Person 2:<input type="text" ng-model="person2" value="Misko" /><br/>
          Number of People:<input type="text" ng-model="personCount" value="1" /><br/>

          <!--- Example with simple pluralization rules for en locale --->
          Without Offset:
          <ng-pluralize count="personCount"
                        when="{'0': 'Nobody is viewing.',
                               'one': '1 person is viewing.',
                               'other': '{} people are viewing.'}">
          </ng-pluralize><br>

          <!--- Example with offset --->
          With Offset(2):
          <ng-pluralize count="personCount" offset=2
                        when="{'0': 'Nobody is viewing.',
                               '1': '{{person1}} is viewing.',
                               '2': '{{person1}} and {{person2}} are viewing.',
                               'one': '{{person1}}, {{person2}} and one other person are viewing.',
                               'other': '{{person1}}, {{person2}} and {} other people are viewing.'}">
          </ng-pluralize>
        </div>
      </doc:source>
      <doc:scenario>
        it('should show correct pluralized string', function() {
          expect(element('.doc-example-live ng-pluralize:first').text()).
                                             toBe('1 person is viewing.');
          expect(element('.doc-example-live ng-pluralize:last').text()).
                                                toBe('Igor is viewing.');

          using('.doc-example-live').input('personCount').enter('0');
          expect(element('.doc-example-live ng-pluralize:first').text()).
                                               toBe('Nobody is viewing.');
          expect(element('.doc-example-live ng-pluralize:last').text()).
                                              toBe('Nobody is viewing.');

          using('.doc-example-live').input('personCount').enter('2');
          expect(element('.doc-example-live ng-pluralize:first').text()).
                                            toBe('2 people are viewing.');
          expect(element('.doc-example-live ng-pluralize:last').text()).
                              toBe('Igor and Misko are viewing.');

          using('.doc-example-live').input('personCount').enter('3');
          expect(element('.doc-example-live ng-pluralize:first').text()).
                                            toBe('3 people are viewing.');
          expect(element('.doc-example-live ng-pluralize:last').text()).
                              toBe('Igor, Misko and one other person are viewing.');

          using('.doc-example-live').input('personCount').enter('4');
          expect(element('.doc-example-live ng-pluralize:first').text()).
                                            toBe('4 people are viewing.');
          expect(element('.doc-example-live ng-pluralize:last').text()).
                              toBe('Igor, Misko and 2 other people are viewing.');
        });

        it('should show data-binded names', function() {
          using('.doc-example-live').input('personCount').enter('4');
          expect(element('.doc-example-live ng-pluralize:last').text()).
              toBe('Igor, Misko and 2 other people are viewing.');

          using('.doc-example-live').input('person1').enter('Di');
          using('.doc-example-live').input('person2').enter('Vojta');
          expect(element('.doc-example-live ng-pluralize:last').text()).
              toBe('Di, Vojta and 2 other people are viewing.');
        });
      </doc:scenario>
    </doc:example>
 */
var ngPluralizeDirective = ['$locale', '$interpolate', function($locale, $interpolate) {
  var BRACE = /{}/g;
  return {
    restrict: 'EA',
    link: function(scope, element, attr) {
      var numberExp = attr.count,
          whenExp = element.attr(attr.$attr.when), // this is because we have {{}} in attrs
          offset = attr.offset || 0,
          whens = scope.$eval(whenExp),
          whensExpFns = {},
          startSymbol = $interpolate.startSymbol(),
          endSymbol = $interpolate.endSymbol();

      forEach(whens, function(expression, key) {
        whensExpFns[key] =
          $interpolate(expression.replace(BRACE, startSymbol + numberExp + '-' +
            offset + endSymbol));
      });

      scope.$watch(function ngPluralizeWatch() {
        var value = parseFloat(scope.$eval(numberExp));

        if (!isNaN(value)) {
          //if explicit number rule such as 1, 2, 3... is defined, just use it. Otherwise,
          //check it against pluralization rules in $locale service
          if (!whens[value]) value = $locale.pluralCat(value - offset);
           return whensExpFns[value](scope, element, true);
        } else {
          return '';
        }
      }, function ngPluralizeWatchAction(newVal) {
        element.text(newVal);
      });
    }
  };
}];
