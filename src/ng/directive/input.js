'use strict';

var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;

var inputType = {

  /**
   * @ngdoc inputType
   * @name ng.directive:input.text
   *
   * @description
   * Стандартное HTML поле ввода текста с поддержкой связывания данных.
   *
   * @param {string} ngModel Ассоциированное angular-выражение для связывания данных.
   * @param {string=} name Имя свойства, под которым элемент управления будет доступен в области видимости.
   * @param {string=} required Устанавливает ключ ошибки `required` если поле пусто.
   * @param {string=} ngRequired Устанавливает атрибут `required`, если выражение возвращает true.
   *    Используйте `ngRequired` вместо `required` если необходимо связать данные с атрибутом `required`.
   * @param {number=} ngMinlength Устанавливает ключ ошибки `minlength` если значение короче, чем заданное количество 
   *    знаков.
   * @param {number=} ngMaxlength Устанавливает ключ ошибки `maxlength` если значение длиннее, чем заданное количество 
   *    знаков.
   * @param {string=} ngPattern Устанавливает ключ ошибки `pattern` если значение не соответствует RegExp-шаблону. 
   *    Значение сравнивается с переданным шаблоном, если он передается в формате `/regexp/`, в других случаях 
   *    считается, что передано свойство текущей области видимости, которое содержит нужный шаблон.
   * @param {string=} ngChange angular-выражение, которое будет выполнено, когда изменится содержимое элемента 
   *    управления в результате взаимодействия с пользователем.
   * @param {boolean=} [ngTrim=true] Если установлено false Angular не будет автоматически удалять концевые пробелы
   *    из введенных данных
   *
   * @example
      <doc:example>
        <doc:source>
         <script>
           function Ctrl($scope) {
             $scope.text = 'guest';
             $scope.word = /^\s*\w*\s*$/;
           }
         </script>
         <form name="myForm" ng-controller="Ctrl">
           Single word: <input type="text" name="input" ng-model="text"
                               ng-pattern="word" required ng-trim="false">
           <span class="error" ng-show="myForm.input.$error.required">
             Required!</span>
           <span class="error" ng-show="myForm.input.$error.pattern">
             Single word only!</span>

           <tt>text = {{text}}</tt><br/>
           <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
           <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
           <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
           <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
          </form>
        </doc:source>
        <doc:scenario>
          it('should initialize to model', function() {
            expect(binding('text')).toEqual('guest');
            expect(binding('myForm.input.$valid')).toEqual('true');
          });

          it('should be invalid if empty', function() {
            input('text').enter('');
            expect(binding('text')).toEqual('');
            expect(binding('myForm.input.$valid')).toEqual('false');
          });

          it('should be invalid if multi word', function() {
            input('text').enter('hello world');
            expect(binding('myForm.input.$valid')).toEqual('false');
          });

          it('should not be trimmed', function() {
            input('text').enter('untrimmed ');
            expect(binding('text')).toEqual('untrimmed ');
            expect(binding('myForm.input.$valid')).toEqual('true');
          });
        </doc:scenario>
      </doc:example>
   */
  'text': textInputType,


  /**
   * @ngdoc inputType
   * @name ng.directive:input.number
   *
   * @description
   * Текстовое поле для ввода чисел с проверкой и преобразованием. Устанавливает ключ ошибки `number` если введенное 
   * значение не является числом.
   *
   * @param {string} ngModel Ассоциированное angular-выражение для связывания данных.
   * @param {string=} name Имя свойства, под которым элемент управления будет доступен в области видимости.
   * @param {string=} min Устанавливает ключ ошибки `min` если введенное значение меньше `min`.
   * @param {string=} max Устанавливает ключ ошибки `max` если введенное значение больше `max`.
   * @param {string=} required Устанавливает ключ ошибки `required` если поле пусто.
   * @param {string=} ngRequired Устанавливает атрибут `required`, если выражение возвращает true.
   *    Используйте `ngRequired` вместо `required` если необходимо связать данные с атрибутом `required`.
   * @param {number=} ngMinlength Устанавливает ключ ошибки `minlength` если значение короче, чем заданное количество 
   *    знаков.
   * @param {number=} ngMaxlength Устанавливает ключ ошибки `maxlength` если значение длиннее, чем заданное количество 
   *    знаков.
   * @param {string=} ngPattern Устанавливает ключ ошибки `pattern` если значение не соответствует RegExp-шаблону. 
   *    Значение сравнивается с переданным шаблоном, если он передается в формате `/regexp/`, в других случаях 
   *    считается, что передано свойство текущей области видимости, которое содержит нужный шаблон.
   * @param {string=} ngChange angular-выражение, которое будет выполнено, когда изменится содержимое элемента 
   *    управления в результате взаимодействия с пользователем.
   *
   * @example
      <doc:example>
        <doc:source>
         <script>
           function Ctrl($scope) {
             $scope.value = 12;
           }
         </script>
         <form name="myForm" ng-controller="Ctrl">
           Number: <input type="number" name="input" ng-model="value"
                          min="0" max="99" required>
           <span class="error" ng-show="myForm.list.$error.required">
             Required!</span>
           <span class="error" ng-show="myForm.list.$error.number">
             Not valid number!</span>
           <tt>value = {{value}}</tt><br/>
           <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
           <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
           <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
           <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
          </form>
        </doc:source>
        <doc:scenario>
          it('should initialize to model', function() {
           expect(binding('value')).toEqual('12');
           expect(binding('myForm.input.$valid')).toEqual('true');
          });

          it('should be invalid if empty', function() {
           input('value').enter('');
           expect(binding('value')).toEqual('');
           expect(binding('myForm.input.$valid')).toEqual('false');
          });

          it('should be invalid if over max', function() {
           input('value').enter('123');
           expect(binding('value')).toEqual('');
           expect(binding('myForm.input.$valid')).toEqual('false');
          });
        </doc:scenario>
      </doc:example>
   */
  'number': numberInputType,


  /**
   * @ngdoc inputType
   * @name ng.directive:input.url
   *
   * @description
   * Поле ввода URL-адреса с проверкой его корректности. Устанавливает ключ ошибки `url` если введенные данные 
   * не являются правильным URL.
   *
   * @param {string} ngModel Ассоциированное angular-выражение для связывания данных.
   * @param {string=} name Имя свойства, под которым элемент управления будет доступен в области видимости.
   * @param {string=} required Устанавливает ключ ошибки `required` если поле пусто.
   * @param {string=} ngRequired Устанавливает атрибут `required`, если выражение возвращает true.
   *    Используйте `ngRequired` вместо `required` если необходимо связать данные с атрибутом `required`.
   * @param {number=} ngMinlength Устанавливает ключ ошибки `minlength` если значение короче, чем заданное количество 
   *    знаков.
   * @param {number=} ngMaxlength Устанавливает ключ ошибки `maxlength` если значение длиннее, чем заданное количество 
   *    знаков.
   * @param {string=} ngPattern Устанавливает ключ ошибки `pattern` если значение не соответствует RegExp-шаблону. 
   *    Значение сравнивается с переданным шаблоном, если он передается в формате `/regexp/`, в других случаях 
   *    считается, что передано свойство текущей области видимости, которое содержит нужный шаблон.
   * @param {string=} ngChange angular-выражение, которое будет выполнено, когда изменится содержимое элемента 
   *    управления в результате взаимодействия с пользователем.
   *
   * @example
      <doc:example>
        <doc:source>
         <script>
           function Ctrl($scope) {
             $scope.text = 'http://google.com';
           }
         </script>
         <form name="myForm" ng-controller="Ctrl">
           URL: <input type="url" name="input" ng-model="text" required>
           <span class="error" ng-show="myForm.input.$error.required">
             Required!</span>
           <span class="error" ng-show="myForm.input.$error.url">
             Not valid url!</span>
           <tt>text = {{text}}</tt><br/>
           <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
           <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
           <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
           <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
           <tt>myForm.$error.url = {{!!myForm.$error.url}}</tt><br/>
          </form>
        </doc:source>
        <doc:scenario>
          it('should initialize to model', function() {
            expect(binding('text')).toEqual('http://google.com');
            expect(binding('myForm.input.$valid')).toEqual('true');
          });

          it('should be invalid if empty', function() {
            input('text').enter('');
            expect(binding('text')).toEqual('');
            expect(binding('myForm.input.$valid')).toEqual('false');
          });

          it('should be invalid if not url', function() {
            input('text').enter('xxx');
            expect(binding('myForm.input.$valid')).toEqual('false');
          });
        </doc:scenario>
      </doc:example>
   */
  'url': urlInputType,


  /**
   * @ngdoc inputType
   * @name ng.directive:input.email
   *
   * @description
   * Поле ввода адреса электронной почты с проверкой его корректности. Устанавливает ключ ошибки `email` если значение 
   * ввода не является правильным адресом электронной почты.
   *
   * @param {string} ngModel Ассоциированное angular-выражение для связывания данных.
   * @param {string=} name Имя свойства, под которым элемент управления будет доступен в области видимости.
   * @param {string=} required Устанавливает ключ ошибки `required` если поле пусто.
   * @param {string=} ngRequired Устанавливает атрибут `required`, если выражение возвращает true.
   *    Используйте `ngRequired` вместо `required` если необходимо связать данные с атрибутом `required`.
   * @param {number=} ngMinlength Устанавливает ключ ошибки `minlength` если значение короче, чем заданное количество 
   *    знаков.
   * @param {number=} ngMaxlength Устанавливает ключ ошибки `maxlength` если значение длиннее, чем заданное количество 
   *    знаков.
   * @param {string=} ngPattern Устанавливает ключ ошибки `pattern` если значение не соответствует RegExp-шаблону. 
   *    Значение сравнивается с переданным шаблоном, если он передается в формате `/regexp/`, в других случаях 
   *    считается, что передано свойство текущей области видимости, которое содержит нужный шаблон.
   *
   * @example
      <doc:example>
        <doc:source>
         <script>
           function Ctrl($scope) {
             $scope.text = 'me@example.com';
           }
         </script>
           <form name="myForm" ng-controller="Ctrl">
             Email: <input type="email" name="input" ng-model="text" required>
             <span class="error" ng-show="myForm.input.$error.required">
               Required!</span>
             <span class="error" ng-show="myForm.input.$error.email">
               Not valid email!</span>
             <tt>text = {{text}}</tt><br/>
             <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
             <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
             <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
             <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
             <tt>myForm.$error.email = {{!!myForm.$error.email}}</tt><br/>
           </form>
        </doc:source>
        <doc:scenario>
          it('should initialize to model', function() {
            expect(binding('text')).toEqual('me@example.com');
            expect(binding('myForm.input.$valid')).toEqual('true');
          });

          it('should be invalid if empty', function() {
            input('text').enter('');
            expect(binding('text')).toEqual('');
            expect(binding('myForm.input.$valid')).toEqual('false');
          });

          it('should be invalid if not email', function() {
            input('text').enter('xxx');
            expect(binding('myForm.input.$valid')).toEqual('false');
          });
        </doc:scenario>
      </doc:example>
   */
  'email': emailInputType,


  /**
   * @ngdoc inputType
   * @name ng.directive:input.radio
   *
   * @description
   * HTML радио-кнопки.
   *
   * @param {string} ngModel Ассоциированное angular-выражение для связывания данных.
   * @param {string} value Значение, которое получит связанная модель, после выбора текущей радио-кнопки.
   * @param {string=} name Имя свойства, под которым элемент управления будет доступен в области видимости.
   * @param {string=} ngChange angular-выражение, которое будет выполнено, когда изменится содержимое элемента 
   *    управления в результате взаимодействия с пользователем.
   *
   * @example
      <doc:example>
        <doc:source>
         <script>
           function Ctrl($scope) {
             $scope.color = 'blue';
           }
         </script>
         <form name="myForm" ng-controller="Ctrl">
           <input type="radio" ng-model="color" value="red">  Red <br/>
           <input type="radio" ng-model="color" value="green"> Green <br/>
           <input type="radio" ng-model="color" value="blue"> Blue <br/>
           <tt>color = {{color}}</tt><br/>
          </form>
        </doc:source>
        <doc:scenario>
          it('should change state', function() {
            expect(binding('color')).toEqual('blue');

            input('color').select('red');
            expect(binding('color')).toEqual('red');
          });
        </doc:scenario>
      </doc:example>
   */
  'radio': radioInputType,


  /**
   * @ngdoc inputType
   * @name ng.directive:input.checkbox
   *
   * @description
   * HTML чекбокс.
   *
   * @param {string} ngModel Ассоциированное angular-выражение для связывания данных.
   * @param {string=} name Имя свойства, под которым элемент управления будет доступен в области видимости.
   * @param {string=} ngTrueValue Значение, в которое установится связанное свойство, если флаг установлен.
   * @param {string=} ngFalseValue Значение, в которое установится связанное свойство, если флаг сброшен.
   * @param {string=} ngChange angular-выражение, которое будет выполнено, когда изменится содержимое элемента 
   *    управления в результате взаимодействия с пользователем.
   *
   * @example
      <doc:example>
        <doc:source>
         <script>
           function Ctrl($scope) {
             $scope.value1 = true;
             $scope.value2 = 'YES'
           }
         </script>
         <form name="myForm" ng-controller="Ctrl">
           Value1: <input type="checkbox" ng-model="value1"> <br/>
           Value2: <input type="checkbox" ng-model="value2"
                          ng-true-value="YES" ng-false-value="NO"> <br/>
           <tt>value1 = {{value1}}</tt><br/>
           <tt>value2 = {{value2}}</tt><br/>
          </form>
        </doc:source>
        <doc:scenario>
          it('should change state', function() {
            expect(binding('value1')).toEqual('true');
            expect(binding('value2')).toEqual('YES');

            input('value1').check();
            input('value2').check();
            expect(binding('value1')).toEqual('false');
            expect(binding('value2')).toEqual('NO');
          });
        </doc:scenario>
      </doc:example>
   */
  'checkbox': checkboxInputType,

  'hidden': noop,
  'button': noop,
  'submit': noop,
  'reset': noop
};


