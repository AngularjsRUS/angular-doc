'use strict';

/**
 * @ngdoc overview
 * @name ngResource
 * @description
 */

/**
 * @ngdoc object
 * @name ngResource.$resource
 * @requires $http
 *
 * @description
 * Фабрика, создающая конструктор ресурсов, позволяющий взаимодействовать с 
 * [RESTful](http://ru.wikipedia.org/wiki/REST) сервером.
 * 
 * Возвращаемый ею конструктор описывает действия и методы, предоставляющие высокоуровневый доступ без необходимости 
 * взаимодействия с низкоуровневым сервисом {@link ng.$http $http}.
 *
 * # Установка
 * Для использования $resource включите файл angular-resource.js в список загружаемых файлов Angular. Можно 
 * найти этот файл в Google CDN, а так же прошвырнуться на {@link http://code.angularjs.org/ code.angularjs.org}.
 * 
 * В конце загрузите модуль в приложение:
 *
 *        angular.module('app', ['ngResource']);
 *
 * и можно начинать пользоваться!
 *
 * @param {string} url URL-шаблон с параметрами, которые имеют префикс «:», 
 *   как в `/user/:username`. При использовании URL с номером порта (например, `http://example.com:8080/api`),
 *   нужно экранировать его двойным обратным слешем, как показано здесь: 
 *   `$resource('http://example.com\\:8080/api')`.
 *
 * @param {Object=} paramDefaults Значения параметров URL по умолчанию. Они могут переопределяться в методах 
 *   действий `actions`.
 * 
 *   Значение каждого ключа в объекте параметров будет связано с параметром в URL-шаблоне. Если же URL-шаблон
 *   не содержит параметра с именем ключа, то такие пары ключ-значение будут добавлены в URL-строку поиска `?`.
 *   
 *   Для шаблона `/path/:verb` и параметра `{verb:'greet', salutation:'Hello'}` в результате получим URL 
 *   `/path/greet?salutation=Hello`.
 * 
 *   Если значение параметра указанно с префиксом `@`, тогда значение этого параметра извлекается из 
 *   объекта данных (обычно не для GET операций).
 *
 * @param {Object.<Object>=} actions Описание пользовательских действий, которые расширяют действия,
 *   установленные по умолчанию. Описание должно быть в следующем формате {@link
 *   ng.$http#Parameters $http.config}:
 *
 *       {action1: {method:?, params:?, isArray:?, headers:?, ...},
 *        action2: {method:?, params:?, isArray:?, headers:?, ...},
 *        ...}
 *
 *   Где:
 * 
 *   - **`action`** – {string} – Имя действия. Это имя, которое будет установлено для метода в вашем ресурсе.
 *   - **`method`** – {string} – Метод HTTP запроса. Допустимые значения: `GET`, `POST`, `PUT`, `DELETE`,
 *     и `JSONP`.
 *   - **`params`** – {Object=} – Необязательно, предустановки для параметров действия. Если любое из значений 
 *     является функцией, то она будет выполняться каждый раз, когда значение параметра должно быть 
 *     получено для запроса (если параметр не был переопределен).
 *   - **`url`** – {string} – переопределение `url`. url-шаблонизация поддерживается только для url ресурсного уровня.
 *   - **`isArray`** – {boolean=} – Если true то возвращаемый для этого действия объект является массивом, см.
 *     раздел `Возвращает`.
 *   - **`transformRequest`** – `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     функция преобразования или массив таких функций. Функция преобразования принимает тело и заголовки http
 *     запроса и возвращает преобразованную (по умолчанию сериализованную) версию.
 *   - **`transformResponse`** – `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     функция преобразования или массив таких функций. Функция преобразования принимает тело и заголовки http
 *     ответа и возвращает преобразованную (по умолчанию десериализованную) версию.
 *   - **`cache`** – `{boolean|Cache}` – Если true (по умолчанию), то кэш $http будет использоваться в качестве
 *     кэша GET-запроса, в противном случае, если экземпляр кэша создан с помощью 
 *     {@link ng.$cacheFactory $cacheFactory}, этот кэш будет использоваться для кэширования.
 *   - **`timeout`** – `{number}` – время ожидания в милисекндах.
 *   - **`withCredentials`** - `{boolean}` - устанавливать ли флаг `withCredentials` в
 *     XHR-объект. См. {@link https://developer.mozilla.org/en/http_access_control#section_5
 *     requests with credentials} для подробной информации.
 *   - **`responseType`** - `{string}` - см. {@link
 *     https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType requestType}.
 *
 * @returns {Object} Конструктор ресурсов, содержащий действия, которым сопоставлены HTTP-методы. 
 *   По умолчанию содержит следующие:
 *
 *       { 'get':    {method:'GET'},
 *         'save':   {method:'POST'},
 *         'query':  {method:'GET', isArray:true},
 *         'remove': {method:'DELETE'},
 *         'delete': {method:'DELETE'} };
 *
 *   Вызов этих методов вызывает {@link ng.$http} с соответствующим HTTP-методом, адресом и параметрами. 
 *   Когда от сервера приходят данные, создается экземпляр ресурса. Действия `save`, `remove` и `delete`
 *   с префиксом `$` могут быть вызваны из экземпляра ресурса для обработки содержащихся в нем данных.
 *   Это позволяет легко выполнять CRUD операции (создание, чтение, обновление, удаление) на серверных данных, 
 *   как показано здесь:
 * 
 *   <pre>
        var User = $resource('/user/:userId', {userId:'@id'});
        var user = User.get({userId:123}, function() {
          user.abc = true;
          user.$save();
        });
     </pre>
 * 
 *   Важно, что сразу после вызова метода конструктора $resource, возвращается ссылка на пустой ресурс 
 *   (объект или массив в зависимости от `isArray`). Когда данные придут от сервера, существующая ссылка 
 *   будет ссылаться на фактические данные. Это полезный трюк, т. к. обычно ресурсы используются в моделях, 
 *   на основе которых рисуется вид. Пока ресурс пустой, он не показывается в виде, но как только приходят 
 *   данные, вид перерисовывается, чтобы отобразить полученное. Поэтому в большинстве случаев не нужно 
 *   писать колбэк для методов в действиях.
 * 
 *   Методы в действиях конструктора ресурсов или экземпляра ресурса могут принимать следующие параметры:  
 *
 *   - HTTP GET действие конструктора: `конструктор_ресурсов.действие([parameters], [success], [error])`
 *   - все, кроме GET действия конструктора: `конструктор_ресурсов.действие([parameters], postData, [success], [error])`
 *   - все, кроме GET действия экземпляра: `экземпляр_ресурса.$действие([parameters], [success], [error])`
 *
 *
 *   У экземпляров и коллекций ресурсов есть дополнительные свойства
 *
 *   - `$then`: метод `then` {@link ng.$q обещания}, полученный из базового
 *     {@link ng.$http $http} запроса.
 *
 *     Колбэк для метода `$then` будет выполнен успешно если базовый `$http` запрос
 *     успешен.
 *
 *     Колбэк выполняется успешно если вызывается объектом {@link ng.$http http ответа},
 *     расширенным новыми свойствами `ресурса`. Эти свойства `ресурса` являются ссылкой на результат действия 
 *     ресурса — конструктор ресурсов или массив ресурсов.
 *
 *     Колбэк выдает ошибку, если вызывается объектом {@link ng.$http http запроса} при возникновении ошибки http.
 *
 *   - `$resolved`: true если обещание было выполнено (принято или отклонено);
 *     Знание того, что ресурс был передан, полезно для связывания данных.
 *
 * @example
 *
 * # Ресурс кредитной карты
 *
 * <pre>
     // Определение класса CreditCard
     var CreditCard = $resource('/user/:userId/card/:cardId',
      {userId:123, cardId:'@id'}, {
       charge: {method:'POST', params:{charge:true}}
      });

     // Можно запросить коллекцию с сервера
     var cards = CreditCard.query(function() {
       // GET: /user/123/card
       // ответ сервера: [ {id:456, number:'1234', name:'Smith'} ];

       var card = cards[0];
       // каждый элемент является экземпляром CreditCard
       expect(card instanceof CreditCard).toEqual(true);
       card.name = "J. Smith";
       // любой метод, кроме GET, применяющийся в экземплярах
       card.$save();
       // POST: /user/123/card/456 {id:456, number:'1234', name:'J. Smith'}
       // ответ сервера: {id:456, number:'1234', name: 'J. Smith'};

       // так же работает наш пользовательский метод.
       card.$charge({amount:9.99});
       // POST: /user/123/card/456?amount=9.99&charge=true {id:456, number:'1234', name:'J. Smith'}
     });

     // также можно создать экземпляр
     var newCard = new CreditCard({number:'0123'});
     newCard.name = "Mike Smith";
     newCard.$save();
     // POST: /user/123/card {number:'0123', name:'Mike Smith'}
     // ответ сервера: {id:789, number:'01234', name: 'Mike Smith'};
     expect(newCard.id).toEqual(789);
 * </pre>
 *
 * Возвращенный функцией конструктор ресурсов содержит статические методы для каждого определенного 
 * действия.
 * 
 * Выполнение этих методов вызывает `$http` для указанного URL-адреса с методом `method`, параметрами `params`
 * и заголовками `headers`. Когда данные возвращены сервером, создается объект ресурсного типа, который 
 * содержит все методы, кроме GET, доступные как методы с префиксом `$`. Это позволяет легко 
 * выполнять операции CRUD (создание, чтение, обновление, удаление) на серверных данных.

   <pre>
     var User = $resource('/user/:userId', {userId:'@id'});
     var user = User.get({userId:123}, function() {
       user.abc = true;
       user.$save();
     });
   </pre>
 *
 * Стоит отметить, что в случае успешного завершения запросов `get`, `query` или других действий, 
 * будет вызван соответствующий колбэк, в который передастся ответ сервера, а также 
 * функция для получения $http заголовков, поэтому для получения доступа к заголовкам можно переписать 
 * код выше в следующем виде:
 *
   <pre>
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(u, getResponseHeaders){
       u.abc = true;
       u.$save(function(u, putResponseHeaders) {
         //u => сохраненный объект user
         //putResponseHeaders => геттер для $http заголовков
       });
     });
   </pre>

 * # Buzz-клиент

   Давайте посмотрим, как можно создать buzz-клиент, используя сервис `$resource`:
    <doc:example>
      <doc:source jsfiddle="false">
       <script>
         function BuzzController($resource) {
           this.userId = 'googlebuzz';
           this.Activity = $resource(
             'https://www.googleapis.com/buzz/v1/activities/:userId/:visibility/:activityId/:comments',
             {alt:'json', callback:'JSON_CALLBACK'},
             {get:{method:'JSONP', params:{visibility:'@self'}}, replies: {method:'JSONP', params:{visibility:'@self', comments:'@comments'}}}
           );
         }

         BuzzController.prototype = {
           fetch: function() {
             this.activities = this.Activity.get({userId:this.userId});
           },
           expandReplies: function(activity) {
             activity.replies = this.Activity.replies({userId:this.userId, activityId:activity.id});
           }
         };
         BuzzController.$inject = ['$resource'];
       </script>

       <div ng-controller="BuzzController">
         <input ng-model="userId"/>
         <button ng-click="fetch()">fetch</button>
         <hr/>
         <div ng-repeat="item in activities.data.items">
           <h1 style="font-size: 15px;">
             <img src="{{item.actor.thumbnailUrl}}" style="max-height:30px;max-width:30px;"/>
             <a href="{{item.actor.profileUrl}}">{{item.actor.name}}</a>
             <a href ng-click="expandReplies(item)" style="float: right;">Expand replies: {{item.links.replies[0].count}}</a>
           </h1>
           {{item.object.content | html}}
           <div ng-repeat="reply in item.replies.data.items" style="margin-left: 20px;">
             <img src="{{reply.actor.thumbnailUrl}}" style="max-height:30px;max-width:30px;"/>
             <a href="{{reply.actor.profileUrl}}">{{reply.actor.name}}</a>: {{reply.content | html}}
           </div>
         </div>
       </div>
      </doc:source>
      <doc:scenario>
      </doc:scenario>
    </doc:example>
 */
