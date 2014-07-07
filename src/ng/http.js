'use strict';

/**
 * Parse headers into key value object
 *
 * @param {string} headers Raw headers as a string
 * @returns {Object} Parsed headers as key value object
 */
function parseHeaders(headers) {
  var parsed = {}, key, val, i;

  if (!headers) return parsed;

  forEach(headers.split('\n'), function(line) {
    i = line.indexOf(':');
    key = lowercase(trim(line.substr(0, i)));
    val = trim(line.substr(i + 1));

    if (key) {
      if (parsed[key]) {
        parsed[key] += ', ' + val;
      } else {
        parsed[key] = val;
      }
    }
  });

  return parsed;
}


var IS_SAME_DOMAIN_URL_MATCH = /^(([^:]+):)?\/\/(\w+:{0,1}\w*@)?([\w\.-]*)?(:([0-9]+))?(.*)$/;


/**
 * Parse a request and location URL and determine whether this is a same-domain request.
 *
 * @param {string} requestUrl The url of the request.
 * @param {string} locationUrl The current browser location url.
 * @returns {boolean} Whether the request is for the same domain.
 */
function isSameDomain(requestUrl, locationUrl) {
  var match = IS_SAME_DOMAIN_URL_MATCH.exec(requestUrl);
  // if requestUrl is relative, the regex does not match.
  if (match == null) return true;

  var domain1 = {
      protocol: match[2],
      host: match[4],
      port: int(match[6]) || DEFAULT_PORTS[match[2]] || null,
      // IE8 sets unmatched groups to '' instead of undefined.
      relativeProtocol: match[2] === undefined || match[2] === ''
    };

  match = SERVER_MATCH.exec(locationUrl);
  var domain2 = {
      protocol: match[1],
      host: match[3],
      port: int(match[5]) || DEFAULT_PORTS[match[1]] || null
    };

  return (domain1.protocol == domain2.protocol || domain1.relativeProtocol) &&
         domain1.host == domain2.host &&
         (domain1.port == domain2.port || (domain1.relativeProtocol &&
             domain2.port == DEFAULT_PORTS[domain2.protocol]));
}


/**
 * Returns a function that provides access to parsed headers.
 *
 * Headers are lazy parsed when first requested.
 * @see parseHeaders
 *
 * @param {(string|Object)} headers Headers to provide access to.
 * @returns {function(string=)} Returns a getter function which if called with:
 *
 *   - if called with single an argument returns a single header value or null
 *   - if called with no arguments returns an object containing all headers.
 */
function headersGetter(headers) {
  var headersObj = isObject(headers) ? headers : undefined;

  return function(name) {
    if (!headersObj) headersObj =  parseHeaders(headers);

    if (name) {
      return headersObj[lowercase(name)] || null;
    }

    return headersObj;
  };
}


/**
 * Chain all given functions
 *
 * This function is used for both request and response transforming
 *
 * @param {*} data Data to transform.
 * @param {function(string=)} headers Http headers getter fn.
 * @param {(function|Array.<function>)} fns Function or an array of functions.
 * @returns {*} Transformed data.
 */
function transformData(data, headers, fns) {
  if (isFunction(fns))
    return fns(data, headers);

  forEach(fns, function(fn) {
    data = fn(data, headers);
  });

  return data;
}


function isSuccess(status) {
  return 200 <= status && status < 300;
}