function isEmpty(value) {
  return isUndefined(value) || value === '' || value === null || value !== value;
}


function textInputType(scope, element, attr, ctrl, $sniffer, $browser) {

  var listener = function() {
    var value = element.val();

    // By default we will trim the value
    // If the attribute ng-trim exists we will avoid trimming
    // e.g. <input ng-model="foo" ng-trim="false">
    if (toBoolean(attr.ngTrim || 'T')) {
      value = trim(value);
    }

    if (ctrl.$viewValue !== value) {
      scope.$apply(function() {
        ctrl.$setViewValue(value);
      });
    }
  };

  // if the browser does support "input" event, we are fine - except on IE9 which doesn't fire the
  // input event on backspace, delete or cut
  if ($sniffer.hasEvent('input')) {
    element.bind('input', listener);
  } else {
    var timeout;

    var deferListener = function() {
      if (!timeout) {
        timeout = $browser.defer(function() {
          listener();
          timeout = null;
        });
      }
    };

    element.bind('keydown', function(event) {
      var key = event.keyCode;

      // ignore
      //    command            modifiers                   arrows
      if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) return;

      deferListener();
    });

    // if user paste into input using mouse, we need "change" event to catch it
    element.bind('change', listener);

    // if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
    if ($sniffer.hasEvent('paste')) {
      element.bind('paste cut', deferListener);
    }
  }


  ctrl.$render = function() {
    element.val(isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
  };

  // pattern validator
  var pattern = attr.ngPattern,
      patternValidator,
      match;

  var validate = function(regexp, value) {
    if (isEmpty(value) || regexp.test(value)) {
      ctrl.$setValidity('pattern', true);
      return value;
    } else {
      ctrl.$setValidity('pattern', false);
      return undefined;
    }
  };

  if (pattern) {
    match = pattern.match(/^\/(.*)\/([gim]*)$/);
    if (match) {
      pattern = new RegExp(match[1], match[2]);
      patternValidator = function(value) {
        return validate(pattern, value)
      };
    } else {
      patternValidator = function(value) {
        var patternObj = scope.$eval(pattern);

        if (!patternObj || !patternObj.test) {
          throw new Error('Expected ' + pattern + ' to be a RegExp but was ' + patternObj);
        }
        return validate(patternObj, value);
      };
    }

    ctrl.$formatters.push(patternValidator);
    ctrl.$parsers.push(patternValidator);
  }

  // min length validator
  if (attr.ngMinlength) {
    var minlength = int(attr.ngMinlength);
    var minLengthValidator = function(value) {
      if (!isEmpty(value) && value.length < minlength) {
        ctrl.$setValidity('minlength', false);
        return undefined;
      } else {
        ctrl.$setValidity('minlength', true);
        return value;
      }
    };

    ctrl.$parsers.push(minLengthValidator);
    ctrl.$formatters.push(minLengthValidator);
  }

  // max length validator
  if (attr.ngMaxlength) {
    var maxlength = int(attr.ngMaxlength);
    var maxLengthValidator = function(value) {
      if (!isEmpty(value) && value.length > maxlength) {
        ctrl.$setValidity('maxlength', false);
        return undefined;
      } else {
        ctrl.$setValidity('maxlength', true);
        return value;
      }
    };

    ctrl.$parsers.push(maxLengthValidator);
    ctrl.$formatters.push(maxLengthValidator);
  }
}