angular.module('ngResource', ['ng']).
  factory('$resource', ['$http', '$parse', function($http, $parse) {
    var DEFAULT_ACTIONS = {
      'get':    {method:'GET'},
      'save':   {method:'POST'},
      'query':  {method:'GET', isArray:true},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'}
    };
    var noop = angular.noop,
        forEach = angular.forEach,
        extend = angular.extend,
        copy = angular.copy,
        isFunction = angular.isFunction,
        getter = function(obj, path) {
          return $parse(path)(obj);
        };

    /**
     * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
     * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
     * segments:
     *    segment       = *pchar
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
    function encodeUriSegment(val) {
      return encodeUriQuery(val, true).
        replace(/%26/gi, '&').
        replace(/%3D/gi, '=').
        replace(/%2B/gi, '+');
    }


    /**
     * This method is intended for encoding *key* or *value* parts of query component. We need a custom
     * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
     * encoded per http://tools.ietf.org/html/rfc3986:
     *    query       = *( pchar / "/" / "?" )
     *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *    pct-encoded   = "%" HEXDIG HEXDIG
     *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                     / "*" / "+" / "," / ";" / "="
     */
    function encodeUriQuery(val, pctEncodeSpaces) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    function Route(template, defaults) {
      this.template = template = template + '#';
      this.defaults = defaults || {};
      this.urlParams = {};
    }

    Route.prototype = {
      setUrlParams: function(config, params, actionUrl) {
        var self = this,
            url = actionUrl || self.template,
            val,
            encodedVal;

        var urlParams = self.urlParams = {};
        forEach(url.split(/\W/), function(param){
          if (param && (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
              urlParams[param] = true;
          }
        });
        url = url.replace(/\\:/g, ':');

        params = params || {};
        forEach(self.urlParams, function(_, urlParam){
          val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
          if (angular.isDefined(val) && val !== null) {
            encodedVal = encodeUriSegment(val);
            url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), encodedVal + "$1");
          } else {
            url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match,
                leadingSlashes, tail) {
              if (tail.charAt(0) == '/') {
                return tail;
              } else {
                return leadingSlashes + tail;
              }
            });
          }
        });

        // set the url
        config.url = url.replace(/\/?#$/, '').replace(/\/*$/, '');

        // set params - delegate param encoding to $http
        forEach(params, function(value, key){
          if (!self.urlParams[key]) {
            config.params = config.params || {};
            config.params[key] = value;
          }
        });
      }
    };


    function ResourceFactory(url, paramDefaults, actions) {
      var route = new Route(url);

      actions = extend({}, DEFAULT_ACTIONS, actions);

      function extractParams(data, actionParams){
        var ids = {};
        actionParams = extend({}, paramDefaults, actionParams);
        forEach(actionParams, function(value, key){
          if (isFunction(value)) { value = value(); }
          ids[key] = value.charAt && value.charAt(0) == '@' ? getter(data, value.substr(1)) : value;
        });
        return ids;
      }

      function Resource(value){
        copy(value || {}, this);
      }

      forEach(actions, function(action, name) {
        action.method = angular.uppercase(action.method);
        var hasBody = action.method == 'POST' || action.method == 'PUT' || action.method == 'PATCH';
        Resource[name] = function(a1, a2, a3, a4) {
          var params = {};
          var data;
          var success = noop;
          var error = null;
          var promise;

          switch(arguments.length) {
          case 4:
            error = a4;
            success = a3;
            //fallthrough
          case 3:
          case 2:
            if (isFunction(a2)) {
              if (isFunction(a1)) {
                success = a1;
                error = a2;
                break;
              }

              success = a2;
              error = a3;
              //fallthrough
            } else {
              params = a1;
              data = a2;
              success = a3;
              break;
            }
          case 1:
            if (isFunction(a1)) success = a1;
            else if (hasBody) data = a1;
            else params = a1;
            break;
          case 0: break;
          default:
            throw "Expected between 0-4 arguments [params, data, success, error], got " +
              arguments.length + " arguments.";
          }

          var value = this instanceof Resource ? this : (action.isArray ? [] : new Resource(data));
          var httpConfig = {},
              promise;

          forEach(action, function(value, key) {
            if (key != 'params' && key != 'isArray' ) {
              httpConfig[key] = copy(value);
            }
          });
          httpConfig.data = data;
          route.setUrlParams(httpConfig, extend({}, extractParams(data, action.params || {}), params), action.url);

          function markResolved() { value.$resolved = true; }

          promise = $http(httpConfig);
          value.$resolved = false;

          promise.then(markResolved, markResolved);
          value.$then = promise.then(function(response) {
            var data = response.data;
            var then = value.$then, resolved = value.$resolved;

            if (data) {
              if (action.isArray) {
                value.length = 0;
                forEach(data, function(item) {
                  value.push(new Resource(item));
                });
              } else {
                copy(data, value);
                value.$then = then;
                value.$resolved = resolved;
              }
            }

            (success||noop)(value, response.headers);

            response.resource = value;
            return response;
          }, error).then;

          return value;
        };


        Resource.prototype['$' + name] = function(a1, a2, a3) {
          var params = extractParams(this),
              success = noop,
              error;

          switch(arguments.length) {
          case 3: params = a1; success = a2; error = a3; break;
          case 2:
          case 1:
            if (isFunction(a1)) {
              success = a1;
              error = a2;
            } else {
              params = a1;
              success = a2 || noop;
            }
          case 0: break;
          default:
            throw "Expected between 1-3 arguments [params, success, error], got " +
              arguments.length + " arguments.";
          }
          var data = hasBody ? this : undefined;
          Resource[name].call(this, params, data, success, error);
        };
      });

      Resource.bind = function(additionalParamDefaults){
        return ResourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
      };

      return Resource;
    }

    return ResourceFactory;
  }]);
