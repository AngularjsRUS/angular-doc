'use strict';

/**
 * @ngdoc directive
 * @name ng.directive:ngRepeat
 *
 * @description
 * Директива `ngRepeat` создает экземпляры по шаблону для каждого элемента коллекции. Каждый экземпляр шаблона 
 * получает собственную область видимости, в которой создаются переменные, имеющиеся в текущем элементе коллекции и
 * в `$index` устанавливается индекс или ключ элемента.
 *
 * Специальные свойства, представленные каждым шаблонным элементом в его локальной области видимости, включают:
 * 
 *   * `$index` – `{number}` – сдвиг итератора при повторении элемента (0..length-1)
 *   * `$first` – `{boolean}` – true, если повторяемый элемент является первым элементом в коллекции.
 *   * `$middle` – `{boolean}` – true, если повторяемый элемент не первый и не последний элемент в коллекции.
 *   * `$last` – `{boolean}` – true, если повторяемый элемент является последним элементом коллекции.
 *
 * Кроме того, с помощью атрибута ngAnimate можно задать анимацию для эффектов **enter**,
 * **leave** и **move**.
 *
 * @animations
 * enter - когда новый элемент добавляется в список или показывается после фильтрации
 * leave - когда элемент удаляется из списка или скрывается из результатов фильтрации
 * move - когда сосдний пункт удаляется, изменяя порядок или когда список упорядочивается по другому критерию
 * 
 * @element ANY
 * @scope
 * @priority 1000
 * @param {repeat_expression} ngRepeat Выражение, указывающее, как перебирать коллекцию. 
 * В настоящее время поддерживаются следующие форматы:
 *
 *   * `variable in expression` – где `variable` это определенная пользователем переменная, которая будет содержать 
 *     текущее значение при переборе и `expression` – это выражение в области видимости, которое указывает на 
 *     коллекцию для перебора.
 *
 *     Например: `track in cd.tracks`.
 *
 *   * `(key, value) in expression` – где `key` и `value` могут быть идентификаторами, определенными пользователем,
 *     и `expression` это выражение в области видимости, которое возвращает коллекцию для перебора.
 * 
 *     Например: `(name, age) in {'adam':10, 'amalie':12}`.
 *
 *   * `variable in expression track by tracking_expression` – Так же можно использовать дополнительную функцию
 *     отслеживания, которая может быть использована для связывания объектов коллекции с DOM-элементами. Если функция
 *     отслеживания специально не указана, то ng-repeat ассоциирует элементы коллекции по идентичности. Нельзя иметь
 *     более одной функции отслеживания с одним и тем же ключем. (Т.е. два различных объекта будут связаны с одним 
 *     DOM-элементом, что невозможно).
 *
 *     Например: `item in items` эквивалентно `item in items track by $id(item)`. Это означает, что DOM-элементы
 *     будут ассоциироваться идентично элементам в массиве.
 *
 *     Например: `item in items track by $id(item)`. Созданная функция `$id()` может быть использована для присвоения
 *     уникального свойства `$$hashKey` каждому элементу в массиве. Это свойство затем используется в качестве ключа 
 *     для связывания DOM-элемента с соответствующим элементом в массиве по идентичности. Перемещение же элемента в 
 *     массиве будет перемещать DOM-элемент по такому же пути.
 *
 *     Например: `item in items track by item.id` это типичный образец, когда элементы загружаются из базы данных 
 *     В этом случае идентичность объекта не имеет значения. Два объекта считаются эквивалентными, если их `id`
 *     схожи.
 * 
 * @example
 * Пример инициализирует область видимости для списка имен, а затем использует `ngRepeat` для показа каждого человека:
  <example animations="true">
    <file name="index.html">
      <div ng-init="friends = [
        {name:'John', age:25, gender:'boy'},
        {name:'Jessie', age:30, gender:'girl'},
        {name:'Johanna', age:28, gender:'girl'},
        {name:'Joy', age:15, gender:'girl'},
        {name:'Mary', age:28, gender:'girl'},
        {name:'Peter', age:95, gender:'boy'},
        {name:'Sebastian', age:50, gender:'boy'},
        {name:'Erika', age:27, gender:'girl'},
        {name:'Patrick', age:40, gender:'boy'},
        {name:'Samantha', age:60, gender:'girl'}
      ]">
        I have {{friends.length}} friends. They are:
        <input type="search" ng-model="q" placeholder="filter friends..." />
        <ul>
          <li ng-repeat="friend in friends | filter:q"
              ng-animate="{enter: 'example-repeat-enter',
                          leave: 'example-repeat-leave',
                          move: 'example-repeat-move'}">
            [{{$index + 1}}] {{friend.name}} who is {{friend.age}} years old.
          </li>
        </ul>
      </div>
    </file>
    <file name="animations.css">
      .example-repeat-enter-setup,
      .example-repeat-leave-setup,
      .example-repeat-move-setup {
        -webkit-transition:all linear 0.5s;
        -moz-transition:all linear 0.5s;
        -ms-transition:all linear 0.5s;
        -o-transition:all linear 0.5s;
        transition:all linear 0.5s;
      }

      .example-repeat-enter-setup {
        line-height:0;
        opacity:0;
      }
      .example-repeat-enter-setup.example-repeat-enter-start {
        line-height:20px;
        opacity:1;
      }

      .example-repeat-leave-setup {
        opacity:1;
        line-height:20px;
      }
      .example-repeat-leave-setup.example-repeat-leave-start {
        opacity:0;
        line-height:0;
      }

      .example-repeat-move-setup { }
      .example-repeat-move-setup.example-repeat-move-start { }
    </file>
    <file name="scenario.js">
       it('should render initial data set', function() {
         var r = using('.doc-example-live').repeater('ul li');
         expect(r.count()).toBe(10);
         expect(r.row(0)).toEqual(["1","John","25"]);
         expect(r.row(1)).toEqual(["2","Jessie","30"]);
         expect(r.row(9)).toEqual(["10","Samantha","60"]);
         expect(binding('friends.length')).toBe("10");
       });

       it('should update repeater when filter predicate changes', function() {
         var r = using('.doc-example-live').repeater('ul li');
         expect(r.count()).toBe(10);

         input('q').enter('ma');

         expect(r.count()).toBe(2);
         expect(r.row(0)).toEqual(["1","Mary","28"]);
         expect(r.row(1)).toEqual(["2","Samantha","60"]);
       });
      </file>
    </example>
 */
