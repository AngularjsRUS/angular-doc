/**
 * @license AngularJS v"NG_VERSION_FULL"
 * (c) 2010-2012 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * TODO(vojta): wrap whole file into closure during build
 */

/**
 * @ngdoc overview
 * @name angular.mock
 * @description
 *
 * Пространство имен из 'angular-mocks.js', содержащее связанный с тестированием код.
 */
angular.mock = {};

/**
 * ! This is a private undocumented service !
 *
 * @name ngMock.$browser
 *
 * @description
 * Этот сервис является имитацией реализацию {@link ng.$browser}. Он обеспечивает реализацию поддельной для 
 * часто используемых браузером API, которые трудно проверить, например, SetTimeout, XHR, cookies, и т.д.
 * 
 * API этого сервиса является таким же, как реального {@link ng.$browser $browser}, за исключением того, 
 * что существует несколько вспомогательных методов, которые могут быть использованы в тестах.
 */
angular.mock.$BrowserProvider = function() {
  this.$get = function(){
    return new angular.mock.$Browser();
  };
};

angular.mock.$Browser = function() {
  var self = this;

  this.isMock = true;
  self.$$url = "http://server/";
  self.$$lastUrl = self.$$url; // used by url polling fn
  self.pollFns = [];

  // TODO(vojta): remove this temporary api
  self.$$completeOutstandingRequest = angular.noop;
  self.$$incOutstandingRequestCount = angular.noop;


  // register url polling fn

  self.onUrlChange = function(listener) {
    self.pollFns.push(
      function() {
        if (self.$$lastUrl != self.$$url) {
          self.$$lastUrl = self.$$url;
          listener(self.$$url);
        }
      }
    );

    return listener;
  };

  self.cookieHash = {};
  self.lastCookieHash = {};
  self.deferredFns = [];
  self.deferredNextId = 0;

  self.defer = function(fn, delay) {
    delay = delay || 0;
    self.deferredFns.push({time:(self.defer.now + delay), fn:fn, id: self.deferredNextId});
    self.deferredFns.sort(function(a,b){ return a.time - b.time;});
    return self.deferredNextId++;
  };


  self.defer.now = 0;


  self.defer.cancel = function(deferId) {
    var fnIndex;

    angular.forEach(self.deferredFns, function(fn, index) {
      if (fn.id === deferId) fnIndex = index;
    });

    if (fnIndex !== undefined) {
      self.deferredFns.splice(fnIndex, 1);
      return true;
    }

    return false;
  };


  /**
   * @name ngMock.$browser#defer.flush
   * @methodOf ngMock.$browser
   *
   * @description
   * Очищает все ожидающие выполнения запросы и выполняет колбэки должников.
   *
   * @param {number=} number of Количество миллисекунд для сброса. См. {@link #defer.now}
   */
  self.defer.flush = function(delay) {
    if (angular.isDefined(delay)) {
      self.defer.now += delay;
    } else {
      if (self.deferredFns.length) {
        self.defer.now = self.deferredFns[self.deferredFns.length-1].time;
      } else {
        throw Error('No deferred tasks to be flushed');
      }
    }

    while (self.deferredFns.length && self.deferredFns[0].time <= self.defer.now) {
      self.deferredFns.shift().fn();
    }
  };
  /**
   * @name ngMock.$browser#defer.now
   * @propertyOf ngMock.$browser
   *
   * @description
   * Текущее время имитации в миллисекундах.
   */

  self.$$baseHref = '';
  self.baseHref = function() {
    return this.$$baseHref;
  };
};
angular.mock.$Browser.prototype = {

/**
  * @name ngMock.$browser#poll
  * @methodOf ngMock.$browser
  *
  * @description
  * Выполняет все fns в pollFns
  */
  poll: function poll() {
    angular.forEach(this.pollFns, function(pollFn){
      pollFn();
    });
  },

  addPollFn: function(pollFn) {
    this.pollFns.push(pollFn);
    return pollFn;
  },

  url: function(url, replace) {
    if (url) {
      this.$$url = url;
      return this;
    }

    return this.$$url;
  },

  cookies:  function(name, value) {
    if (name) {
      if (value == undefined) {
        delete this.cookieHash[name];
      } else {
        if (angular.isString(value) &&       //strings only
            value.length <= 4096) {          //strict cookie storage limits
          this.cookieHash[name] = value;
        }
      }
    } else {
      if (!angular.equals(this.cookieHash, this.lastCookieHash)) {
        this.lastCookieHash = angular.copy(this.cookieHash);
        this.cookieHash = angular.copy(this.cookieHash);
      }
      return this.cookieHash;
    }
  },

  notifyWhenNoOutstandingRequests: function(fn) {
    fn();
  }
};


/**
 * @ngdoc object
 * @name ngMock.$exceptionHandlerProvider
 *
 * @description
 * настройка имитированной реализации {@link ng.$exceptionHandler} для переброса или записи в лог ошибок
 * в `$exceptionHandler`.
 */

/**
 * @ngdoc object
 * @name ngMock.$exceptionHandler
 *
 * @description
 * Имитация сервиса ng.$exceptionHandler, которая регенерирует или логирует передаваемые ему ошибки.
 * Подробнее о настройке см. в {@link ngMock.$exceptionHandlerProvider $exceptionHandlerProvider}.
 *
 *
 * <pre>
 *   describe('$exceptionHandlerProvider', function() {
 *
 *     it('should capture log messages and exceptions', function() {
 *
 *       module(function($exceptionHandlerProvider) {
 *         $exceptionHandlerProvider.mode('log');
 *       });
 *
 *       inject(function($log, $exceptionHandler, $timeout) {
 *         $timeout(function() { $log.log(1); });
 *         $timeout(function() { $log.log(2); throw 'banana peel'; });
 *         $timeout(function() { $log.log(3); });
 *         expect($exceptionHandler.errors).toEqual([]);
 *         expect($log.assertEmpty());
 *         $timeout.flush();
 *         expect($exceptionHandler.errors).toEqual(['banana peel']);
 *         expect($log.log.logs).toEqual([[1], [2], [3]]);
 *       });
 *     });
 *   });
 * </pre>
 */

angular.mock.$ExceptionHandlerProvider = function() {
  var handler;

  /**
   * @ngdoc method
   * @name ngMock.$exceptionHandlerProvider#mode
   * @methodOf ngMock.$exceptionHandlerProvider
   *
   * @description
   * Устанавливает режим ведения логов.
   *
   * @param {string} mode Режим операций, по умолчанию `rethrow`.
   *
   *   - `rethrow`: Если любая ошибка передана в обработчик в тесте, это обычно
   *                указывает на баг в приложении или тесте, так эта имитация
   *                приведет к провалу теста.
   *   - `log`: Иногда желательно, чтобы тест выпросил ошибку, в случае когда режим `log` хранит
   *            массив ошибок в`$exceptionHandler.errors` для последующего их разрешения.
   *            См. {@link ngMock.$log#assertEmpty assertEmpty()} и
   *             {@link ngMock.$log#reset reset()}
   */
  this.mode = function(mode) {
    switch(mode) {
      case 'rethrow':
        handler = function(e) {
          throw e;
        };
        break;
      case 'log':
        var errors = [];

        handler = function(e) {
          if (arguments.length == 1) {
            errors.push(e);
          } else {
            errors.push([].slice.call(arguments, 0));
          }
        };

        handler.errors = errors;
        break;
      default:
        throw Error("Unknown mode '" + mode + "', only 'log'/'rethrow' modes are allowed!");
    }
  };

  this.$get = function() {
    return handler;
  };

  this.mode('rethrow');
};