function numberInputType(scope, element, attr, ctrl, $sniffer, $browser) {
  textInputType(scope, element, attr, ctrl, $sniffer, $browser);

  ctrl.$parsers.push(function(value) {
    var empty = isEmpty(value);
    if (empty || NUMBER_REGEXP.test(value)) {
      ctrl.$setValidity('number', true);
      return value === '' ? null : (empty ? value : parseFloat(value));
    } else {
      ctrl.$setValidity('number', false);
      return undefined;
    }
  });

  ctrl.$formatters.push(function(value) {
    return isEmpty(value) ? '' : '' + value;
  });

  if (attr.min) {
    var min = parseFloat(attr.min);
    var minValidator = function(value) {
      if (!isEmpty(value) && value < min) {
        ctrl.$setValidity('min', false);
        return undefined;
      } else {
        ctrl.$setValidity('min', true);
        return value;
      }
    };

    ctrl.$parsers.push(minValidator);
    ctrl.$formatters.push(minValidator);
  }

  if (attr.max) {
    var max = parseFloat(attr.max);
    var maxValidator = function(value) {
      if (!isEmpty(value) && value > max) {
        ctrl.$setValidity('max', false);
        return undefined;
      } else {
        ctrl.$setValidity('max', true);
        return value;
      }
    };

    ctrl.$parsers.push(maxValidator);
    ctrl.$formatters.push(maxValidator);
  }

  ctrl.$formatters.push(function(value) {

    if (isEmpty(value) || isNumber(value)) {
      ctrl.$setValidity('number', true);
      return value;
    } else {
      ctrl.$setValidity('number', false);
      return undefined;
    }
  });
}

