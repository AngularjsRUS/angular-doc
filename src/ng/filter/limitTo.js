'use strict';

/**
 * @ngdoc function
 * @name ng.filter:limitTo
 * @function
 *
 * @description
 * 
 * Метод создает новый массив или строку, содержащую только указанное число элементов. Элементы беруться как с начала 
 * так и с конца исходного массива или строки, в зависимости от знака (позитивного или негативного) лимита.
 *
 * Примечание: Этот метод используется для лимитирования массива (с типом `Array`). Смотрите * {@link ng.$filter} для 
 * более детальной информации об Angular массивах.
 *
 * @param {Array|string} input Исходный массив или строка, которая будет лимитирована.
 * @param {string|number} limit Длина возвращенного массива или строки. Если `limit` число 
 *     положительное, то заданное число элементов будет взято из массива/строки по порядку начиная с первого элемента.
 *     Если негативное, то по той-же схеме с последнего элемента. Предел будет обрезан если превышает `array.length`
 * @returns {Array|string} Новый подмассив или подстрока ограниченная значением `limit`.
 *
 * @example
   <doc:example>
     <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.numbers = [1,2,3,4,5,6,7,8,9];
           $scope.letters = "abcdefghi";
           $scope.numLimit = 3;
           $scope.letterLimit = 3;
         }
       </script>
       <div ng-controller="Ctrl">
         Limit {{numbers}} to: <input type="integer" ng-model="numLimit">
         <p>Output numbers: {{ numbers | limitTo:numLimit }}</p>
         Limit {{letters}} to: <input type="integer" ng-model="letterLimit">
         <p>Output letters: {{ letters | limitTo:letterLimit }}</p>
       </div>
     </doc:source>
     <doc:scenario>
       it('should limit the number array to first three items', function() {
         expect(element('.doc-example-live input[ng-model=numLimit]').val()).toBe('3');
         expect(element('.doc-example-live input[ng-model=letterLimit]').val()).toBe('3');
         expect(binding('numbers | limitTo:numLimit')).toEqual('[1,2,3]');
         expect(binding('letters | limitTo:letterLimit')).toEqual('abc');
       });

       it('should update the output when -3 is entered', function() {
         input('numLimit').enter(-3);
         input('letterLimit').enter(-3);
         expect(binding('numbers | limitTo:numLimit')).toEqual('[7,8,9]');
         expect(binding('letters | limitTo:letterLimit')).toEqual('ghi');
       });

       it('should not exceed the maximum size of input array', function() {
         input('numLimit').enter(100);
         input('letterLimit').enter(100);
         expect(binding('numbers | limitTo:numLimit')).toEqual('[1,2,3,4,5,6,7,8,9]');
         expect(binding('letters | limitTo:letterLimit')).toEqual('abcdefghi');
       });
     </doc:scenario>
   </doc:example>
 */
function limitToFilter(){
  return function(input, limit) {
    if (!isArray(input) && !isString(input)) return input;
    
    limit = int(limit);

    if (isString(input)) {
      //NaN check on limit
      if (limit) {
        return limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length);
      } else {
        return "";
      }
    }

    var out = [],
      i, n;

    // if abs(limit) exceeds maximum length, trim it
    if (limit > input.length)
      limit = input.length;
    else if (limit < -input.length)
      limit = -input.length;

    if (limit > 0) {
      i = 0;
      n = limit;
    } else {
      i = input.length + limit;
      n = input.length;
    }

    for (; i<n; i++) {
      out.push(input[i]);
    }

    return out;
  }
}
