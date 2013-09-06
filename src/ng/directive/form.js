'use strict';


var nullFormCtrl = {
  $addControl: noop,
  $removeControl: noop,
  $setValidity: noop,
  $setDirty: noop,
  $setPristine: noop
};

/**
 * @ngdoc object
 * @name ng.directive:form.FormController
 *
 * @property {boolean} $pristine True, если пользователь еще не взаимодействовал с формой.
 * @property {boolean} $dirty True, если пользователь уже взаимодействовал с формой.
 * @property {boolean} $valid True, если все вложенные формы и элементы управления содержат «правильные» данные
 *   (проходят процесс проверки).
 * @property {boolean} $invalid True, если хотя бы одна вложенная форма или элемент управления содержат 
 *   «недопустимые» данные (не проходят проверку).
 *
 * @property {Object} $error Это хэш объект, который содержит ссылки на элементы управления или вложенные 
 *   формы в которых содержаться «недопустимые» данные, где:
 *
 *  - ключи, это проверочные метки (имена ошибок) — такие как `required`, `url` или `email`),
 *  - значения, это массив элементов управления или форм, которые не соответствуют текущему правилу проверки данных.
 *
 * @description
 * `FormController` содержит все элементы управления и вложенные формы, а также состояние для них, такие 
 * как valid/invalid или dirty/pristine.
 * 
 * Каждая директива {@link ng.directive:form form} создает экземпляр `FormController`.
 *
 */