/**
 * @ngdoc service
 * @name ngMock.$log
 *
 * @description
 * Имитация реализации {@link ng.$log} которая собирает все сообщения системы логирования в массив (один массив 
 * на каждый уровень логирования). Эти массивы предоставляются через свойство `logs` для каждого уровня логирования, 
 * например для уровня ошибок этот массив доступен через `$log.error.logs`.
 *
 */
angular.mock.$LogProvider = function() {

  function concat(array1, array2, index) {
    return array1.concat(Array.prototype.slice.call(array2, index));
  }


  this.$get = function () {
    var $log = {
      log: function() { $log.log.logs.push(concat([], arguments, 0)); },
      warn: function() { $log.warn.logs.push(concat([], arguments, 0)); },
      info: function() { $log.info.logs.push(concat([], arguments, 0)); },
      error: function() { $log.error.logs.push(concat([], arguments, 0)); }
    };

    /**
     * @ngdoc method
     * @name ngMock.$log#reset
     * @methodOf ngMock.$log
     *
     * @description
     * Обнуляет все массивы сообщений.
     */
    $log.reset = function () {
      /**
       * @ngdoc property
       * @name ngMock.$log#log.logs
       * @propertyOf ngMock.$log
       *
       * @description
       * Массив сообщений системы логирования.
       */
      $log.log.logs = [];
      /**
       * @ngdoc property
       * @name ngMock.$log#warn.logs
       * @propertyOf ngMock.$log
       *
       * @description
       * Массив сообщений системы логирования.
       */
      $log.warn.logs = [];
      /**
       * @ngdoc property
       * @name ngMock.$log#info.logs
       * @propertyOf ngMock.$log
       *
       * @description
       * Массив сообщений системы логирования.
       */
      $log.info.logs = [];
      /**
       * @ngdoc property
       * @name ngMock.$log#error.logs
       * @propertyOf ngMock.$log
       *
       * @description
       * Массив сообщений системы логирования.
       */
      $log.error.logs = [];
    };

    /**
     * @ngdoc method
     * @name ngMock.$log#assertEmpty
     * @methodOf ngMock.$log
     *
     * @description
     * Утверждение, что все методы логирования не имеют сообщений. Если сообщение имеется, выбрасывается исключение.
     */
    $log.assertEmpty = function() {
      var errors = [];
      angular.forEach(['error', 'warn', 'info', 'log'], function(logLevel) {
        angular.forEach($log[logLevel].logs, function(log) {
          angular.forEach(log, function (logItem) {
            errors.push('MOCK $log (' + logLevel + '): ' + String(logItem) + '\n' + (logItem.stack || ''));
          });
        });
      });
      if (errors.length) {
        errors.unshift("Expected $log to be empty! Either a message was logged unexpectedly, or an expected " +
          "log message was not checked and removed:");
        errors.push('');
        throw new Error(errors.join('\n---------\n'));
      }
    };

    $log.reset();
    return $log;
  };
};


(function() {
  var R_ISO8061_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?:\:?(\d\d)(?:\:?(\d\d)(?:\.(\d{3}))?)?)?(Z|([+-])(\d\d):?(\d\d)))?$/;

  function jsonStringToDate(string){
    var match;
    if (match = string.match(R_ISO8061_STR)) {
      var date = new Date(0),
          tzHour = 0,
          tzMin  = 0;
      if (match[9]) {
        tzHour = int(match[9] + match[10]);
        tzMin = int(match[9] + match[11]);
      }
      date.setUTCFullYear(int(match[1]), int(match[2]) - 1, int(match[3]));
      date.setUTCHours(int(match[4]||0) - tzHour, int(match[5]||0) - tzMin, int(match[6]||0), int(match[7]||0));
      return date;
    }
    return string;
  }

  function int(str) {
    return parseInt(str, 10);
  }

  function padNumber(num, digits, trim) {
    var neg = '';
    if (num < 0) {
      neg =  '-';
      num = -num;
    }
    num = '' + num;
    while(num.length < digits) num = '0' + num;
    if (trim)
      num = num.substr(num.length - digits);
    return neg + num;
  }


  /**
   * @ngdoc object
   * @name angular.mock.TzDate
   * @description
   * 
   * *Примечание*: это не экземпляр для внедрения, просто глобально видимая имитация класса для Date.
   * 
   * Имитация класса для типа Date, который принимает временную зону в качестве аргумента конструктора.
   * 
   * Главная цель создания этого класса с временной зоной, указание требуемой временной зоны, так что вы можете
   * тестировать код в зависимости от временной зоны установленной на машине, где код выполняется.
   *
   * @param {number} offset Сдвиг для нужной временной зоны в часах (дробная часть для представления минут)
   * @param {(number|string)} timestamp Временной отпечаток UNIX для требуемого времени в *UTC*
   *
   * @example
   * !!!! ПРЕДУПРЕЖДЕНИЕ !!!!!
   * Это не полный объект Date так что безопасно можно вызывать только методы, которые были реализованы. 
   * Что еще хуже, экземпляры TzDate наследуются от Date с использованием прототипа.
   * 
   * Мы делаем все возможное, для перехвата «нереализованных» методов, но т.к. список методов является не полным, 
   * некоторые не стандартные методы могут отсутствовать. Это может в результате приводить к ошибкам типа: 
   * «Date.prototype.foo вызвана для несовместимого объекта Object».
   *
   * <pre>
   * var newYearInBratislava = new TzDate(-1, '2009-12-31T23:00:00Z');
   * newYearInBratislava.getTimezoneOffset() => -60;
   * newYearInBratislava.getFullYear() => 2010;
   * newYearInBratislava.getMonth() => 0;
   * newYearInBratislava.getDate() => 1;
   * newYearInBratislava.getHours() => 0;
   * newYearInBratislava.getMinutes() => 0;
   * newYearInBratislava.getSeconds() => 0;
   * </pre>
   *
   */
  angular.mock.TzDate = function (offset, timestamp) {
    var self = new Date(0);
    if (angular.isString(timestamp)) {
      var tsStr = timestamp;

      self.origDate = jsonStringToDate(timestamp);

      timestamp = self.origDate.getTime();
      if (isNaN(timestamp))
        throw {
          name: "Illegal Argument",
          message: "Arg '" + tsStr + "' passed into TzDate constructor is not a valid date string"
        };
    } else {
      self.origDate = new Date(timestamp);
    }

    var localOffset = new Date(timestamp).getTimezoneOffset();
    self.offsetDiff = localOffset*60*1000 - offset*1000*60*60;
    self.date = new Date(timestamp + self.offsetDiff);

    self.getTime = function() {
      return self.date.getTime() - self.offsetDiff;
    };

    self.toLocaleDateString = function() {
      return self.date.toLocaleDateString();
    };

    self.getFullYear = function() {
      return self.date.getFullYear();
    };

    self.getMonth = function() {
      return self.date.getMonth();
    };

    self.getDate = function() {
      return self.date.getDate();
    };

    self.getHours = function() {
      return self.date.getHours();
    };

    self.getMinutes = function() {
      return self.date.getMinutes();
    };

    self.getSeconds = function() {
      return self.date.getSeconds();
    };

    self.getMilliseconds = function() {
      return self.date.getMilliseconds();
    };

    self.getTimezoneOffset = function() {
      return offset * 60;
    };

    self.getUTCFullYear = function() {
      return self.origDate.getUTCFullYear();
    };

    self.getUTCMonth = function() {
      return self.origDate.getUTCMonth();
    };

    self.getUTCDate = function() {
      return self.origDate.getUTCDate();
    };

    self.getUTCHours = function() {
      return self.origDate.getUTCHours();
    };

    self.getUTCMinutes = function() {
      return self.origDate.getUTCMinutes();
    };

    self.getUTCSeconds = function() {
      return self.origDate.getUTCSeconds();
    };

    self.getUTCMilliseconds = function() {
      return self.origDate.getUTCMilliseconds();
    };

    self.getDay = function() {
      return self.date.getDay();
    };

    // provide this method only on browsers that already have it
    if (self.toISOString) {
      self.toISOString = function() {
        return padNumber(self.origDate.getUTCFullYear(), 4) + '-' +
              padNumber(self.origDate.getUTCMonth() + 1, 2) + '-' +
              padNumber(self.origDate.getUTCDate(), 2) + 'T' +
              padNumber(self.origDate.getUTCHours(), 2) + ':' +
              padNumber(self.origDate.getUTCMinutes(), 2) + ':' +
              padNumber(self.origDate.getUTCSeconds(), 2) + '.' +
              padNumber(self.origDate.getUTCMilliseconds(), 3) + 'Z'
      }
    }

    //hide all methods not implemented in this mock that the Date prototype exposes
    var unimplementedMethods = ['getUTCDay',
        'getYear', 'setDate', 'setFullYear', 'setHours', 'setMilliseconds',
        'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear',
        'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds',
        'setYear', 'toDateString', 'toGMTString', 'toJSON', 'toLocaleFormat', 'toLocaleString',
        'toLocaleTimeString', 'toSource', 'toString', 'toTimeString', 'toUTCString', 'valueOf'];

    angular.forEach(unimplementedMethods, function(methodName) {
      self[methodName] = function() {
        throw Error("Method '" + methodName + "' is not implemented in the TzDate mock");
      };
    });

    return self;
  };

  //make "tzDateInstance instanceof Date" return true
  angular.mock.TzDate.prototype = Date.prototype;
})();