var ngRepeatDirective = ['$parse', '$animator', function($parse, $animator) {
  var NG_REMOVED = '$$NG_REMOVED';
  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    compile: function(element, attr, linker) {
      return function($scope, $element, $attr){
        var animate = $animator($scope, $attr);
        var expression = $attr.ngRepeat;
        var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),
          trackByExp, trackByExpGetter, trackByIdFn, lhs, rhs, valueIdentifier, keyIdentifier,
          hashFnLocals = {$id: hashKey};

        if (!match) {
          throw Error("Expected ngRepeat in form of '_item_ in _collection_[ track by _id_]' but got '" +
            expression + "'.");
        }

        lhs = match[1];
        rhs = match[2];
        trackByExp = match[4];

        if (trackByExp) {
          trackByExpGetter = $parse(trackByExp);
          trackByIdFn = function(key, value, index) {
            // assign key, value, and $index to the locals so that they can be used in hash functions
            if (keyIdentifier) hashFnLocals[keyIdentifier] = key;
            hashFnLocals[valueIdentifier] = value;
            hashFnLocals.$index = index;
            return trackByExpGetter($scope, hashFnLocals);
          };
        } else {
          trackByIdFn = function(key, value) {
            return hashKey(value);
          }
        }

        match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
        if (!match) {
          throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
              lhs + "'.");
        }
        valueIdentifier = match[3] || match[1];
        keyIdentifier = match[2];

        // Store a list of elements from previous run. This is a hash where key is the item from the
        // iterator, and the value is objects with following properties.
        //   - scope: bound scope
        //   - element: previous element.
        //   - index: position
        var lastBlockMap = {};

        //watch props
        $scope.$watchCollection(rhs, function ngRepeatAction(collection){
          var index, length,
              cursor = $element,     // current position of the node
              nextCursor,
              // Same as lastBlockMap but it has the current state. It will become the
              // lastBlockMap on the next iteration.
              nextBlockMap = {},
              arrayLength,
              childScope,
              key, value, // key/value of iteration
              trackById,
              collectionKeys,
              block,       // last object information {scope, element, id}
              nextBlockOrder = [];


          if (isArray(collection)) {
            collectionKeys = collection;
          } else {
            // if object, extract keys, sort them and use to determine order of iteration over obj props
            collectionKeys = [];
            for (key in collection) {
              if (collection.hasOwnProperty(key) && key.charAt(0) != '$') {
                collectionKeys.push(key);
              }
            }
            collectionKeys.sort();
          }

          arrayLength = collectionKeys.length;

          // locate existing items
          length = nextBlockOrder.length = collectionKeys.length;
          for(index = 0; index < length; index++) {
           key = (collection === collectionKeys) ? index : collectionKeys[index];
           value = collection[key];
           trackById = trackByIdFn(key, value, index);
           if(lastBlockMap.hasOwnProperty(trackById)) {
             block = lastBlockMap[trackById]
             delete lastBlockMap[trackById];
             nextBlockMap[trackById] = block;
             nextBlockOrder[index] = block;
           } else if (nextBlockMap.hasOwnProperty(trackById)) {
             // restore lastBlockMap
             forEach(nextBlockOrder, function(block) {
               if (block && block.element) lastBlockMap[block.id] = block;
             });
             // This is a duplicate and we need to throw an error
             throw new Error('Duplicates in a repeater are not allowed. Repeater: ' + expression +
                 ' key: ' + trackById);
           } else {
             // new never before seen block
             nextBlockOrder[index] = { id: trackById };
             nextBlockMap[trackById] = false;
           }
         }

          // remove existing items
          for (key in lastBlockMap) {
            if (lastBlockMap.hasOwnProperty(key)) {
              block = lastBlockMap[key];
              animate.leave(block.element);
              block.element[0][NG_REMOVED] = true;
              block.scope.$destroy();
            }
          }

          // we are not using forEach for perf reasons (trying to avoid #call)
          for (index = 0, length = collectionKeys.length; index < length; index++) {
            key = (collection === collectionKeys) ? index : collectionKeys[index];
            value = collection[key];
            block = nextBlockOrder[index];

            if (block.element) {
              // if we have already seen this object, then we need to reuse the
              // associated scope/element
              childScope = block.scope;

              nextCursor = cursor[0];
              do {
                nextCursor = nextCursor.nextSibling;
              } while(nextCursor && nextCursor[NG_REMOVED]);

              if (block.element[0] == nextCursor) {
                // do nothing
                cursor = block.element;
              } else {
                // existing item which got moved
                animate.move(block.element, null, cursor);
                cursor = block.element;
              }
            } else {
              // new item which we don't know about
              childScope = $scope.$new();
            }

            childScope[valueIdentifier] = value;
            if (keyIdentifier) childScope[keyIdentifier] = key;
            childScope.$index = index;
            childScope.$first = (index === 0);
            childScope.$last = (index === (arrayLength - 1));
            childScope.$middle = !(childScope.$first || childScope.$last);

            if (!block.element) {
              linker(childScope, function(clone) {
                animate.enter(clone, null, cursor);
                cursor = clone;
                block.scope = childScope;
                block.element = clone;
                nextBlockMap[block.id] = block;
              });
            }
          }
          lastBlockMap = nextBlockMap;
        });
      };
    }
  };
}];