//asks for $scope to fool the BC controller module
FormController.$inject = ['$element', '$attrs', '$scope'];
function FormController(element, attrs) {
  var form = this,
      parentForm = element.parent().controller('form') || nullFormCtrl,
      invalidCount = 0, // used to easily determine if we are valid
      errors = form.$error = {},
      controls = [];

  // init state
  form.$name = attrs.name;
  form.$dirty = false;
  form.$pristine = true;
  form.$valid = true;
  form.$invalid = false;

  parentForm.$addControl(form);

  // Setup initial state of the control
  element.addClass(PRISTINE_CLASS);
  toggleValidCss(true);

  // convenience method for easy toggling of classes
  function toggleValidCss(isValid, validationErrorKey) {
    validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';
    element.
      removeClass((isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey).
      addClass((isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
  }

  form.$addControl = function(control) {
    controls.push(control);

    if (control.$name && !form.hasOwnProperty(control.$name)) {
      form[control.$name] = control;
    }
  };

  form.$removeControl = function(control) {
    if (control.$name && form[control.$name] === control) {
      delete form[control.$name];
    }
    forEach(errors, function(queue, validationToken) {
      form.$setValidity(validationToken, true, control);
    });

    arrayRemove(controls, control);
  };

  form.$setValidity = function(validationToken, isValid, control) {
    var queue = errors[validationToken];

    if (isValid) {
      if (queue) {
        arrayRemove(queue, control);
        if (!queue.length) {
          invalidCount--;
          if (!invalidCount) {
            toggleValidCss(isValid);
            form.$valid = true;
            form.$invalid = false;
          }
          errors[validationToken] = false;
          toggleValidCss(true, validationToken);
          parentForm.$setValidity(validationToken, true, form);
        }
      }

    } else {
      if (!invalidCount) {
        toggleValidCss(isValid);
      }
      if (queue) {
        if (includes(queue, control)) return;
      } else {
        errors[validationToken] = queue = [];
        invalidCount++;
        toggleValidCss(false, validationToken);
        parentForm.$setValidity(validationToken, false, form);
      }
      queue.push(control);

      form.$valid = false;
      form.$invalid = true;
    }
  };

  form.$setDirty = function() {
    element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
    form.$dirty = true;
    form.$pristine = false;
    parentForm.$setDirty();
  };

  /**
   * @ngdoc function
   * @name ng.directive:form.FormController#$setPristine
   * @methodOf ng.directive:form.FormController
   *
   * @description
   * Возвращает форму в ее первоначальное состояние.
   *
   * Этот метод может быть вызван, чтобы удалить класс 'ng-dirty' и установить форму в ее первоначальное состояние
   * (класс ng-pristine). Этот метод будет также распространяться на все элементы управления, содержащиеся в этой 
   * форме.
   * 
   * Установка формы в первоначальное состояние часто бывает полезна, когда мы хотим, использовать форму 
   * «повторно» после сохранения или сброса.
   */
  form.$setPristine = function () {
    element.removeClass(DIRTY_CLASS).addClass(PRISTINE_CLASS);
    form.$dirty = false;
    form.$pristine = true;
    forEach(controls, function(control) {
      control.$setPristine();
    });
  };
}


/**
 * @ngdoc directive
 * @name ng.directive:ngForm
 * @restrict EAC
 *
 * @description
 * Псевдоним для директивы {@link ng.directive:form `form`}. HTML не позволяет вкладывать элементы `<form>` друг
 * в друга. Эта директива используется для создания вложенных форм, например, если вы хотите проверять 
 * отдельно корректность данных.
 *
 * @param {string=} name|ngForm Имя формы. Если оно указанно, контроллер формы опубликует одноименное свойство, 
 *                       содержащее ссылку на форму внутри области видимости.
 *
 */

 /**
 * @ngdoc directive
 * @name ng.directive:form
 * @restrict E
 *
 * @description
 * Директива, которая создает экземпляр
 * {@link ng.directive:form.FormController FormController}.
 *
 * Если указан атрибут `name`, то форма будет доступна в текущей области видимости (scope) под этим
 * именем.
 *
 * # Псевдоним: {@link ng.directive:ngForm `ngForm`}
 *
 * Angular позволяет создавать вложенные формы. Это означает что основная(внешняя) форма заполнена корректно 
 * когда все вложенные в нее формы корректны, т.е. не имеют ошибок. Так как браузеры не позволяют вкладывать элементы
 * `<form>` друг в друга, в Angular для этих целей есть псевдоним {@link ng.directive:ngForm `ngForm`}
 * который ведет себя точно также как `<form>` но позволяет вам вкладывать формы друг в друга.
 *
 *
 * # CSS классы
 *  - `ng-valid` ставится если форма корректна.
 *  - `ng-invalid` ставится если форма содержит ошибки.
 *  - `ng-pristine` ставится если значения полей внутри формы не изменялись.
 *  - `ng-dirty` ставится если значения полей внутри формы изменялись.
 *
 *
 * # Отправка формы и отмена действия по умолчанию
 *
 * Поскольку роль форм в Angular-приложениях отличается от классических приложений,
 * желательно чтобы отправка формы не приводила к перезагрузке браузером всей страницы для
 * отправки данных на сервер. Вместо этого в приложении должна сработать некоторая javascript-логика,
 * которая сама обработает отправку формы.
 *
 * По этой причине Angular отменяет стандартное поведение по умолчанию (отправку формы на сервер)
 * если только не указан атрибут `action` для элемента `form`.
 *
 * Можно использовать один из двух способов, описанных ниже, для того что бы определить
 * какой javascript-метод должен быть вызван при отправке формы:
 *
 * - {@link ng.directive:ngSubmit ngSubmit} директива в элементе `form`
 * - {@link ng.directive:ngClick ngClick} директива в первой кнопке или кнопке отправки (input[type=submit])
 *
 * Для того что бы предотвратить вызов обработчика дважды, используйте либо ngSubmit либо ngClick.
 * Так происходит из за описанных ниже правил отправки формы в html-спецификации:
 *
 * - Если форма имеет только одно поле ввода(input), тогда нажатие на enter внутри этого поля приведет
 *   к отправке формы и вызову события submit (`ngSubmit`)
 * - Если форма имеет более одного поля ввода и ни одной кнопки или кнопки отправки (input[type=submit]) тогда
 *   нажатие на enter внутри поля ввода не вызовет отправку формы
 * - Если форма имеет более одного поля ввода и одну или более кнопок или кнопки отправки (input[type=submit])
 *   тогда нажатие на enter внутри любого поля ввода вызовет событие click на *первой* кнопке
 *   или кнопке отправки (input[type=submit]) (`ngClick`) *и* событие submit(отправку формы) для ближайшей формы (`ngSubmit`)
 *
 * @param {string=} name Имя формы. Если определено, то форма будет доступна в текущей области видимости (scope) под этим именем.
 *
 * @example
    <doc:example>
      <doc:source>
       <script>
         function Ctrl($scope) {
           $scope.userType = 'guest';
         }
       </script>
       <form name="myForm" ng-controller="Ctrl">
         userType: <input name="input" ng-model="userType" required>
         <span class="error" ng-show="myForm.input.$error.required">Required!</span><br>
         <tt>userType = {{userType}}</tt><br>
         <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br>
         <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br>
         <tt>myForm.$valid = {{myForm.$valid}}</tt><br>
         <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br>
        </form>
      </doc:source>
      <doc:scenario>
        it('should initialize to model', function() {
         expect(binding('userType')).toEqual('guest');
         expect(binding('myForm.input.$valid')).toEqual('true');
        });

        it('should be invalid if empty', function() {
         input('userType').enter('');
         expect(binding('userType')).toEqual('');
         expect(binding('myForm.input.$valid')).toEqual('false');
        });
      </doc:scenario>
    </doc:example>
 */
var formDirectiveFactory = function(isNgForm) {
  return ['$timeout', function($timeout) {
    var formDirective = {
      name: 'form',
      restrict: 'E',
      controller: FormController,
      compile: function() {
        return {
          pre: function(scope, formElement, attr, controller) {
            if (!attr.action) {
              // we can't use jq events because if a form is destroyed during submission the default
              // action is not prevented. see #1238
              //
              // IE 9 is not affected because it doesn't fire a submit event and try to do a full
              // page reload if the form was destroyed by submission of the form via a click handler
              // on a button in the form. Looks like an IE9 specific bug.
              var preventDefaultListener = function(event) {
                event.preventDefault
                  ? event.preventDefault()
                  : event.returnValue = false; // IE
              };

              addEventListenerFn(formElement[0], 'submit', preventDefaultListener);

              // unregister the preventDefault listener so that we don't not leak memory but in a
              // way that will achieve the prevention of the default action.
              formElement.bind('$destroy', function() {
                $timeout(function() {
                  removeEventListenerFn(formElement[0], 'submit', preventDefaultListener);
                }, 0, false);
              });
            }

            var parentFormCtrl = formElement.parent().controller('form'),
                alias = attr.name || attr.ngForm;

            if (alias) {
              scope[alias] = controller;
            }
            if (parentFormCtrl) {
              formElement.bind('$destroy', function() {
                parentFormCtrl.$removeControl(controller);
                if (alias) {
                  scope[alias] = undefined;
                }
                extend(controller, nullFormCtrl); //stop propagating child destruction handlers upwards
              });
            }
          }
        };
      }
    };

    return isNgForm ? extend(copy(formDirective), {restrict: 'EAC'}) : formDirective;
  }];
};

var formDirective = formDirectiveFactory();
var ngFormDirective = formDirectiveFactory(true);