/**
 * @ngdoc function
 * @name angular.mock.createMockWindow
 * @description
 *
 * Функция создает имитацию объекта window, полезную для управления доступом к setTimeout, но имитирование
 * раскрывает достаточные свойства window, чтобы позволить Angular работать.
 *
 * @example
 *
 * <pre>
    beforeEach(module(function($provide) {
      $provide.value('$window', window = angular.mock.createMockWindow());
    }));

    it('should do something', inject(function($window) {
      var val = null;
      $window.setTimeout(function() { val = 123; }, 10);
      expect(val).toEqual(null);
      window.setTimeout.expect(10).process();
      expect(val).toEqual(123);
    });
 * </pre>
 *
 */
angular.mock.createMockWindow = function() {
  var mockWindow = {};
  var setTimeoutQueue = [];

  mockWindow.document = window.document;
  mockWindow.getComputedStyle = angular.bind(window, window.getComputedStyle);
  mockWindow.scrollTo = angular.bind(window, window.scrollTo);
  mockWindow.navigator = window.navigator;
  mockWindow.setTimeout = function(fn, delay) {
    setTimeoutQueue.push({fn: fn, delay: delay});
  };
  mockWindow.setTimeout.queue = setTimeoutQueue;
  mockWindow.setTimeout.expect = function(delay) {
    if (setTimeoutQueue.length > 0) {
      return {
        process: function() {
          var tick = setTimeoutQueue.shift();
          expect(tick.delay).toEqual(delay);
          tick.fn();
        }
      };
    } else {
      expect('SetTimoutQueue empty. Expecting delay of ').toEqual(delay);
    }
  };

  return mockWindow;
};

/**
 * @ngdoc function
 * @name angular.mock.dump
 * @description
 * 
 * *Примечание*: это не экземпляр для внедрения зависимостей, только глобально доступная функция.
 * 
 * Метод для сериализации управляющих объектов Angular (области видимости, элементы, и т.д.) в строку, 
 * обычно используемый для отладки.
 * 
 * Этот метод также доступен для window, и может быть использован для отображения объекта в отладочной консоли.
 * 
 * @param {*} object - любой объект для преобразования в строку.
 * @return {string} сериализованная строка представляющая аргумент.
 */
angular.mock.dump = function(object) {
  return serialize(object);

  function serialize(object) {
    var out;

    if (angular.isElement(object)) {
      object = angular.element(object);
      out = angular.element('<div></div>');
      angular.forEach(object, function(element) {
        out.append(angular.element(element).clone());
      });
      out = out.html();
    } else if (angular.isArray(object)) {
      out = [];
      angular.forEach(object, function(o) {
        out.push(serialize(o));
      });
      out = '[ ' + out.join(', ') + ' ]';
    } else if (angular.isObject(object)) {
      if (angular.isFunction(object.$eval) && angular.isFunction(object.$apply)) {
        out = serializeScope(object);
      } else if (object instanceof Error) {
        out = object.stack || ('' + object.name + ': ' + object.message);
      } else {
        out = angular.toJson(object, true);
      }
    } else {
      out = String(object);
    }

    return out;
  }

  function serializeScope(scope, offset) {
    offset = offset ||  '  ';
    var log = [offset + 'Scope(' + scope.$id + '): {'];
    for ( var key in scope ) {
      if (scope.hasOwnProperty(key) && !key.match(/^(\$|this)/)) {
        log.push('  ' + key + ': ' + angular.toJson(scope[key]));
      }
    }
    var child = scope.$$childHead;
    while(child) {
      log.push(serializeScope(child, offset + '  '));
      child = child.$$nextSibling;
    }
    log.push('}');
    return log.join('\n' + offset);
  }
};