function urlInputType(scope, element, attr, ctrl, $sniffer, $browser) {
  textInputType(scope, element, attr, ctrl, $sniffer, $browser);

  var urlValidator = function(value) {
    if (isEmpty(value) || URL_REGEXP.test(value)) {
      ctrl.$setValidity('url', true);
      return value;
    } else {
      ctrl.$setValidity('url', false);
      return undefined;
    }
  };

  ctrl.$formatters.push(urlValidator);
  ctrl.$parsers.push(urlValidator);
}

function emailInputType(scope, element, attr, ctrl, $sniffer, $browser) {
  textInputType(scope, element, attr, ctrl, $sniffer, $browser);

  var emailValidator = function(value) {
    if (isEmpty(value) || EMAIL_REGEXP.test(value)) {
      ctrl.$setValidity('email', true);
      return value;
    } else {
      ctrl.$setValidity('email', false);
      return undefined;
    }
  };

  ctrl.$formatters.push(emailValidator);
  ctrl.$parsers.push(emailValidator);
}

function radioInputType(scope, element, attr, ctrl) {
  // make the name unique, if not defined
  if (isUndefined(attr.name)) {
    element.attr('name', nextUid());
  }

  element.bind('click', function() {
    if (element[0].checked) {
      scope.$apply(function() {
        ctrl.$setViewValue(attr.value);
      });
    }
  });

  ctrl.$render = function() {
    var value = attr.value;
    element[0].checked = (value == ctrl.$viewValue);
  };

  attr.$observe('value', ctrl.$render);
}

function checkboxInputType(scope, element, attr, ctrl) {
  var trueValue = attr.ngTrueValue,
      falseValue = attr.ngFalseValue;

  if (!isString(trueValue)) trueValue = true;
  if (!isString(falseValue)) falseValue = false;

  element.bind('click', function() {
    scope.$apply(function() {
      ctrl.$setViewValue(element[0].checked);
    });
  });

  ctrl.$render = function() {
    element[0].checked = ctrl.$viewValue;
  };

  ctrl.$formatters.push(function(value) {
    return value === trueValue;
  });

  ctrl.$parsers.push(function(value) {
    return value ? trueValue : falseValue;
  });
}


