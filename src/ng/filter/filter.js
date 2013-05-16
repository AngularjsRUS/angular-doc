'use strict';

/**
 * @ngdoc filter
 * @name ng.filter:filter
 * @function
 *
 * @description
 * Выбор из массива некоторых элементов и возврат их в новом массиве.
 * 
 * Обратите внимание: Эта функция используется только для типа Array в выражениях Angular. Смотрите 
 * {@link ng.$filter} для большей информацией об Angular массивах.
 *
 * @param {Array} array Входной массив.
 * @param {string|Object|function()} expression Основание для использования при выборе элементов из входного массива.
 *
 *   Может быть одним из:
 *
 *   - `string`: Если основание является подстрокой элемента входного массива, то этот элемент включается 
 *     в результатирующий массив. Все строки или объекты со строковыми свойствами во входном массиве, 
 *     которые содержат подстроку основания будут возвращены. Основание может быть с отрицанием, для этого 
 *     нужно применить префикс `!`.
 *
 *   - `Object`: Объект-паттерн, который используется для фильтрации специфических свойств в объектах 
 *     содержащихся в массиве. Например, основание `{name:"M", phone:"1"}` вернет массив с элементами, 
 *     у которых имеется свойство name содержащее "M" и имеется свойство phone содержащее "1". Если 
 *     в качестве имени использовать `$` (как в `{$:"text"}`) то в результате будут искаться все объекты 
 *     у которых любое свойство содержит требуемое значение. Это эквивалент простому текстовому основанию, 
 *     расмотренному чуть раньше.
 *
 *   - `function`: функция основания может быть использована для реализации собственной логики фильтрации.
 *     Эта функция вызывается для каждого элемента входного массива. В результате в выходном массиве будут 
 *     только элементы, для которых эта функция вернет true.
 *
 * @param {function(expected, actual)|true|undefined} comparator Компаратор, который используется чтобы 
 *     определить что ожидаемое значение (из фильтра) и фактическое значение (из объекта в массиве) равны.
 *
 *   Может быть одним из:
 *
 *     - `function(expected, actual)`:
 *       Функция, которая передаст значение объекту и значение основания для сравнения и должна вернуть true, 
 *       если этот элемент должен быть включен в результат фильтрации.
 *
 *     - `true`: Короткая запись для `function(expected, actual) { return angular.equals(expected, actual)}`.
 *       которая означает строгое сравнение ожидаемого с имеющимся.
 *
 *     - `false|undefined`: Короткая запись функции, которая ищет подстроку без учета регистра.
 *
 * @example
   <doc:example>
     <doc:source>
       <div ng-init="friends = [{name:'John', phone:'555-1276'},
                                {name:'Mary', phone:'800-BIG-MARY'},
                                {name:'Mike', phone:'555-4321'},
                                {name:'Adam', phone:'555-5678'},
                                {name:'Julie', phone:'555-8765'},
                                {name:'Juliette', phone:'555-5678'}]"></div>

       Search: <input ng-model="searchText">
       <table id="searchTextResults">
         <tr><th>Name</th><th>Phone</th></tr>
         <tr ng-repeat="friend in friends | filter:searchText">
           <td>{{friend.name}}</td>
           <td>{{friend.phone}}</td>
         </tr>
       </table>
       <hr>
       Any: <input ng-model="search.$"> <br>
       Name only <input ng-model="search.name"><br>
       Phone only <input ng-model="search.phone"å><br>
       Equality <input type="checkbox" ng-model="strict"><br>
       <table id="searchObjResults">
         <tr><th>Name</th><th>Phone</th></tr>
         <tr ng-repeat="friend in friends | filter:search:strict">
           <td>{{friend.name}}</td>
           <td>{{friend.phone}}</td>
         </tr>
       </table>
     </doc:source>
     <doc:scenario>
       it('should search across all fields when filtering with a string', function() {
         input('searchText').enter('m');
         expect(repeater('#searchTextResults tr', 'friend in friends').column('friend.name')).
           toEqual(['Mary', 'Mike', 'Adam']);

         input('searchText').enter('76');
         expect(repeater('#searchTextResults tr', 'friend in friends').column('friend.name')).
           toEqual(['John', 'Julie']);
       });

       it('should search in specific fields when filtering with a predicate object', function() {
         input('search.$').enter('i');
         expect(repeater('#searchObjResults tr', 'friend in friends').column('friend.name')).
           toEqual(['Mary', 'Mike', 'Julie', 'Juliette']);
       });
       it('should use a equal comparison when comparator is true', function() {
         input('search.name').enter('Julie');
         input('strict').check();
         expect(repeater('#searchObjResults tr', 'friend in friends').column('friend.name')).
           toEqual(['Julie']);
       });
     </doc:scenario>
   </doc:example>
 */
function filterFilter() {
  return function(array, expression, comperator) {
    if (!isArray(array)) return array;
    var predicates = [];
    predicates.check = function(value) {
      for (var j = 0; j < predicates.length; j++) {
        if(!predicates[j](value)) {
          return false;
        }
      }
      return true;
    };
    switch(typeof comperator) {
      case "function":
        break;
      case "boolean":
        if(comperator == true) {
          comperator = function(obj, text) {
            return angular.equals(obj, text);
          }
          break;
        }
      default:
        comperator = function(obj, text) {
          text = (''+text).toLowerCase();
          return (''+obj).toLowerCase().indexOf(text) > -1
        };
    }
    var search = function(obj, text){
      if (typeof text == 'string' && text.charAt(0) === '!') {
        return !search(obj, text.substr(1));
      }
      switch (typeof obj) {
        case "boolean":
        case "number":
        case "string":
          return comperator(obj, text);
        case "object":
          switch (typeof text) {
            case "object":
              return comperator(obj, text);
              break;
            default:
              for ( var objKey in obj) {
                if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
                  return true;
                }
              }
              break;
          }
          return false;
        case "array":
          for ( var i = 0; i < obj.length; i++) {
            if (search(obj[i], text)) {
              return true;
            }
          }
          return false;
        default:
          return false;
      }
    };
    switch (typeof expression) {
      case "boolean":
      case "number":
      case "string":
        expression = {$:expression};
      case "object":
        for (var key in expression) {
          if (key == '$') {
            (function() {
              if (!expression[key]) return;
              var path = key
              predicates.push(function(value) {
                return search(value, expression[path]);
              });
            })();
          } else {
            (function() {
              if (!expression[key]) return;
              var path = key;
              predicates.push(function(value) {
                return search(getter(value,path), expression[path]);
              });
            })();
          }
        }
        break;
      case 'function':
        predicates.push(expression);
        break;
      default:
        return array;
    }
    var filtered = [];
    for ( var j = 0; j < array.length; j++) {
      var value = array[j];
      if (predicates.check(value)) {
        filtered.push(value);
      }
    }
    return filtered;
  }
}
