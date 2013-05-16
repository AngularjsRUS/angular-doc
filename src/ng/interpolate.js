'use strict';

/**
 * @ngdoc object
 * @name ng.$interpolateProvider
 * @function
 *
 * @description
 *
 * Используется для настройки преобразования разметки. По умолчанию `{{` и `}}`.
 */
function $InterpolateProvider() {
  var startSymbol = '{{';
  var endSymbol = '}}';

  /**
   * @ngdoc method
   * @name ng.$interpolateProvider#startSymbol
   * @methodOf ng.$interpolateProvider
   * @description
   * Символ, указывающий на начало интерполируемой строки. По умолчанию `{{`.
   *
   * @param {string=} value Новое значение символа начала.
   * @returns {string|self} Возвращает символ, если используется как геттер и самого себя, если — как сеттер.
   */
  this.startSymbol = function(value){
    if (value) {
      startSymbol = value;
      return this;
    } else {
      return startSymbol;
    }
  };

  /**
   * @ngdoc method
   * @name ng.$interpolateProvider#endSymbol
   * @methodOf ng.$interpolateProvider
   * @description
   * Символ, указывающий на конец интерполируемой строки. По умолчанию `}}`.
   *
   * @param {string=} value Новое значение символа конца.
   * @returns {string|self} Возвращает символ, если используется как геттер и самого себя, если — как сеттер.
   */
  this.endSymbol = function(value){
    if (value) {
      endSymbol = value;
      return this;
    } else {
      return endSymbol;
    }
  };


  this.$get = ['$parse', '$exceptionHandler', function($parse, $exceptionHandler) {
    var startSymbolLength = startSymbol.length,
        endSymbolLength = endSymbol.length;

    /**
     * @ngdoc function
     * @name ng.$interpolate
     * @function
     *
     * @requires $parse
     *
     * @description
     *
     * Компилирует строку с разметкой в функцию интерполяции. Это сервис используется сервисом компиляции HTML 
     * {@link ng.$compile $compile} для связывания данных. См. {@link ng.$interpolateProvider $interpolateProvider} 
     * для настройки разметки интерполяции.
     *
     *
       <pre>
         var $interpolate = ...; // внедрен
         var exp = $interpolate('Hello {{name}}!');
         expect(exp({name:'Angular'}).toEqual('Hello Angular!');
       </pre>
     *
     *
     * @param {string} text Текст с разметкой для интерполяции.
     * @param {boolean=} mustHaveExpression Если установлено в true, тогда строка интерполяции должна иметь 
     *    встроенные выражения, чтобы вернуть функцию интерполяции. Строка, в которой нет 
     *    встроенных выражений, вместо функции интерполяции будет возвращать null.
     * @returns {function(context)} функция интерполяции, которая используется для компиляции 
     *    интерполируемой строки. Она имеет следующие параметры:
     *
     *    * `context`: объект, который принимает участие в вычислении любых встроенных выражений.
     *
     */
    function $interpolate(text, mustHaveExpression) {
      var startIndex,
          endIndex,
          index = 0,
          parts = [],
          length = text.length,
          hasInterpolation = false,
          fn,
          exp,
          concat = [];

      while(index < length) {
        if ( ((startIndex = text.indexOf(startSymbol, index)) != -1) &&
             ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1) ) {
          (index != startIndex) && parts.push(text.substring(index, startIndex));
          parts.push(fn = $parse(exp = text.substring(startIndex + startSymbolLength, endIndex)));
          fn.exp = exp;
          index = endIndex + endSymbolLength;
          hasInterpolation = true;
        } else {
          // we did not find anything, so we have to add the remainder to the parts array
          (index != length) && parts.push(text.substring(index));
          index = length;
        }
      }

      if (!(length = parts.length)) {
        // we added, nothing, must have been an empty string.
        parts.push('');
        length = 1;
      }

      if (!mustHaveExpression  || hasInterpolation) {
        concat.length = length;
        fn = function(context) {
          try {
            for(var i = 0, ii = length, part; i<ii; i++) {
              if (typeof (part = parts[i]) == 'function') {
                part = part(context);
                if (part == null || part == undefined) {
                  part = '';
                } else if (typeof part != 'string') {
                  part = toJson(part);
                }
              }
              concat[i] = part;
            }
            return concat.join('');
          }
          catch(err) {
            var newErr = new Error('Error while interpolating: ' + text + '\n' + err.toString());
            $exceptionHandler(newErr);
          }
        };
        fn.exp = text;
        fn.parts = parts;
        return fn;
      }
    }


    /**
     * @ngdoc method
     * @name ng.$interpolate#startSymbol
     * @methodOf ng.$interpolate
     * @description
     * Символ, указывающий на начало интерполируемой строки. По умолчанию `{{`.
     *
     * Используйте {@link ng.$interpolateProvider#startSymbol $interpolateProvider#startSymbol} для изменения
     * символа.
     *
     * @returns {string} символ начала.
     */
    $interpolate.startSymbol = function() {
      return startSymbol;
    }


    /**
     * @ngdoc method
     * @name ng.$interpolate#endSymbol
     * @methodOf ng.$interpolate
     * @description
     * Символ, указывающий на конец интерполируемой строки. По умолчанию `}}`.
     *
     * Используйте {@link ng.$interpolateProvider#endSymbol $interpolateProvider#endSymbol} для изменения
     * символа.
     *
     * @returns {string} символ конца.
     */
    $interpolate.endSymbol = function() {
      return endSymbol;
    }

    return $interpolate;
  }];
}