/**
 * @ngdoc directive
 * @name ng.directive:textarea
 * @restrict E
 *
 * @description
 * HTML текстовое поле со связыванием данных. Связывание данных и проверка правильности ввода для этого элемента 
 * такие же, как и для других {@link ng.directive:input input-элементов}.
 *
 * @param {string} ngModel Ассоциированное angular-выражение для связывания данных.
 * @param {string=} name Имя свойства, под которым элемент управления будет доступен в области видимости.
 * @param {string=} required Устанавливает ключ ошибки `required` если поле пусто.
 * @param {string=} ngRequired Устанавливает атрибут `required`, если выражение возвращает true.
 *    Используйте `ngRequired` вместо `required` если необходимо связать данные с атрибутом `required`.
 * @param {number=} ngMinlength Устанавливает ключ ошибки `minlength` если значение короче, чем заданное количество 
 *    знаков.
 * @param {number=} ngMaxlength Устанавливает ключ ошибки `maxlength` если значение длиннее, чем заданное количество 
 *    знаков.
 * @param {string=} ngPattern Устанавливает ключ ошибки `pattern` если значение не соответствует RegExp-шаблону. 
 *    Значение сравнивается с переданным шаблоном, если он передается в формате `/regexp/`, в других случаях 
 *    считается, что передано свойство текущей области видимости, которое содержит нужный шаблон.
 * @param {string=} ngChange Angular-выражение, которое будет выполнено, когда изменится содержимое элемента 
 *    управления в результате взаимодействия с пользователем.
 */


/**
 * @ngdoc directive
 * @name ng.directive:input
 * @restrict E
 *
 * @description
 * HTML поле ввода, для которого работает связывание данных Angular. Поле ввода реализует все типы HTML5 полей 
 * ввода и такие костыли как проверка ввода в старых браузерах.
 *
 * @param {string} ngModel Ассоциированное angular-выражение для связывания данных.
 * @param {string=} name Имя свойства, под которым элемент управления будет доступен в области видимости.
 * @param {string=} required Устанавливает ключ ошибки `required` если поле пусто.
 * @param {boolean=} ngRequired Устанавливает атрибут `required`, если выражение возвращает true.
 *    Используйте `ngRequired` вместо `required` если необходимо связать данные с атрибутом `required`.
 * @param {number=} ngMinlength Устанавливает ключ ошибки `minlength` если значение короче, чем заданное количество 
 *    знаков.
 * @param {number=} ngMaxlength Устанавливает ключ ошибки `maxlength` если значение длиннее, чем заданное количество 
 *    знаков.
 * @param {string=} ngPattern Устанавливает ключ ошибки `pattern` если значение не соответствует RegExp-шаблону. 
 *    Значение сравнивается с переданным шаблоном, если он передается в формате `/regexp/`, в других случаях 
 *    считается, что передано свойство текущей области видимости, которое содержит нужный шаблон.
 * @param {string=} ngChange Angular-выражение, которое будет выполнено, когда изменится содержимое элемента 
 *    управления в результате взаимодействия с пользователем.
 *
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.user = {name: 'guest', last: 'visitor'};
         }
       </script>
       <div ng-controller="Ctrl">
         <form name="myForm">
           User name: <input type="text" name="userName" ng-model="user.name" required>
           <span class="error" ng-show="myForm.userName.$error.required">
             Required!</span><br>
           Last name: <input type="text" name="lastName" ng-model="user.last"
             ng-minlength="3" ng-maxlength="10">
           <span class="error" ng-show="myForm.lastName.$error.minlength">
             Too short!</span>
           <span class="error" ng-show="myForm.lastName.$error.maxlength">
             Too long!</span><br>
         </form>
         <hr>
         <tt>user = {{user}}</tt><br/>
         <tt>myForm.userName.$valid = {{myForm.userName.$valid}}</tt><br>
         <tt>myForm.userName.$error = {{myForm.userName.$error}}</tt><br>
         <tt>myForm.lastName.$valid = {{myForm.lastName.$valid}}</tt><br>
         <tt>myForm.userName.$error = {{myForm.lastName.$error}}</tt><br>
         <tt>myForm.$valid = {{myForm.$valid}}</tt><br>
         <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br>
         <tt>myForm.$error.minlength = {{!!myForm.$error.minlength}}</tt><br>
         <tt>myForm.$error.maxlength = {{!!myForm.$error.maxlength}}</tt><br>
       </div>
      </doc:source>
      <doc:scenario>
        it('should initialize to model', function() {
          expect(binding('user')).toEqual('{"name":"guest","last":"visitor"}');
          expect(binding('myForm.userName.$valid')).toEqual('true');
          expect(binding('myForm.$valid')).toEqual('true');
        });

        it('should be invalid if empty when required', function() {
          input('user.name').enter('');
          expect(binding('user')).toEqual('{"last":"visitor"}');
          expect(binding('myForm.userName.$valid')).toEqual('false');
          expect(binding('myForm.$valid')).toEqual('false');
        });

        it('should be valid if empty when min length is set', function() {
          input('user.last').enter('');
          expect(binding('user')).toEqual('{"name":"guest","last":""}');
          expect(binding('myForm.lastName.$valid')).toEqual('true');
          expect(binding('myForm.$valid')).toEqual('true');
        });

        it('should be invalid if less than required min length', function() {
          input('user.last').enter('xx');
          expect(binding('user')).toEqual('{"name":"guest"}');
          expect(binding('myForm.lastName.$valid')).toEqual('false');
          expect(binding('myForm.lastName.$error')).toMatch(/minlength/);
          expect(binding('myForm.$valid')).toEqual('false');
        });

        it('should be invalid if longer than max length', function() {
          input('user.last').enter('some ridiculously long name');
          expect(binding('user'))
            .toEqual('{"name":"guest"}');
          expect(binding('myForm.lastName.$valid')).toEqual('false');
          expect(binding('myForm.lastName.$error')).toMatch(/maxlength/);
          expect(binding('myForm.$valid')).toEqual('false');
        });
      </doc:scenario>
    </doc:example>
 */