function $HttpProvider() {
  var JSON_START = /^\s*(\[|\{[^\{])/,
      JSON_END = /[\}\]]\s*$/,
      PROTECTION_PREFIX = /^\)\]\}',?\n/;

  var defaults = this.defaults = {
    // transform incoming response data
    transformResponse: [function(data) {
      if (isString(data)) {
        // strip json vulnerability protection prefix
        data = data.replace(PROTECTION_PREFIX, '');
        if (JSON_START.test(data) && JSON_END.test(data))
          data = fromJson(data, true);
      }
      return data;
    }],

    // transform outgoing request data
    transformRequest: [function(d) {
      return isObject(d) && !isFile(d) ? toJson(d) : d;
    }],

    // default headers
    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*'
      },
      post: {'Content-Type': 'application/json;charset=utf-8'},
      put:  {'Content-Type': 'application/json;charset=utf-8'}
    },

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
  };

  /**
   * Are order by request. I.E. they are applied in the same order as
   * array on request, but revers order on response.
   */
  var interceptorFactories = this.interceptors = [];
  /**
   * For historical reasons, response interceptors ordered by the order in which
   * they are applied to response. (This is in revers to interceptorFactories)
   */
  var responseInterceptorFactories = this.responseInterceptors = [];

  this.$get = ['$httpBackend', '$browser', '$cacheFactory', '$rootScope', '$q', '$injector',
      function($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {

    var defaultCache = $cacheFactory('$http');

    /**
     * Interceptors stored in reverse order. Inner interceptors before outer interceptors.
     * The reversal is needed so that we can build up the interception chain around the
     * server request.
     */
    var reversedInterceptors = [];

    forEach(interceptorFactories, function(interceptorFactory) {
      reversedInterceptors.unshift(isString(interceptorFactory)
          ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
    });

    forEach(responseInterceptorFactories, function(interceptorFactory, index) {
      var responseFn = isString(interceptorFactory)
          ? $injector.get(interceptorFactory)
          : $injector.invoke(interceptorFactory);

      /**
       * Response interceptors go before "around" interceptors (no real reason, just
       * had to pick one.) But they are already revesed, so we can't use unshift, hence
       * the splice.
       */
      reversedInterceptors.splice(index, 0, {
        response: function(response) {
          return responseFn($q.when(response));
        },
        responseError: function(response) {
          return responseFn($q.reject(response));
        }
      });
    });


    /**
     * @ngdoc function
     * @name ng.$http
     * @requires $httpBackend
     * @requires $browser
     * @requires $cacheFactory
     * @requires $rootScope
     * @requires $q
     * @requires $injector
     *
     * @description
     * Сервис `$http` является базовым сервисом Angular, который используется для коммуникаций с удаленным HTTP
     * сервером с помощью браузерного объекта {@link https://developer.mozilla.org/en/xmlhttprequest
     * XMLHttpRequest} или {@link http://en.wikipedia.org/wiki/JSONP JSONP}.
     *
     * Для модульного тестирования приложения использующего сервис `$http`, смотрите
     * {@link ngMock.$httpBackend $httpBackend mock}.
     *
     * Для изучения высокоуровневых абстракций, посмотрите сервис {@link ngResource.$resource
     * $resource}.
     *
     * $http API базируется на {@link ng.$q deferred/promise API} предоставленном сервисом $q.
     * Для простых приложений изучение этих API не представляется важным, тогда как для продвинутого
     * использования, очень важно с ними ознакомится и знать возможности, которые они предоставляют.
     *
     * # Основной способ использования
     *
     * Сервис `$http` это функция, которая принимает один аргумент — объект с настройками — который используется
     * для генерации HTTP запроса, и возвращает {@link ng.$q promise} с двумя определенными в $http методами:
     * `success` и `error`.
     *
     * <pre>
     *   $http({method: 'GET', url: '/someUrl'}).
     *     success(function(data, status, headers, config) {
     *       // this callback will be called asynchronously
     *       // when the response is available
     *     }).
     *     error(function(data, status, headers, config) {
     *       // called asynchronously if an error occurs
     *       // or server returns response with an error status.
     *     });
     * </pre>
     *
     * Так как возвращаемым значением функции $http является `promise`, вы можете использовать метод `then`
     * чтобы регистрировать колбэк, и они будут получать только один аргумент – объект представляющий ответ
     * сервера. Смотрите определение API и типов для более детальной информации.
     *
     * Ответ сервера со статусом в диапазоне от 200 до 299 считается успешным, и в результате будет вызван
     * колбэк success. Заметьте, если ответом сервиса является перенаправление на другую страницу,
     * XMLHttpRequest будет ожидаемо следовать туда, а это означает что колбэк error для таких ответов
     * вызываться не будет.
     *
     * # Сокращенные методы
     *
     * Каждый вызов сервиса $http обязательно принимает в параметрах HTTP метод и URL, и POST/PUT запросы к
     * тому же обязательно передают данные, для сокращения их вызова были созданы сокращенные методы:
     *
     * <pre>
     *   $http.get('/someUrl').success(successCallback);
     *   $http.post('/someUrl', data).success(successCallback);
     * </pre>
     *
     * Полный список сокращенных методов:
     *
     * - {@link ng.$http#get $http.get}
     * - {@link ng.$http#head $http.head}
     * - {@link ng.$http#post $http.post}
     * - {@link ng.$http#put $http.put}
     * - {@link ng.$http#delete $http.delete}
     * - {@link ng.$http#jsonp $http.jsonp}
     *
     *
     * # Установка HTTP заголовков
     *
     * Сервис $http будет автоматически добавлять некоторые HTTP заголовки для всех запросов. Значения по умолчанию
     * могут быть настроены через доступ к конфигурационному объекту `$httpProvider.defaults.headers`, который
     * сейчас содержит конфигурацию по умолчанию:
     *
     * - `$httpProvider.defaults.headers.common` (заголовки общие для всех запросов):
     *   - `Accept: application/json, text/plain, * / *`
     * - `$httpProvider.defaults.headers.post`: (заголовок по умолчанию для POST запросов)
     *   - `Content-Type: application/json`
     * - `$httpProvider.defaults.headers.put` (заголовок по умолчанию для PUT запросов)
     *   - `Content-Type: application/json`
     *
     * Чтобы добавить или переопределить значения по умолчанию, просто добавьте или удалите свойства из
     * конфигурационных объектов. Чтобы добавить заголовки для HTTP метода, отличного от POST или PUT,
     * просто добавьте новый объект с именем HTTP метода в нижнем регистре в качестве ключа, например так,
     * `$httpProvider.defaults.headers.get['My-Header']='value'`.
     *
     * Дополнительно, значения по умолчанию могут быть установлены во время выполнения с помощью объекта
     * `$http.defaults` в таком же стиле, как и разъясненном ранее.
     *
     * # Преобразование запросов и ответов
     *
     * И запросы, и ответы могут быть преобразованы с использованием функций трансформации. По умолчанию,
     * Angular применяет эти преобразования:
     *
     * Преобразования запросов:
     *
     * - Если свойство data запроса содержит объект, то он сериализуется в формат JSON.
     *
     * Преобразования ответов:
     *
     *  - Если обнаружен префикс XSRF, удаляет его (смотрите раздел вопросы безопасности ниже).
     *  - Если обнаружен что ответ в формате JSON, десериализует его используя анализатор JSON.
     *
     * Для добавления или переопределения преобразований по умолчанию, модифицируйте свойства
     * `$httpProvider.defaults.transformRequest` и `$httpProvider.defaults.transformResponse`.
     * Эти свойства содержат массивы функций преобразований, которые позволяют вам добавлять с помощью методов
     * массива `push` или `unshift` новые функции трансформации в цепочку преобразований. Вы также можете полностью
     * переопределить любые преобразования по умолчанию, присвоив свои функции преобразования этим свойствам
     * напрямую, без массива обертки.
     *
     * Кроме того, для локального переопределения преобразований запроса/ответа, расширьте объект передаваемый
     * $http свойством `transformRequest` и/или `transformResponse` и передайте им объект с конфигурацией.
     *
     *
     * # Кэширование
     *
     * Чтобы включить кэширование, установите конфигурационное свойство `cache` в `true`. Когда кэширование
     * включено, `$http` сохраняет ответы сервера в локальном кэше. В последующем ответ сервера извлекается
     * из кэша без отправки запроса.
     *
     * Следует отметить, что даже если данные выдаются из кэша, это делается асинхронным способом, так же как
     * и при отправке запроса на сервер.
     *
     * Если есть несколько GET запросов на один и тот же URL они кэшируются в один кэш, но кэш пуст, пока не
     * пройдет первый запрос, а все остальные уже будут использовать ответ сервера из кэша.
     *
     * Обычный кэш по умолчанию построенный $cacheFactory может быть предоставлена в $http.defaults.cache.
     * Чтобы пропустить его, установите свойство конфигурации `cache` в `false`.
     *
     *
     * # Перехватчики ответов
     *
     * Перед началом создания перехватчиков, обязательно изучите  {@link ng.$q $q и deferred/promise API}.
     *
     * Для целей глобальной обработки ошибок, аутентификации, или любой дочерней синхронной или асинхронной
     * предобработки полученных ответов, желательно иметь возможность перехватывать ответы на http запросы
     * перед тем, как они будут переданы на обработку коду приложения, инициировавшему запросы. Перехватчики
     * ответов используют {@link ng.$q promise API} когда им нужна предобработка в обоих, синхронной и
     * асинхронной манере.
     *
     * Перехватчики – это фабрики сервисов, которые регистрируются в `$httpProvider` путем добавления их в
     * массив `$httpProvider.responseInterceptors`. Фабрика создает и внедряет зависимости (если нужно)
     * и возвращает перехватчика – это функция которая работает с promise и возвращает оригинальный или новый promise.
     *
     * Есть два вида перехватчиков (и два вида отказа перехватчиков):
     *
     *   * `request`: перехватчики вызова с http-объектом `config`. Функция свободно изменяет `config` или
     *      создает новый. Функция должна вернуть `config` напрямую или как обещание.
     *   * `requestError`: перехватчик вызывается, когда предыдущие перехватчики выдали ошибку или завершились
     *      отказом
     *   * `response`: перехватчики вызова с http-объектом `response`. Функция свободно изменяет `response` или
     *      создает новый. Функция должна вернуть `response` напрямую или как обещание.
     *   * `responseError`: перехватчик вызывается, когда предыдущие перехватчики выдали ошибку или завершились
     *      отказом
     *
     * <pre>
     *   // регистрация сервиса перехватчика
     *   $provide.factory('myHttpInterceptor', function($q, dependency1, dependency2) {
     *     return {
     *       // не обязательный метод
     *       'request': function(config) {
     *         // что-то делает при успешном статусе ответа сервера
     *         return config || $q.when(config);
     *       },
     *
     *       // не обязательный метод
     *      'requestError': function(rejection) {
     *         // что-то делает при ошибке
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       },
     *
     *
     *
     *       // не обязательный метод
     *       'response': function(response) {
     *         // что-то делает при успешном статусе ответа сервера
     *         return response || $q.when(response);
     *       },
     *
     *       // не обязательный метод
     *      'responseError': function(rejection) {
     *         // что-то делает при ошибке
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       };
     *     }
     *   });
     *
     *   $httpProvider.interceptors.push('myHttpInterceptor');
     *
     *
     *   // регистрация перехватчика как анонимной функции
     *   $httpProvider.interceptors.push(function($q, dependency1, dependency2) {
     *     return {
     *      'request': function(config) {
     *          // так же как указано выше
     *       },
     *       'response': function(response) {
     *          // так же как указано выше
     *       }
     *   });
     * </pre>
     *
     * # Response interceptors (Будет удалено в следующих версиях)
     *
     * Before you start creating interceptors, be sure to understand the
     * {@link ng.$q $q and deferred/promise APIs}.
     *
     * For purposes of global error handling, authentication or any kind of synchronous or
     * asynchronous preprocessing of received responses, it is desirable to be able to intercept
     * responses for http requests before they are handed over to the application code that
     * initiated these requests. The response interceptors leverage the {@link ng.$q
     * promise apis} to fulfil this need for both synchronous and asynchronous preprocessing.
     *
     * The interceptors are service factories that are registered with the $httpProvider by
     * adding them to the `$httpProvider.responseInterceptors` array. The factory is called and
     * injected with dependencies (if specified) and returns the interceptor  — a function that
     * takes a {@link ng.$q promise} and returns the original or a new promise.
     *
     * <pre>
     *   // register the interceptor as a service
     *   $provide.factory('myHttpInterceptor', function($q, dependency1, dependency2) {
     *     return function(promise) {
     *       return promise.then(function(response) {
     *         // do something on success
     *       }, function(response) {
     *         // do something on error
     *         if (canRecover(response)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(response);
     *       });
     *     }
     *   });
     *
     *   $httpProvider.responseInterceptors.push('myHttpInterceptor');
     *
     *
     *   // register the interceptor via an anonymous factory
     *   $httpProvider.responseInterceptors.push(function($q, dependency1, dependency2) {
     *     return function(promise) {
     *       // same as above
     *     }
     *   });
     * </pre>
     *
     *
     * # Соображения безопасности
     *
     * Когда создаются веб-приложения, угрозы безопасности исходят из:
     *
     * - {@link http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx
     *   JSON уязвимостей}
     * - {@link http://en.wikipedia.org/wiki/Cross-site_request_forgery XSRF}
     *
     * И сервер и клиент, должны работать совместно для ликвидации этих угроз. Angular поставляется с
     * предварительно настроенными стратегиями, учитывающими эти вопросы, но также требуется сотрудничество сервера.
     *
     * ## Защита от JSON уязвимостей
     *
     * {@link http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx
     * JSON уязвимости} позволяют веб-сайту третьих лиц подменить ваш URL для ресурса JSON, на запрос
     * {@link http://en.wikipedia.org/wiki/JSONP JSONP} при определенных условиях. Чтобы этому противостоять,
     * ваш сервер может добавлять префикс `")]}',\n"` для всех ответов на запросы в формате JSON.
     * Angular будет автоматически вырезать префикс перед обработкой ответа как JSON.
     *
     * Для примера, если ваш сервер должен вернуть:
     * <pre>
     * ['one','two']
     * </pre>
     *
     * что уязвимо для атак, ваш сервер может вернуть:
     * <pre>
     * )]}',
     * ['one','two']
     * </pre>
     *
     * Angular будет удалять префикс, перед обработкой JSON.
     *
     *
     * ## Защита от Cross Site Request Forgery (XSRF)
     *
     * {@link http://en.wikipedia.org/wiki/Cross-site_request_forgery XSRF} эта техника, с помощью которой
     * сайт злоумышленника может получить секретные данные вашего пользователя. Angular предоставляет механизм
     * для противодействия XSRF. Когда выполняются XHR запросы, сервис $http читает маркер из куки `XSRF-TOKEN`
     * и устанавливает его как HTTP заголовок `X-XSRF-TOKEN`. Поскольку только JavaScript, который работает в
     * вашем домене может читать куки, ваш сервер может быть уверен, что XHR пришло из кода JavaScript выполняемого
     * на вашем домене.
     *
     * Чтобы это заработало, нужно чтобы ваш сервер установил метку в доступной для чтения из JavaScript
     * сессионной куки с именем `XSRF-TOKEN` в ответ на первый HTTP GET запрос. Следующие XHR запросы сервер
     * может проверить, сравнивая значение куки и присланного HTTP заголовка `X-XSRF-TOKEN`, чтобы убедиться что
     * запрос не поддельный. Метка должна быть уникальной для каждого пользователя и проверяемой для сервера
     * (препятствуйте тому, чтобы JavaScript сам генерировал матки). Мы рекомендуем чтобы метка служила основой
     * для процесса аутентификации на вашем сайте с добавление
     * {@link https://en.wikipedia.org/wiki/Salt_(cryptography) соли} для большей безопасности.
     *
     * Название заголовков можно задать с помощью xsrfHeaderName и xsrfCookieName свойства либо
     * $httpProvider.defaults или каждого запроса объекта конфигурации.
     *
     *
     * @param {object} config Объект описывающий создаваемый запрос. Этот объект имеет следующие свойства:
     *
     *    - **method** – `{string}` – HTTP метод (напр. 'GET', 'POST', и т. д.)
     *    - **url** – `{string}` – Абсолютный или относительный URL для ресурса к которому будет запрос.
     *    - **params** – `{Object.<string|Object>}` – Набор строк или объектов, которые будут переданы
     *      как `?key1=value1&key2=value2` после url. Если значения не строка, тогда оно будет преобразовано
     *      в строку в формате JSON.
     *    - **data** – `{string|Object}` – Данные которые будут отправлены вместе с запросом.
     *    - **headers** – `{Object}` – Набор строк, представляющих HTTP заголовки, которые должны быть
     *      отправлены на сервер.
     *    - **xsrfHeaderName** – `{string}` – Имя HTTP заколовка для наполнения с XSRF токеном.
     *    - **xsrfCookieName** – `{string}` – Имя куки, содержащей XSRF токен.
     *    - **transformRequest** – `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
     *      функция преобразования или массив таких функций. Функция преобразования берет тело и заголовки
     *      http запроса и возвращает преобразованную (по умолчанию сериализованую) версию.
     *    - **transformResponse** – `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
     *      функция преобразования или массив таких функций. Функция преобразования берет тело и заголовки
     *      http ответа и возвращает преобразованную (по умолчанию десериализованую) версию.
     *    - **cache** – `{boolean|Cache}` – Если true, по умолчанию кэш $http будет использоваться для
     *      кэширования GET запросов, однако если экземпляр кэша построен с помощью
     *      {@link ng.$cacheFactory $cacheFactory}, он может быть использован для кэширования.
     *    - **timeout** – `{number|Promise}` – задержка в милисекундах или {@link ng.$q обещание}
     *      которое при выполнении должно прервать запрос.
     *    - **withCredentials** - `{boolean}` - следует ли устанавливать флаг `withCredentials` для XHR объекта.
     *      См. {@link https://developer.mozilla.org/en/http_access_control#section_5
     *      requests with credentials} для более детальной информации.
     *    - **responseType** - `{string}` - см. {@link
     *      https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType requestType}.
     *
     * @returns {HttpPromise} Возвращает объект {@link ng.$q promise} со стандартным методом `then` и
     *   двумя специфичными методами: `success` и `error`. Метод `then` имеет два аргумента, первый –
     *   колбэк, который будет выполнен в случае успешного ответа, второй –
     *   колбэк, который будет выполнен в случае ошибки. Методы `success` и `error` имеют по одному аргументу –
     *   колбэк, который будет выполнен в случае успешного завершения запроса или ошибки соответственно.
     *   Аргументы переданы в эти функции это деструктурированный объект ответа сервера переданный в метод `then`.
     *   Объект ответа от сервера имеет свойства:
     *
     *   - **data** – `{string|Object}` – Тело ответа преобразованное с помощью функций преобразования.
     *   - **status** – `{number}` – код HTTP статуса ответа.
     *   - **headers** – `{function([headerName])}` – Функция возвращающая заголовок по названию.
     *   - **config** – `{Object}` – Конфигурационный объект, который был использован для создания запроса.
     *
     * @property {Array.<Object>} pendingRequests Массив объектов конфигурации для текущих запросов.
     *   В первую очередь предназначен для использования в целях отладки.     *
     *
     * @example
      <example>
        <file name="index.html">
          <div ng-controller="FetchCtrl">
            <select ng-model="method">
              <option>GET</option>
              <option>JSONP</option>
            </select>
            <input type="text" ng-model="url" size="80"/>
            <button ng-click="fetch()">fetch</button><br>
            <button ng-click="updateModel('GET', 'http-hello.html')">Sample GET</button>
            <button ng-click="updateModel('JSONP', 'http://angularjs.org/greet.php?callback=JSON_CALLBACK&name=Super%20Hero')">Sample JSONP</button>
            <button ng-click="updateModel('JSONP', 'http://angularjs.org/doesntexist&callback=JSON_CALLBACK')">Invalid JSONP</button>
            <pre>http status code: {{status}}</pre>
            <pre>http response data: {{data}}</pre>
          </div>
        </file>
        <file name="script.js">
          function FetchCtrl($scope, $http, $templateCache) {
            $scope.method = 'GET';
            $scope.url = 'http-hello.html';

            $scope.fetch = function() {
              $scope.code = null;
              $scope.response = null;

              $http({method: $scope.method, url: $scope.url, cache: $templateCache}).
                success(function(data, status) {
                  $scope.status = status;
                  $scope.data = data;
                }).
                error(function(data, status) {
                  $scope.data = data || "Request failed";
                  $scope.status = status;
              });
            };

            $scope.updateModel = function(method, url) {
              $scope.method = method;
              $scope.url = url;
            };
          }
        </file>
        <file name="http-hello.html">
          Hello, $http!
        </file>
        <file name="scenario.js">
          it('should make an xhr GET request', function() {
            element(':button:contains("Sample GET")').click();
            element(':button:contains("fetch")').click();
            expect(binding('status')).toBe('200');
            expect(binding('data')).toMatch(/Hello, \$http!/);
          });

          xit('should make a JSONP request to angularjs.org', function() {
            element(':button:contains("Sample JSONP")').click();
            element(':button:contains("fetch")').click();
            expect(binding('status')).toBe('200');
            expect(binding('data')).toMatch(/Super Hero!/);
          });

          xit('should make JSONP request to invalid URL and invoke the error handler',
              function() {
            element(':button:contains("Invalid JSONP")').click();
            element(':button:contains("fetch")').click();
            expect(binding('status')).toBe('0');
            expect(binding('data')).toBe('Request failed');
          });
        </file>
      </example>
     */
    function $http(requestConfig) {
      var config = {
        transformRequest: defaults.transformRequest,
        transformResponse: defaults.transformResponse
      };
      var headers = {};

      extend(config, requestConfig);
      config.headers = headers;
      config.method = uppercase(config.method);

      extend(headers,
          defaults.headers.common,
          defaults.headers[lowercase(config.method)],
          requestConfig.headers);

      var xsrfValue = isSameDomain(config.url, $browser.url())
          ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName]
          : undefined;
      if (xsrfValue) {
        headers[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
      }


      var serverRequest = function(config) {
        var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);

        // strip content-type if data is undefined
        if (isUndefined(config.data)) {
          delete headers['Content-Type'];
        }

        if (isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials)) {
          config.withCredentials = defaults.withCredentials;
        }

        // send request
        return sendReq(config, reqData, headers).then(transformResponse, transformResponse);
      };

      var chain = [serverRequest, undefined];
      var promise = $q.when(config);

      // apply interceptors
      forEach(reversedInterceptors, function(interceptor) {
        if (interceptor.request || interceptor.requestError) {
          chain.unshift(interceptor.request, interceptor.requestError);
        }
        if (interceptor.response || interceptor.responseError) {
          chain.push(interceptor.response, interceptor.responseError);
        }
      });

      while(chain.length) {
        var thenFn = chain.shift();
        var rejectFn = chain.shift();

        promise = promise.then(thenFn, rejectFn);
      };

      promise.success = function(fn) {
        promise.then(function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };

      promise.error = function(fn) {
        promise.then(null, function(response) {
          fn(response.data, response.status, response.headers, config);
        });
        return promise;
      };

      return promise;

      function transformResponse(response) {
        // make a copy since the response must be cacheable
        var resp = extend({}, response, {
          data: transformData(response.data, response.headers, config.transformResponse)
        });
        return (isSuccess(response.status))
          ? resp
          : $q.reject(resp);
      }
    }

    $http.pendingRequests = [];

    /**
     * @ngdoc method
     * @name ng.$http#get
     * @methodOf ng.$http
     *
     * @description
     * Короткая запись метода для запроса `GET`.
     *
     * @param {string} url Относительный или абсолютный URL по которому отправляется запрос.
     * @param {Object=} config Необязательный конфигурационный объект
     * @returns {HttpPromise} Будущий объект
     */

    /**
     * @ngdoc method
     * @name ng.$http#delete
     * @methodOf ng.$http
     *
     * @description
     * Короткая запись метода для запроса `DELETE`.
     *
     * @param {string} url Относительный или абсолютный URL по которому отправляется запрос.
     * @param {Object=} config Необязательный конфигурационный объект
     * @returns {HttpPromise} Будущий объект
     */

    /**
     * @ngdoc method
     * @name ng.$http#head
     * @methodOf ng.$http
     *
     * @description
     * Короткая запись метода для запроса `HEAD`.
     *
     * @param {string} url Относительный или абсолютный URL по которому отправляется запрос.
     * @param {Object=} config Необязательный конфигурационный объект
     * @returns {HttpPromise} Будущий объект
     */

    /**
     * @ngdoc method
     * @name ng.$http#jsonp
     * @methodOf ng.$http
     *
     * @description
     * Короткая запись метода для запроса `JSONP`.
     *
     * @param {string} url Относительный или абсолютный URL по которому отправляется запрос.
     *                     Должен содержать строку `JSON_CALLBACK`.
     * @param {Object=} config Необязательный конфигурационный объект
     * @returns {HttpPromise} Будущий объект
     */
    createShortMethods('get', 'delete', 'head', 'jsonp');

    /**
     * @ngdoc method
     * @name ng.$http#post
     * @methodOf ng.$http
     *
     * @description
     * Короткая запись метода для запроса `POST`.
     *
     * @param {string} url Относительный или абсолютный URL по которому отправляется запрос.
     * @param {*} data Данные запроса.
     * @param {Object=} config Необязательный конфигурационный объект
     * @returns {HttpPromise} Будущий объект
     */

    /**
     * @ngdoc method
     * @name ng.$http#put
     * @methodOf ng.$http
     *
     * @description
     * Короткая запись метода для запроса `PUT`.
     *
     * @param {string} url Относительный или абсолютный URL по которому отправляется запрос.
     * @param {*} data Данные запроса.
     * @param {Object=} config Необязательный конфигурационный объект
     * @returns {HttpPromise} Будущий объект
     */
    createShortMethodsWithData('post', 'put');

        /**
         * @ngdoc property
         * @name ng.$http#defaults
         * @propertyOf ng.$http
         *
         * @description
         * Эквивалент времени выполнения для свойства `$httpProvider.defaults`. Позволяет настроить
         * заголовки по умолчанию для запросов и преобразователей для ответов сервера.
         *
         * Смотрите выше главы «Настройка HTTP заголовков» и «Преобразование запросов и ответов».
         */
    $http.defaults = defaults;


    return $http;


    function createShortMethods(names) {
      forEach(arguments, function(name) {
        $http[name] = function(url, config) {
          return $http(extend(config || {}, {
            method: name,
            url: url
          }));
        };
      });
    }


    function createShortMethodsWithData(name) {
      forEach(arguments, function(name) {
        $http[name] = function(url, data, config) {
          return $http(extend(config || {}, {
            method: name,
            url: url,
            data: data
          }));
        };
      });
    }


    /**
     * Makes the request.
     *
     * !!! ACCESSES CLOSURE VARS:
     * $httpBackend, defaults, $log, $rootScope, defaultCache, $http.pendingRequests
     */
    function sendReq(config, reqData, reqHeaders) {
      var deferred = $q.defer(),
          promise = deferred.promise,
          cache,
          cachedResp,
          url = buildUrl(config.url, config.params);

      $http.pendingRequests.push(config);
      promise.then(removePendingReq, removePendingReq);


      if ((config.cache || defaults.cache) && config.cache !== false && config.method == 'GET') {
        cache = isObject(config.cache) ? config.cache
              : isObject(defaults.cache) ? defaults.cache
              : defaultCache;
      }

      if (cache) {
        cachedResp = cache.get(url);
        if (cachedResp) {
          if (cachedResp.then) {
            // cached request has already been sent, but there is no response yet
            cachedResp.then(removePendingReq, removePendingReq);
            return cachedResp;
          } else {
            // serving from cache
            if (isArray(cachedResp)) {
              resolvePromise(cachedResp[1], cachedResp[0], copy(cachedResp[2]));
            } else {
              resolvePromise(cachedResp, 200, {});
            }
          }
        } else {
          // put the promise for the non-transformed response into cache as a placeholder
          cache.put(url, promise);
        }
      }

      // if we won't have the response in cache, send the request to the backend
      if (!cachedResp) {
        $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout,
            config.withCredentials, config.responseType);
      }

      return promise;


      /**
       * Callback registered to $httpBackend():
       *  - caches the response if desired
       *  - resolves the raw $http promise
       *  - calls $apply
       */
      function done(status, response, headersString) {
        if (cache) {
          if (isSuccess(status)) {
            cache.put(url, [status, response, parseHeaders(headersString)]);
          } else {
            // remove promise from the cache
            cache.remove(url);
          }
        }

        resolvePromise(response, status, headersString);
        $rootScope.$apply();
      }


      /**
       * Resolves the raw $http promise.
       */
      function resolvePromise(response, status, headers) {
        // normalize internal statuses to 0
        status = Math.max(status, 0);

        (isSuccess(status) ? deferred.resolve : deferred.reject)({
          data: response,
          status: status,
          headers: headersGetter(headers),
          config: config
        });
      }


      function removePendingReq() {
        var idx = indexOf($http.pendingRequests, config);
        if (idx !== -1) $http.pendingRequests.splice(idx, 1);
      }
    }


    function buildUrl(url, params) {
          if (!params) return url;
          var parts = [];
          forEachSorted(params, function(value, key) {
            if (value == null || value == undefined) return;
            if (!isArray(value)) value = [value];

            forEach(value, function(v) {
              if (isObject(v)) {
                v = toJson(v);
              }
              parts.push(encodeUriQuery(key) + '=' +
                         encodeUriQuery(v));
            });
          });
          return url + ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
        }


  }];
}