/**
 * @ngdoc object
 * @name ngMock.$httpBackend
 * @description
 * Имитация HTTP, подходящая для модульного тестирования приложения, использующего сервис {@link ng.$http $http}.
 * 
 * *Примечание*: Для имитации серверного HTTP для системного тестирования или разработчиков, не управляющих
 * серверной частью, см. {@link ngMockE2E.$httpBackend e2e имитация $httpBackend}.
 * 
 * Во время модульного тестирования мы хотим, чтобы наши тесты выполнялись быстро не имели внешних зависимостей, 
 * так что мы не хотим отравлять реальные запросы {@link https://developer.mozilla.org/en/xmlhttprequest XHR} или 
 * {@link http://en.wikipedia.org/wiki/JSONP JSONP} на реальный сервер. Все что нам реально нужно, 
 * это проверить, был ли определенный запрос отправлен, или нет, и в качестве альтернативы, мы даем приложению 
 * возможность делать запросы, на которые будет реагировать поддельный объект заранее определенными ответами, 
 * а мы сможем проверить утверждения в тестах.
 * 
 * Эта имитация может отвечать статическими или динамическими ответами, через `expect` и `when` api и других, 
 * удобных версий (`expectGET`, `whenPOST`, и т.д.).
 * 
 * Когда приложение Angular нуждается в каких-либо данных с сервера, вызывается сервис $http, который отправляет 
 * запрос на реальный сервер используя сервис $httpBackend. С внедрением зависимостей легко внедрить имитацию 
 * $httpBackend (который имеет тот же API что и $httpBackend) и использовать его для проверки запросов и ответов 
 * при тестировании данных, без отправки запроса на реальный сервер.
 * 
 * Существует два способа указать, какие данные должны быть возвращены как http ответы имитации, когда тестируемый 
 * код делает запросы:
 * 
 * - $httpBackend.expect – указывает ожидания для запроса
 * - $httpBackend.when – задает определение бэкенда
 * 
 * # Запрос ожиданий и бэкенд определений
 * 
 * Запрос ожиданий предоставляет способ сделать утверждения о созданных запросах, и определить ответы на эти 
 * запросы. Тест будет ошибочным, если ожидаемые запросы не сделаны, или сделаны в неправильном порядке.
 * 
 * Бэкенд определения позволяют вам определить поддельный бэкенд для вашего приложения, который не проверяет, 
 * сделан ли конкретный запрос или нет, а просто возвращает подготовленный ответ, если запрос был сделан. 
 * Во время прохождения теста, тест будет считать что данные получены и работать с ними.
 *
 * <table class="table">
 *   <tr><th width="220px"></th><th>Запрос ожиданий</th><th>Бэкенд определения</th></tr>
 *   <tr>
 *     <th>Синтаксис</th>
 *     <td>.expect(...).respond(...)</td>
 *     <td>.when(...).respond(...)</td>
 *   </tr>
 *   <tr>
 *     <th>Типичное использование</th>
 *     <td>строгие модульные тесты</td>
 *     <td>свободное (черный ящик) модульное тестирование</td>
 *   </tr>
 *   <tr>
 *     <th>Выполняет несколько запросов</th>
 *     <td>нет</td>
 *     <td>да</td>
 *   </tr>
 *   <tr>
 *     <th>Проверка порядка запросов</th>
 *     <td>да</td>
 *     <td>нет</td>
 *   </tr>
 *   <tr>
 *     <th>Обязательный запрос</th>
 *     <td>да</td>
 *     <td>нет</td>
 *   </tr>
 *   <tr>
 *     <th>Обязательный ответ</th>
 *     <td>не обязательно (см. ниже)</td>
 *     <td>да</td>
 *   </tr>
 * </table>
 *
 * В случаях когда оба, бэкенд определения и запроса ожидания указаны при выполнении теста, запрос ожиданий
 * выполняется в первую очередь.
 * 
 * Если для запроса ожиданий не имеет заданного ответа, то алгоритм будет искать бэкенд определение для этого 
 * запроса чтобы получить ответ.
 * 
 * Если запрос не находит ожидания ли если ожидание не имеет определенного ответа, бэкенд определения будут 
 * оцениваются все по очереди, чтобы увидеть, содержат ли они соответствующий запрос. Ответ из первого совпадающего
 * определения будет возвращен.
 * 
 * # Сброс HTTP запросов
 * 
 * Используемый в рабочей версии $httpBackend всегда отвечает на запросы асинхронно. Если мы оставим это 
 * поведение в тестовом варианте, то будем создавать тесты в асинхронной манере, которые трудно проводить, 
 * отслеживать и поддерживать. В то же время тестовая имитация, не должна отвечать синхронно, так как это
 * приведет к изменению тестируемого кода. По этой причине у поддельного объекта $httpBackend имеется метод 
 * `flush()`, который позволяет тесту явно сбрасывать результаты отложенных запросов, таким образом сохраняя
 * асинхронное API бэкенда, позволяя тесту выполняться синхронно.
 * 
 * # Модульное тестирование с имитацией $httpBackend
 *
 * <pre>
   // контроллер
   function MyController($scope, $http) {
     $http.get('/auth.py').success(function(data) {
       $scope.user = data;
     });

     this.saveMessage = function(message) {
       $scope.status = 'Saving...';
       $http.post('/add-msg.py', message).success(function(response) {
         $scope.status = '';
       }).error(function() {
         $scope.status = 'ERROR!';
       });
     };
   }

   // тестирование контроллера
   var $httpBackend;

   beforeEach(inject(function($injector) {
     $httpBackend = $injector.get('$httpBackend');

     // бэкенд определение для всех тестов
     $httpBackend.when('GET', '/auth.py').respond({userId: 'userX'}, {'A-Token': 'xxx'});
   }));


   afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });


   it('should fetch authentication token', function() {
     $httpBackend.expectGET('/auth.py');
     var controller = scope.$new(MyController);
     $httpBackend.flush();
   });


   it('should send msg to server', function() {
     // сейчас вы не заботитесь об аутентификации, но
     // контроллер по прежнему будет отправлять запрос и
     // $httpBackend будет отвечать, без необходимости
     // указывать ожидание и ответ для запроса
     $httpBackend.expectPOST('/add-msg.py', 'message content').respond(201, '');

     var controller = scope.$new(MyController);
     $httpBackend.flush();
     controller.saveMessage('message content');
     expect(controller.status).toBe('Saving...');
     $httpBackend.flush();
     expect(controller.status).toBe('');
   });


   it('should send auth header', function() {
     $httpBackend.expectPOST('/add-msg.py', undefined, function(headers) {
       // проверка, был ли отправлен заголовок, если не ожидается
       // тест закончится неудачно
       return headers['Authorization'] == 'xxx';
     }).respond(201, '');

     var controller = scope.$new(MyController);
     controller.saveMessage('whatever');
     $httpBackend.flush();
   });
   </pre>
 */