var inputDirective = ['$browser', '$sniffer', function($browser, $sniffer) {
  return {
    restrict: 'E',
    require: '?ngModel',
    link: function(scope, element, attr, ctrl) {
      if (ctrl) {
        (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrl, $sniffer,
                                                            $browser);
      }
    }
  };
}];

var VALID_CLASS = 'ng-valid',
    INVALID_CLASS = 'ng-invalid',
    PRISTINE_CLASS = 'ng-pristine',
    DIRTY_CLASS = 'ng-dirty';

/**
 * @ngdoc object
 * @name ng.directive:ngModel.NgModelController
 *
 * @property {string} $viewValue Актуальное значение в представлении в виде строки.
 * @property {*} $modelValue Значение модели, к которой привязан элемент управления.
 * @property {Array.<Function>} $parsers Когда элемент управления читает значение из DOM, вызываются все 
 *     функции для очистки/конвертации введенного значения и проверки его допустимости.
 *
 * @property {Array.<Function>} $formatters Когда модель меняет свое значение, выполняются все эти функции 
 *     для конвертации значения в удобный для пользователя формат.
 *
 * @property {Object} $error Хэш объект, содержащий ключи ошибок и массив элементов с этими ошибками.
 *
 * @property {boolean} $pristine True, если пользователь не взаимодействовал с элементом управления.
 * @property {boolean} $dirty True, если пользователь уже взаимодействовал с элементом управления.
 * @property {boolean} $valid True, если нет ошибок.
 * @property {boolean} $invalid True, если есть хоть одна ошибка в элементе управления.
 *
 * @description
 *
 * `NgModelController` предоставляет API для директивы `ng-model`. Контроллер содержит сервисы для связывания 
 * данных, их проверки, обновления CSS, форматирования значений и разбора ввода. Он не должен содержать логику 
 * отображения DOM или слушания событий DOM. `NgModelController` предназначен для расширения другими директивами, 
 * где директива манипулирует с DOM, а `NgModelController` осуществляет привязку данных.
 * 
 * Этот пример показывает как использовать `NgModelController` с пользовательским элементом управления для 
 * добавления привязки данных. Обратите внимание, как различные директивы (`contenteditable`, `ng-model`, и 
 * `required`) работают вместе для достижения желаемого результата.
 *
 * <example module="customControl">
    <file name="style.css">
      [contenteditable] {
        border: 1px solid black;
        background-color: white;
        min-height: 20px;
      }

      .ng-invalid {
        border: 1px solid red;
      }

    </file>
    <file name="script.js">
      angular.module('customControl', []).
        directive('contenteditable', function() {
          return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function(scope, element, attrs, ngModel) {
              if(!ngModel) return; // do nothing if no ng-model

              // Specify how UI should be updated
              ngModel.$render = function() {
                element.html(ngModel.$viewValue || '');
              };

              // Listen for change events to enable binding
              element.bind('blur keyup change', function() {
                scope.$apply(read);
              });
              read(); // initialize

              // Write data to the model
              function read() {
                ngModel.$setViewValue(element.html());
              }
            }
          };
        });
    </file>
    <file name="index.html">
      <form name="myForm">
       <div contenteditable
            name="myWidget" ng-model="userContent"
            required>Change me!</div>
        <span ng-show="myForm.myWidget.$error.required">Required!</span>
       <hr>
       <textarea ng-model="userContent"></textarea>
      </form>
    </file>
    <file name="scenario.js">
      it('should data-bind and become invalid', function() {
        var contentEditable = element('[contenteditable]');

        expect(contentEditable.text()).toEqual('Change me!');
        input('userContent').enter('');
        expect(contentEditable.text()).toEqual('');
        expect(contentEditable.prop('className')).toMatch(/ng-invalid-required/);
      });
    </file>
 * </example>
 *
 */
