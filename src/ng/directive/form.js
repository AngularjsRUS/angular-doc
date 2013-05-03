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
 * @property {boolean} $pristine True if user has not interacted with the form yet.
 * @property {boolean} $dirty True if user has already interacted with the form.
 * @property {boolean} $valid True if all of the containing forms and controls are valid.
 * @property {boolean} $invalid True if at least one containing control or form is invalid.
 *
 * @property {Object} $error Is an object hash, containing references to all invalid controls or
 *  forms, where:
 *
 *  - keys are validation tokens (error names) — such as `required`, `url` or `email`),
 *  - values are arrays of controls or forms that are invalid with given error.
 *
 * @description
 * `FormController` keeps track of all its controls and nested forms as well as state of them,
 * such as being valid/invalid or dirty/pristine.
 *
 * Each {@link ng.directive:form form} directive creates an instance
 * of `FormController`.
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
   * Sets the form to its pristine state.
   *
   * This method can be called to remove the 'ng-dirty' class and set the form to its pristine
   * state (ng-pristine class). This method will also propagate to all the controls contained
   * in this form.
   *
   * Setting a form back to a pristine state is often useful when we want to 'reuse' a form after
   * saving or resetting it.
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
 * Nestable alias of {@link ng.directive:form `form`} directive. HTML
 * does not allow nesting of form elements. It is useful to nest forms, for example if the validity of a
 * sub-group of controls needs to be determined.
 *
 * @param {string=} name|ngForm Name of the form. If specified, the form controller will be published into
 *                       related scope, under this name.
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
 * Если указан атрибут `name`, то форма будет доступна в текущем скопе(scope) под этим
 * именем.
 *
 * # Alias: {@link ng.directive:ngForm `ngForm`}
 *
 * Angular позволяет создавать вложенные формы. Это означает что основная(внешняя) форма действительна(valid)
 * когда все вложенные в нее формы действительны, т.е. не имеют ошибок. Так как браузеры не позволяют вкладывать элементы
 * `<form>` друг в друга, angular для этих целей имеет alias(псевдоним) {@link ng.directive:ngForm `ngForm`}
 * который ведет себя точно также как `<form>` но позволяет вам вкладывать формы друг в друга.
 *
 *
 * # CSS классы
 *  - `ng-valid` проставляется если форма действительна(valid).
 *  - `ng-invalid` проставляется если форма не действительна(invalid - имеет ошибки).
 *  - `ng-pristine` проставляется если форму не меняли (не меняли значения полей внутри формы).
 *  - `ng-dirty` проставляется если меняли форму (меняли значение полей внутри формы).
 *
 *
 * # Отправка формы и отмена действия по умолчанию
 *
 * Поскольку роль форм в Angular приложениях отличается от классических приложений,
 * желательно что бы отправка формы не приводила к перезагрузке браузером все страницы для
 * отправки данных на сервер. Вместо этого должна отработать некоторая javascript логика в приложении,
 * которая сама обработает отправку формы.
 *
 * По этой причине Angular отменяет стандартное поведение по умолчанию (отправку формы на сервер)
 * если только не указан атрибут `action` для элемента `form`.
 *
 * Вы можете использовать один из двух путей, описанных ниже, для того что бы определить
 * какой javascript метод должен быть вызван при отправке формы:
 *
 * - {@link ng.directive:ngSubmit ngSubmit} директива в элементе `form`
 * - {@link ng.directive:ngClick ngClick} директива в первой кнопке или поле с типом submit (input[type=submit])
 *
 * Для того что бы предотвратить вызов обработчика два раза, используйте что то одно либо ngSubmit либо ngClick.
 * Так происходит из за описанных ниже правил отправки формы в html спецификации:
 *
 * - Если форма имеет только одно поле для ввода(input), тогда нажатие на enter внутри этого поля приведет
 *   к отправке формы, событие submit (`ngSubmit`)
 * - Если форма имеет больше одного поля для ввода и ни одной кнопки или input[type=submit] тогда нажатие на enter
 *   внутри поля ввода не вызовет отправку формы
 * - Если форма имеет больше одного поля для ввода и одну или больше кнопок или input[type=submit]
 *   тогда нажатие на enter внутри любого поля для ввода вызовет событие click на *первой* кнопке
 *   или input[type=submit] (`ngClick`) *и* событие submit(отправку формы) у ближайшей формы (`ngSubmit`)
 *
 * @param {string=} name Имя формы. Если определен, тогда форма будет доступна в текущем скопе(scope) под этим именем.
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