angular.mock.$HttpBackendProvider = function() {
  this.$get = ['$rootScope', createHttpBackendMock];
};

/**
 * General factory function for $httpBackend mock.
 * Returns instance for unit testing (when no arguments specified):
 *   - passing through is disabled
 *   - auto flushing is disabled
 *
 * Returns instance for e2e testing (when `$delegate` and `$browser` specified):
 *   - passing through (delegating request to real backend) is enabled
 *   - auto flushing is enabled
 *
 * @param {Object=} $delegate Real $httpBackend instance (allow passing through if specified)
 * @param {Object=} $browser Auto-flushing enabled if specified
 * @return {Object} Instance of $httpBackend mock
 */
function createHttpBackendMock($rootScope, $delegate, $browser) {
  var definitions = [],
      expectations = [],
      responses = [],
      responsesPush = angular.bind(responses, responses.push);

  function createResponse(status, data, headers) {
    if (angular.isFunction(status)) return status;

    return function() {
      return angular.isNumber(status)
          ? [status, data, headers]
          : [200, status, data];
    };
  }

  // TODO(vojta): change params to: method, url, data, headers, callback
  function $httpBackend(method, url, data, callback, headers) {
    var xhr = new MockXhr(),
        expectation = expectations[0],
        wasExpected = false;

    function prettyPrint(data) {
      return (angular.isString(data) || angular.isFunction(data) || data instanceof RegExp)
          ? data
          : angular.toJson(data);
    }

    if (expectation && expectation.match(method, url)) {
      if (!expectation.matchData(data))
        throw Error('Expected ' + expectation + ' with different data\n' +
            'EXPECTED: ' + prettyPrint(expectation.data) + '\nGOT:      ' + data);

      if (!expectation.matchHeaders(headers))
        throw Error('Expected ' + expectation + ' with different headers\n' +
            'EXPECTED: ' + prettyPrint(expectation.headers) + '\nGOT:      ' +
            prettyPrint(headers));

      expectations.shift();

      if (expectation.response) {
        responses.push(function() {
          var response = expectation.response(method, url, data, headers);
          xhr.$$respHeaders = response[2];
          callback(response[0], response[1], xhr.getAllResponseHeaders());
        });
        return;
      }
      wasExpected = true;
    }

    var i = -1, definition;
    while ((definition = definitions[++i])) {
      if (definition.match(method, url, data, headers || {})) {
        if (definition.response) {
          // if $browser specified, we do auto flush all requests
          ($browser ? $browser.defer : responsesPush)(function() {
            var response = definition.response(method, url, data, headers);
            xhr.$$respHeaders = response[2];
            callback(response[0], response[1], xhr.getAllResponseHeaders());
          });
        } else if (definition.passThrough) {
          $delegate(method, url, data, callback, headers);
        } else throw Error('No response defined !');
        return;
      }
    }
    throw wasExpected ?
        Error('No response defined !') :
        Error('Unexpected request: ' + method + ' ' + url + '\n' +
              (expectation ? 'Expected ' + expectation : 'No more request expected'));
  }

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#when
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое бэкенд определение.
   *
   * @param {string} method HTTP метод.
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP тело запроса.
   * @param {(Object|function(Object))=} headers HTTP заголовки или функция которая извлекает объект http 
   *  заголовков и возвращает true, если имеются в текущем определении.
   * @returns {requestHandler} Возвращает объект, который содержит метод `respond`, контролирующий как будет 
   *  обрабатываться совпадающий запрос.
   *
   *  - respond – `{function([status,] data[, headers])|function(function(method, url, data, headers)}`
   *    – Метод respond устанавливает статические данные которые должны возвращаться, или функцию которая 
   *    будет возвращать массив содержащий статус ответа (число), данные ответа (строка) и заголовки ответа (объект).
   */
  $httpBackend.when = function(method, url, data, headers) {
    var definition = new MockHttpExpectation(method, url, data, headers),
        chain = {
          respond: function(status, data, headers) {
            definition.response = createResponse(status, data, headers);
          }
        };

    if ($browser) {
      chain.passThrough = function() {
        definition.passThrough = true;
      };
    }

    definitions.push(definition);
    return chain;
  };

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenGET
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое бэкенд определение для запроса GET. Для большей информации смотрите `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(Object|function(Object))=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, который содержит метод `respond`, контролирующий как будет 
   * обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenHEAD
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое бэкенд определение для запроса HEAD. Для большей информации смотрите `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(Object|function(Object))=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, который содержит метод `respond`, контролирующий как будет 
   * обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenDELETE
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое бэкенд определение для запроса DELETE. Для большей информации смотрите `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(Object|function(Object))=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, который содержит метод `respond`, контролирующий как будет 
   * обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenPOST
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое бэкенд определение для запроса POST. Для большей информации смотрите `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP тело запроса.
   * @param {(Object|function(Object))=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, который содержит метод `respond`, контролирующий как будет 
   * обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenPUT
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое бэкенд определение для запроса PUT. Для большей информации смотрите `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP тело запроса.
   * @param {(Object|function(Object))=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, который содержит метод `respond`, контролирующий как будет 
   * обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#whenJSONP
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое бэкенд определение для запроса JSONP. Для большей информации смотрите `when()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @returns {requestHandler} Возвращает объект, который содержит метод `respond`, контролирующий как будет 
   * обрабатываться совпадающий запрос.
   */
  createShortMethods('when');


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expect
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новый ожидание для запроса.
   *
   * @param {string} method HTTP метод.
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP тело запроса.
   * @param {(Object|function(Object))=} headers HTTP заголовки или функция которая извлекает http заголовок и 
   *   возвращает true если заголовок найден в текущем ожидании.
   * @returns {requestHandler} Возвращает объект, который содержит метод `respond`, контролирующий как будет 
   *   обрабатываться совпадающий запрос.
   *
   *  - respond – `{function([status,] data[, headers])|function(function(method, url, data, headers)}`
   *    – Метод respond принимает набор статических данных которые будут возвращены, или функцию, которая может 
   *    возвращать массив, содержащий состояние ответа (число), данные ответа (строка) и заголовки ответа (объект).
   */
  $httpBackend.expect = function(method, url, data, headers) {
    var expectation = new MockHttpExpectation(method, url, data, headers);
    expectations.push(expectation);
    return {
      respond: function(status, data, headers) {
        expectation.response = createResponse(status, data, headers);
      }
    };
  };


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectGET
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое ожидание для запроса GET. См. так же `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {Object=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, содержащий метод `respond`, контролирующий как будет 
   *   обрабатываться совпадающий запрос. См. так же #expect.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectHEAD
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое ожидание для запроса HEAD. См. так же `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {Object=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, содержащий метод `respond`, контролирующий как будет 
   *   обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectDELETE
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое ожидание для запроса DELETE. См. так же `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {Object=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, содержащий метод `respond`, контролирующий как будет 
   *   обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectPOST
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое ожидание для запроса POST. См. так же `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP тело запроса.
   * @param {Object=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, содержащий метод `respond`, контролирующий как будет 
   *   обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectPUT
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое ожидание для запроса PUT. См. так же `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP тело запроса.
   * @param {Object=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, содержащий метод `respond`, контролирующий как будет 
   *   обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectPATCH
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое ожидание для запроса PATCH. См. так же `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @param {(string|RegExp)=} data HTTP тело запроса.
   * @param {Object=} headers HTTP заголовки.
   * @returns {requestHandler} Возвращает объект, содержащий метод `respond`, контролирующий как будет 
   *   обрабатываться совпадающий запрос.
   */

  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#expectJSONP
   * @methodOf ngMock.$httpBackend
   * @description
   * Создает новое ожидание для запроса JSONP. См. так же `expect()`.
   *
   * @param {string|RegExp} url HTTP url.
   * @returns {requestHandler} Возвращает объект, содержащий метод `respond`, контролирующий как будет 
   *   обрабатываться совпадающий запрос.
   */
  createShortMethods('expect');


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#flush
   * @methodOf ngMock.$httpBackend
   * @description
   * Сбрасывает все ожидающие запросы с использованием подготовленных ответов.
   *
   * @param {number=} count Количество ответов для сброса (в порядке их объявления). Если не определено, 
   *   все запросы будут разрешены. Если нет ожидающих запросов, тогда этот метод выбросит исключение (это 
   *   обычное соглашение при программировании).
   */
  $httpBackend.flush = function(count) {
    $rootScope.$digest();
    if (!responses.length) throw Error('No pending request to flush !');

    if (angular.isDefined(count)) {
      while (count--) {
        if (!responses.length) throw Error('No more pending request to flush !');
        responses.shift()();
      }
    } else {
      while (responses.length) {
        responses.shift()();
      }
    }
    $httpBackend.verifyNoOutstandingExpectation();
  };


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#verifyNoOutstandingExpectation
   * @methodOf ngMock.$httpBackend
   * @description
   * Проверяет, что все запросы, определенные с использование `expect` api, были сделаны. Если любой из запросов 
   * не был сделан, verifyNoOutstandingExpectation выбрасывает исключение.
   * 
   * Как правило, вы будете вызывать этот метод после каждого тестового случая, когда утверждение используется 
   * внутри блока «afterEach».
   *
   * <pre>
   *   afterEach($httpBackend.verifyExpectations);
   * </pre>
   */
  $httpBackend.verifyNoOutstandingExpectation = function() {
    $rootScope.$digest();
    if (expectations.length) {
      throw Error('Unsatisfied requests: ' + expectations.join(', '));
    }
  };


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#verifyNoOutstandingRequest
   * @methodOf ngMock.$httpBackend
   * @description
   * Проверяется что нет не сброшенных результатов запросов.
   * 
   * Как правило, вы будете вызывать этот метод после каждого тестового случая, когда утверждение используется 
   * внутри блока «afterEach».
   *
   * <pre>
   *   afterEach($httpBackend.verifyNoOutstandingRequest);
   * </pre>
   */
  $httpBackend.verifyNoOutstandingRequest = function() {
    if (responses.length) {
      throw Error('Unflushed requests: ' + responses.length);
    }
  };


  /**
   * @ngdoc method
   * @name ngMock.$httpBackend#resetExpectations
   * @methodOf ngMock.$httpBackend
   * @description
   * Сбрасывает все ожидания запросов, но сохраняет все бэкенд определения. Типично, вы можете вызывать метод
   * resetExpectations при выполнении много фазных тестов, когда вам нужно повторно использовать ту же
   * имитацию объекта $httpBackend.
   */
  $httpBackend.resetExpectations = function() {
    expectations.length = 0;
    responses.length = 0;
  };

  return $httpBackend;


  function createShortMethods(prefix) {
    angular.forEach(['GET', 'DELETE', 'JSONP'], function(method) {
     $httpBackend[prefix + method] = function(url, headers) {
       return $httpBackend[prefix](method, url, undefined, headers)
     }
    });

    angular.forEach(['PUT', 'POST', 'PATCH'], function(method) {
      $httpBackend[prefix + method] = function(url, data, headers) {
        return $httpBackend[prefix](method, url, data, headers)
      }
    });
  }
}

function MockHttpExpectation(method, url, data, headers) {

  this.data = data;
  this.headers = headers;

  this.match = function(m, u, d, h) {
    if (method != m) return false;
    if (!this.matchUrl(u)) return false;
    if (angular.isDefined(d) && !this.matchData(d)) return false;
    if (angular.isDefined(h) && !this.matchHeaders(h)) return false;
    return true;
  };

  this.matchUrl = function(u) {
    if (!url) return true;
    if (angular.isFunction(url.test)) return url.test(u);
    return url == u;
  };

  this.matchHeaders = function(h) {
    if (angular.isUndefined(headers)) return true;
    if (angular.isFunction(headers)) return headers(h);
    return angular.equals(headers, h);
  };

  this.matchData = function(d) {
    if (angular.isUndefined(data)) return true;
    if (data && angular.isFunction(data.test)) return data.test(d);
    if (data && !angular.isString(data)) return angular.toJson(data) == d;
    return data == d;
  };

  this.toString = function() {
    return method + ' ' + url;
  };
}

function MockXhr() {

  // hack for testing $http, $httpBackend
  MockXhr.$$lastInstance = this;

  this.open = function(method, url, async) {
    this.$$method = method;
    this.$$url = url;
    this.$$async = async;
    this.$$reqHeaders = {};
    this.$$respHeaders = {};
  };

  this.send = function(data) {
    this.$$data = data;
  };

  this.setRequestHeader = function(key, value) {
    this.$$reqHeaders[key] = value;
  };

  this.getResponseHeader = function(name) {
    // the lookup must be case insensitive, that's why we try two quick lookups and full scan at last
    var header = this.$$respHeaders[name];
    if (header) return header;

    name = angular.lowercase(name);
    header = this.$$respHeaders[name];
    if (header) return header;

    header = undefined;
    angular.forEach(this.$$respHeaders, function(headerVal, headerName) {
      if (!header && angular.lowercase(headerName) == name) header = headerVal;
    });
    return header;
  };

  this.getAllResponseHeaders = function() {
    var lines = [];

    angular.forEach(this.$$respHeaders, function(value, key) {
      lines.push(key + ': ' + value);
    });
    return lines.join('\n');
  };

  this.abort = angular.noop;
}


/**
 * @ngdoc function
 * @name ngMock.$timeout
 * @description
 *
 * Этот сервис простая декорация для сервиса {@link ng.$timeout $timeout}
 * с добавлением методов «flush» и «verifyNoPendingTasks».
 */ 

angular.mock.$TimeoutDecorator = function($delegate, $browser) {

  /**
   * @ngdoc method
   * @name ngMock.$timeout#flush
   * @methodOf ngMock.$timeout
   * @description
   *
   * Сбрасывает очередь незаконченных задач.
   */
  $delegate.flush = function() {
    $browser.defer.flush();
  };

  /**
   * @ngdoc method
   * @name ngMock.$timeout#verifyNoPendingTasks
   * @methodOf ngMock.$timeout
   * @description
   *
   * Проверяет, что остались задачи, нуждающиеся в сбросе.
   */
  $delegate.verifyNoPendingTasks = function() {
    if ($browser.deferredFns.length) {
      throw Error('Deferred tasks to flush (' + $browser.deferredFns.length + '): ' +
          formatPendingTasksAsString($browser.deferredFns));
    }
  };

  function formatPendingTasksAsString(tasks) {
    var result = [];
    angular.forEach(tasks, function(task) {
      result.push('{id: ' + task.id + ', ' + 'time: ' + task.time + '}');
    });

    return result.join(', ');
  }

  return $delegate;
};

/**
 *
 */
angular.mock.$RootElementProvider = function() {
  this.$get = function() {
    return angular.element('<div ng-app></div>');
  }
};

/**
 * @ngdoc overview
 * @name ngMock
 * @description
 *
 * `ngMock` это модуль Angular, который используется совместно с модулем `ng` для добавлнения конфигурации
 * модульного тестирования, а за одно полезной имитации в {@link AUTO.$injector $injector}.
 */
angular.module('ngMock', ['ng']).provider({
  $browser: angular.mock.$BrowserProvider,
  $exceptionHandler: angular.mock.$ExceptionHandlerProvider,
  $log: angular.mock.$LogProvider,
  $httpBackend: angular.mock.$HttpBackendProvider,
  $rootElement: angular.mock.$RootElementProvider
}).config(function($provide) {
  $provide.decorator('$timeout', angular.mock.$TimeoutDecorator);
});

/**
 * @ngdoc overview
 * @name ngMockE2E
 * @description
 *
 * `ngMockE2E` это модуль Angular, содержащий имитации, полезные для системного тестирования.
 * В настоящее время этот модуль содержит только одну имитацию - имитацию
 * {@link ngMockE2E.$httpBackend e2e $httpBackend}.
 */
angular.module('ngMockE2E', ['ng']).config(function($provide) {
  $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
});

/**
 * @ngdoc object
 * @name ngMockE2E.$httpBackend
 * @description
 * Имитация реализации HTTP бэкенда подходящая для системного тестирования или для разработки приложений без
 * бэкенда, которые используют сервис {@link ng.$http $http}.
 *
 * *Примечание*: Для имитации реализации http бэкенда в целях модульного тестирования, пожалуйста, смотрите
 * {@link ngMock.$httpBackend имитацию $httpBackend для модульных тестов}.
 *
 * Эта реализация может использоваться для статических или динамических ответов с использованием `when` api или
 * его коротких записей (`whenGET`, `whenPOST`, и т.д.) и необязательно отправляет запросы через реальный 
 * $httpBackend для определенных запросов (например, для взаимодействия с некоторыми удаленными сервисами или 
 * для получения шаблонов с сервера).
 * 
 * Как и в модульном тестировании, в сценариях системного тестирования, или в сценариях, когда приложение 
 * будет разрабатываться, с реальным серверным api заменяемого на имитацию, но часто возникает необходимости 
 * обойти имитацию, и осуществить запрос к реальному серверу (например, для получения шаблонов или статических 
 * файлов от сервера). Чтобы настроить такое поведение используйте `passThrough` обработчик запроса для `when`
 * вместо `respond`.
 * 
 * К тому же, мы не хотим вручную сбрасывать результаты выполнения запросов потребителям, как мы это делали при 
 * модульном тестировании. По этой причине e2e $httpBackend автоматически сбрасывает значения из имитации, 
 * закрывая симуляцию поведения объекта XMLHttpRequest.
 * 
 * Чтобы настроить приложение на запуск с http взаимодействием, вам нужно создать модуль зависимый от `ngMockE2E`
 * и модулей вашего приложения и определить имитацию:
 * 
 * <pre>
 *   myAppDev = angular.module('myAppDev', ['myApp', 'ngMockE2E']);
 *   myAppDev.run(function($httpBackend) {
 *     phones = [{name: 'phone1'}, {name: 'phone2'}];
 *
 *     // возвращает текущий список телефонов
 *     $httpBackend.whenGET('/phones').respond(phones);
 *
 *     // добавляет новый телефон в массив телефонов
 *     $httpBackend.whenPOST('/phones').respond(function(method, url, data) {
 *       phones.push(angular.fromJSON(data));
 *     });
 *     $httpBackend.whenGET(/^\/templates\//).passThrough();
 *     //...
 *   });
 * </pre>
 *
 * После этого, начните загрузку приложения с этого модуля.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#when
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Создает новое определение бэкенда.
 *
 * @param {string} method HTTP метод.
 * @param {string|RegExp} url HTTP url.
 * @param {(string|RegExp)=} data тело HTTP запроса.
 * @param {(Object|function(Object))=} headers HTTP заголовки или функция извлекающая объект из http заголовков 
 *   и возвращающая true, если заголовки найдены в текущем определении.
 * @returns {requestHandler} Возвращает объект, содержащий методы `respond` и `passThrough`, которые контролируют
 *   как обрабатываются совпадающие запросы.
 *
 *  - respond – `{function([status,] data[, headers])|function(function(method, url, data, headers)}`
 *    – Этот метод устанавливает статические данные для возврата или функцию, которая будет возвращать массив, 
 *    содержащий статус ответа (число), данные ответа (строка) и заголовки ответа (объект).
 *  - passThrough – `{function()}` – Любой запрос, который совпадает с определенным ожиданием в обработчике 
 *    `passThrough`, будет проходить через реальный бэкенд (и XHR запрос будет отправлен на сервер).
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenGET
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Создает новое определение бэкенда для запросов GET. См. так же `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(Object|function(Object))=} headers HTTP заголовки.
 * @returns {requestHandler} Возвращает объект, содержащий методы `respond` и `passThrough`, которые контролируют 
 *   как обрабатываются совпадающие запросы.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenHEAD
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Создает новое определение бэкенда для запросов HEAD. См. так же `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(Object|function(Object))=} headers HTTP заголовки.
 * @returns {requestHandler} Возвращает объект, содержащий методы `respond` и `passThrough`, которые контролируют 
 *   как обрабатываются совпадающие запросы.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenDELETE
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Создает новое определение бэкенда для запросов DELETE. См. так же `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(Object|function(Object))=} headers HTTP заголовки.
 * @returns {requestHandler} Возвращает объект, содержащий методы `respond` и `passThrough`, которые контролируют 
 *   как обрабатываются совпадающие запросы.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenPOST
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Создает новое определение бэкенда для запросов POST. См. так же `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(string|RegExp)=} data тело HTTP запроса.
 * @param {(Object|function(Object))=} headers HTTP заголовки.
 * @returns {requestHandler} Возвращает объект, содержащий методы `respond` и `passThrough`, которые контролируют 
 *   как обрабатываются совпадающие запросы.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenPUT
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Создает новое определение бэкенда для запросов PUT. См. так же `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(string|RegExp)=} data тело HTTP запроса.
 * @param {(Object|function(Object))=} headers HTTP заголовки.
 * @returns {requestHandler} Возвращает объект, содержащий методы `respond` и `passThrough`, которые контролируют 
 *   как обрабатываются совпадающие запросы.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenPATCH
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Создает новое определение бэкенда для запросов PATCH. См. так же `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @param {(string|RegExp)=} data тело HTTP запроса.
 * @param {(Object|function(Object))=} headers HTTP заголовки.
 * @returns {requestHandler} Возвращает объект, содержащий методы `respond` и `passThrough`, которые контролируют 
 *   как обрабатываются совпадающие запросы.
 */

/**
 * @ngdoc method
 * @name ngMockE2E.$httpBackend#whenJSONP
 * @methodOf ngMockE2E.$httpBackend
 * @description
 * Создает новое определение бэкенда для запросов JSONP. См. так же `when()`.
 *
 * @param {string|RegExp} url HTTP url.
 * @returns {requestHandler} Возвращает объект, содержащий методы `respond` и `passThrough`, которые контролируют 
 *   как обрабатываются совпадающие запросы.
 */
angular.mock.e2e = {};
angular.mock.e2e.$httpBackendDecorator = ['$rootScope', '$delegate', '$browser', createHttpBackendMock];


angular.mock.clearDataCache = function() {
  var key,
      cache = angular.element.cache;

  for(key in cache) {
    if (cache.hasOwnProperty(key)) {
      var handle = cache[key].handle;

      handle && angular.element(handle.elem).unbind();
      delete cache[key];
    }
  }
};


window.jstestdriver && (function(window) {
  /**
   * Global method to output any number of objects into JSTD console. Useful for debugging.
   */
  window.dump = function() {
    var args = [];
    angular.forEach(arguments, function(arg) {
      args.push(angular.mock.dump(arg));
    });
    jstestdriver.console.log.apply(jstestdriver.console, args);
    if (window.console) {
      window.console.log.apply(window.console, args);
    }
  };
})(window);


(window.jasmine || window.mocha) && (function(window) {

  var currentSpec = null;

  beforeEach(function() {
    currentSpec = this;
  });

  afterEach(function() {
    var injector = currentSpec.$injector;

    currentSpec.$injector = null;
    currentSpec.$modules = null;
    currentSpec = null;

    if (injector) {
      injector.get('$rootElement').unbind();
      injector.get('$browser').pollFns.length = 0;
    }

    angular.mock.clearDataCache();

    // clean up jquery's fragment cache
    angular.forEach(angular.element.fragments, function(val, key) {
      delete angular.element.fragments[key];
    });

    MockXhr.$$lastInstance = null;

    angular.forEach(angular.callbacks, function(val, key) {
      delete angular.callbacks[key];
    });
    angular.callbacks.counter = 0;
  });

  function isSpecRunning() {
    return currentSpec && (window.mocha || currentSpec.queue.running);
  }

  /**
   * @ngdoc function
   * @name angular.mock.module
   * @description
   *
   * *Примечание*: Эта функция также опубликован в window для быстрого доступа.<br>
   *
   * Эта функция регистрирует код конфигурации модуля. Она собирает информацию о конфигурации, которая будет 
   * использоваться, при создании инжектора с помощью {@ ссылка angular.mock.inject inject}.
   *
   * См. {@link angular.mock.inject inject} для примера использования
   *
   * @param {...(string|Function)} fns любое количество модулей, которые представлены в виде строки псевдонимов
   *        или как анонимные функции инициализации модуля. Модули используются для настройки инжектора. «ng» и 
   *        «ngMock» модули загружаются автоматически.
   */
  window.module = angular.mock.module = function() {
    var moduleFns = Array.prototype.slice.call(arguments, 0);
    return isSpecRunning() ? workFn() : workFn;
    /////////////////////
    function workFn() {
      if (currentSpec.$injector) {
        throw Error('Injector already created, can not register a module!');
      } else {
        var modules = currentSpec.$modules || (currentSpec.$modules = []);
        angular.forEach(moduleFns, function(module) {
          modules.push(module);
        });
      }
    }
  };

  /**
   * @ngdoc function
   * @name angular.mock.inject
   * @description
   *
   * *Примечание*: Эта функция также опубликован в window для быстрого доступа.<br>
   *
   * Вводит функцию обертывания функции в инъекционной функции. inject() создает новый экземпляр
   * {@link AUTO.$injector $injector} на тест, который затем используется для разрешения ссылок.
   *
   * См. так же {@link angular.mock.module module}
   *
   * Пример того, как типичные jasmine-тесты выглядят с методом inject.
   * <pre>
   *
   *   angular.module('myApplicationModule', [])
   *       .value('mode', 'app')
   *       .value('version', 'v1.0.1');
   *
   *
   *   describe('MyApp', function() {
   *
   *     // необходимо загрузить модули, которые нужны для тестов,
   *     // у нас загружается только модуль «ng» по умолчанию.
   *     beforeEach(module('myApplicationModule'));
   *
   *
   *     // inject() используется для внедрения аргументов всех вычисляемых функций
   *     it('should provide a version', inject(function(mode, version) {
   *       expect(version).toEqual('v1.0.1');
   *       expect(mode).toEqual('app');
   *     }));
   *
   *
   *     // Методы inject и module могут так же использоваться внутри этого или beforeEach
   *     it('should override a version and test the new version is injected', function() {
   *       // module() принимает функции или строки (псевдонимы модулей)
   *       module(function($provide) {
   *         $provide.value('version', 'overridden'); // override version here
   *       });
   *
   *       inject(function(version) {
   *         expect(version).toEqual('overridden');
   *       });
   *     ));
   *   });
   *
   * </pre>
   *
   * @param {...Function} fns любое количество функций, которые будут внедрены с использованием инжектора.
   */
  window.inject = angular.mock.inject = function() {
    var blockFns = Array.prototype.slice.call(arguments, 0);
    var errorForStack = new Error('Declaration Location');
    return isSpecRunning() ? workFn() : workFn;
    /////////////////////
    function workFn() {
      var modules = currentSpec.$modules || [];

      modules.unshift('ngMock');
      modules.unshift('ng');
      var injector = currentSpec.$injector;
      if (!injector) {
        injector = currentSpec.$injector = angular.injector(modules);
      }
      for(var i = 0, ii = blockFns.length; i < ii; i++) {
        try {
          injector.invoke(blockFns[i] || angular.noop, this);
        } catch (e) {
          if(e.stack && errorForStack) e.stack +=  '\n' + errorForStack.stack;
          throw e;
        } finally {
          errorForStack = null;
        }
      }
    }
  };
})(window);