var NgModelController = ['$scope', '$exceptionHandler', '$attrs', '$element', '$parse',
    function($scope, $exceptionHandler, $attr, $element, $parse) {
  this.$viewValue = Number.NaN;
  this.$modelValue = Number.NaN;
  this.$parsers = [];
  this.$formatters = [];
  this.$viewChangeListeners = [];
  this.$pristine = true;
  this.$dirty = false;
  this.$valid = true;
  this.$invalid = false;
  this.$name = $attr.name;

  var ngModelGet = $parse($attr.ngModel),
      ngModelSet = ngModelGet.assign;

  if (!ngModelSet) {
    throw Error(NON_ASSIGNABLE_MODEL_EXPRESSION + $attr.ngModel +
        ' (' + startingTag($element) + ')');
  }

  /**
   * @ngdoc function
   * @name ng.directive:ngModel.NgModelController#$render
   * @methodOf ng.directive:ngModel.NgModelController
   *
   * @description
   * Вызывается когда нужно обновить представление. Предполагается что пользователь будет вызывать этот метод 
   * для директивы ng-model.
   */
  this.$render = noop;

  var parentForm = $element.inheritedData('$formController') || nullFormCtrl,
      invalidCount = 0, // used to easily determine if we are valid
      $error = this.$error = {}; // keep invalid keys here


  // Setup initial state of the control
  $element.addClass(PRISTINE_CLASS);
  toggleValidCss(true);

  // convenience method for easy toggling of classes
  function toggleValidCss(isValid, validationErrorKey) {
    validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';
    $element.
      removeClass((isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey).
      addClass((isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
  }

  /**
   * @ngdoc function
   * @name ng.directive:ngModel.NgModelController#$setValidity
   * @methodOf ng.directive:ngModel.NgModelController
   *
   * @description
   * Изменяет статус проверки данных и уведомляет форму, когда элемент управления изменяет свой статус проверки
   * данных. (форма не уведомляется, если для элемента управления уже ранее был установлен статус invalid).
   * 
   * Этот метод должен вызываться валидаторами – т.е. функциями разбора или форматирования.
   *
   * @param {string} validationErrorKey Имя валидатора. `validationErrorKey` будет ассоциирован с 
   *        `$error[validationErrorKey]=isValid`, и это можно использовать для привязки данных. 
   *        `validationErrorKey` должен быть в верблюжьей нотации и будет преобразоваться в имя с разделителем 
   *        тире, для имен классов CSS. Например: `myError` добавит классы `ng-valid-my-error` и 
   *        `ng-invalid-my-error` и к нему можно привязываться, как `{{someForm.someControl.$error.myError}}`.
   * @param {boolean} isValid true, если текущее состояние valid, или false – если invalid.
   */
  this.$setValidity = function(validationErrorKey, isValid) {
    if ($error[validationErrorKey] === !isValid) return;

    if (isValid) {
      if ($error[validationErrorKey]) invalidCount--;
      if (!invalidCount) {
        toggleValidCss(true);
        this.$valid = true;
        this.$invalid = false;
      }
    } else {
      toggleValidCss(false);
      this.$invalid = true;
      this.$valid = false;
      invalidCount++;
    }

    $error[validationErrorKey] = !isValid;
    toggleValidCss(isValid, validationErrorKey);

    parentForm.$setValidity(validationErrorKey, isValid, this);
  };

  /**
   * @ngdoc function
   * @name ng.directive:ngModel.NgModelController#$setPristine
   * @methodOf ng.directive:ngModel.NgModelController
   *
   * @description
   * Устанавливает элемент управления в первоначальное состояние.
   *
   * Этот метод может быть вызван для удаления класса 'ng-dirty' и установки элемента управления в 
   * свое первоначальное состояние (класс ng-pristine).
   */
  this.$setPristine = function () {
    this.$dirty = false;
    this.$pristine = true;
    $element.removeClass(DIRTY_CLASS).addClass(PRISTINE_CLASS);
  };

  /**
   * @ngdoc function
   * @name ng.directive:ngModel.NgModelController#$setViewValue
   * @methodOf ng.directive:ngModel.NgModelController
   *
   * @description
   * Читает значение из вида.
   *
   * Этот метод необходимо вызывать из обработчика события DOM.
   * Например, его вызывают директивы {@link ng.directive:input input} или {@link ng.directive:select select}.
   *
   * Это вызывает внутри всех «форматеров» и, если результирующее значение корректно, обновляет модель
   * и вызывает всех зарегистрированных слушателей изменений.
   *
   * @param {string} value Значение из вида.
   */
  this.$setViewValue = function(value) {
    this.$viewValue = value;

    // change to dirty
    if (this.$pristine) {
      this.$dirty = true;
      this.$pristine = false;
      $element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
      parentForm.$setDirty();
    }

    forEach(this.$parsers, function(fn) {
      value = fn(value);
    });

    if (this.$modelValue !== value) {
      this.$modelValue = value;
      ngModelSet($scope, value);
      forEach(this.$viewChangeListeners, function(listener) {
        try {
          listener();
        } catch(e) {
          $exceptionHandler(e);
        }
      })
    }
  };

  // model -> value
  var ctrl = this;

  $scope.$watch(function ngModelWatch() {
    var value = ngModelGet($scope);

    // if scope model value and ngModel value are out of sync
    if (ctrl.$modelValue !== value) {

      var formatters = ctrl.$formatters,
          idx = formatters.length;

      ctrl.$modelValue = value;
      while(idx--) {
        value = formatters[idx](value);
      }

      if (ctrl.$viewValue !== value) {
        ctrl.$viewValue = value;
        ctrl.$render();
      }
    }
  });
}];


/**
 * @ngdoc directive
 * @name ng.directive:ngModel
 *
 * @element input
 *
 * @description
 * Эта директива указывает Angular, что необходимо двухсторонее связывание данных. Что всегда применяется в 
 * директивах `input`, `select`, `textarea`. Можно легко писать собственные директивы, используя в них `ngModel`.
 * 
 * `ngModel` отвечает за:
 * 
 * - связывание вида с моделью при использовании с другими директивами, такими как `input`, `textarea` или `select`,
 * - реализует поведение для проверки ввода (например, required, number, email, url),
 * - определяет состояние элементов управления (valid/invalid, dirty/pristine, validation errors),
 * - устанавливает требуемый css-класс для элемента (ng-valid, ng-invalid, ng-dirty, ng-pristine),
 * - регистрирует элемент управления в родительской директиве {@link ng.directive:form form}.
 *
 * Примеры использования `ngModel`, смотрите здесь:
 *
 *  - {@link ng.directive:input input}
 *    - {@link ng.directive:input.text text}
 *    - {@link ng.directive:input.checkbox checkbox}
 *    - {@link ng.directive:input.radio radio}
 *    - {@link ng.directive:input.number number}
 *    - {@link ng.directive:input.email email}
 *    - {@link ng.directive:input.url url}
 *  - {@link ng.directive:select select}
 *  - {@link ng.directive:textarea textarea}
 *
 */
var ngModelDirective = function() {
  return {
    require: ['ngModel', '^?form'],
    controller: NgModelController,
    link: function(scope, element, attr, ctrls) {
      // notify others, especially parent forms

      var modelCtrl = ctrls[0],
          formCtrl = ctrls[1] || nullFormCtrl;

      formCtrl.$addControl(modelCtrl);

      element.bind('$destroy', function() {
        formCtrl.$removeControl(modelCtrl);
      });
    }
  };
};


/**
 * @ngdoc directive
 * @name ng.directive:ngChange
 * @restrict E
 *
 * @description
 * Вызывает определенную функцию, если пользователь изменил значение поля ввода. Функция не вызывается, 
 * если изменение исходит от модели.
 * 
 * Заметьте, эта директива требует наличия директивы `ngModel` в том же элементе.
 *
 * @element input
 *
 * @example
 * <doc:example>
 *   <doc:source>
 *     <script>
 *       function Controller($scope) {
 *         $scope.counter = 0;
 *         $scope.change = function() {
 *           $scope.counter++;
 *         };
 *       }
 *     </script>
 *     <div ng-controller="Controller">
 *       <input type="checkbox" ng-model="confirmed" ng-change="change()" id="ng-change-example1" />
 *       <input type="checkbox" ng-model="confirmed" id="ng-change-example2" />
 *       <label for="ng-change-example2">Confirmed</label><br />
 *       debug = {{confirmed}}<br />
 *       counter = {{counter}}
 *     </div>
 *   </doc:source>
 *   <doc:scenario>
 *     it('should evaluate the expression if changing from view', function() {
 *       expect(binding('counter')).toEqual('0');
 *       element('#ng-change-example1').click();
 *       expect(binding('counter')).toEqual('1');
 *       expect(binding('confirmed')).toEqual('true');
 *     });
 *
 *     it('should not evaluate the expression if changing from model', function() {
 *       element('#ng-change-example2').click();
 *       expect(binding('counter')).toEqual('0');
 *       expect(binding('confirmed')).toEqual('true');
 *     });
 *   </doc:scenario>
 * </doc:example>
 */
var ngChangeDirective = valueFn({
  require: 'ngModel',
  link: function(scope, element, attr, ctrl) {
    ctrl.$viewChangeListeners.push(function() {
      scope.$eval(attr.ngChange);
    });
  }
});


var requiredDirective = function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ctrl) {
      if (!ctrl) return;
      attr.required = true; // force truthy in case we are on non input element

      var validator = function(value) {
        if (attr.required && (isEmpty(value) || value === false)) {
          ctrl.$setValidity('required', false);
          return;
        } else {
          ctrl.$setValidity('required', true);
          return value;
        }
      };

      ctrl.$formatters.push(validator);
      ctrl.$parsers.unshift(validator);

      attr.$observe('required', function() {
        validator(ctrl.$viewValue);
      });
    }
  };
};


/**
 * @ngdoc directive
 * @name ng.directive:ngList
 *
 * @description
 * Преобразует входной текст в массив строк по заданному разделителю.
 *
 * @element input
 * @param {string=} ngList не обязательный символ разделителя, который будет использоваться при разделении строки. 
 * Если задается в форме `/something/`, значение будет преобразовано в регулярное выражение.
 *
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.names = ['igor', 'misko', 'vojta'];
         }
       </script>
       <form name="myForm" ng-controller="Ctrl">
         List: <input name="namesInput" ng-model="names" ng-list required>
         <span class="error" ng-show="myForm.list.$error.required">
           Required!</span>
         <tt>names = {{names}}</tt><br/>
         <tt>myForm.namesInput.$valid = {{myForm.namesInput.$valid}}</tt><br/>
         <tt>myForm.namesInput.$error = {{myForm.namesInput.$error}}</tt><br/>
         <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
         <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
        </form>
      </doc:source>
      <doc:scenario>
        it('should initialize to model', function() {
          expect(binding('names')).toEqual('["igor","misko","vojta"]');
          expect(binding('myForm.namesInput.$valid')).toEqual('true');
        });

        it('should be invalid if empty', function() {
          input('names').enter('');
          expect(binding('names')).toEqual('[]');
          expect(binding('myForm.namesInput.$valid')).toEqual('false');
        });
      </doc:scenario>
    </doc:example>
 */
var ngListDirective = function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, ctrl) {
      var match = /\/(.*)\//.exec(attr.ngList),
          separator = match && new RegExp(match[1]) || attr.ngList || ',';

      var parse = function(viewValue) {
        var list = [];

        if (viewValue) {
          forEach(viewValue.split(separator), function(value) {
            if (value) list.push(trim(value));
          });
        }

        return list;
      };

      ctrl.$parsers.push(parse);
      ctrl.$formatters.push(function(value) {
        if (isArray(value)) {
          return value.join(', ');
        }

        return undefined;
      });
    }
  };
};


var CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/;

var ngValueDirective = function() {
  return {
    priority: 100,
    compile: function(tpl, tplAttr) {
      if (CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue)) {
        return function(scope, elm, attr) {
          attr.$set('value', scope.$eval(attr.ngValue));
        };
      } else {
        return function(scope, elm, attr) {
          scope.$watch(attr.ngValue, function valueWatchAction(value) {
            attr.$set('value', value, false);
          });
        };
      }
    }
  };
};
