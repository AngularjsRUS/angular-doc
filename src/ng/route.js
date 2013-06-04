'use strict';


/**
 * @ngdoc object
 * @name ng.$routeProvider
 * @function
 *
 * @description
 *
 * Используется для настройки маршрутов. См. {@link ng.$route $route} для примера.
 */
function $RouteProvider(){
  var routes = {};

  /**
   * @ngdoc method
   * @name ng.$routeProvider#when
   * @methodOf ng.$routeProvider
   *
   * @param {string} path Маршрут пути (сравните с `$location.path`). Если в `$location.path` содержится 
   *    избыточная косая черта или, напротив, отсутствует, маршрут будет по-прежнему корректным и 
   *    `$location.path` будет обновлен, чтобы добавить или удалить косую черту и в точности соответствовать 
   *    определению маршрута.
   * 
   *      * `path` может содержать участки, начинающитеся с двоеточия (`:name`). Все символы до следующего 
   *        слэша изымаются и хранятся в `$routeParams` со значением из `name`, определяющим маршрут.
   *      * `path` может содержать участки, начинающитеся со звездочки (`*name`). Все символы вместе со слешами
   *        храниться в `$routeParams` со значением из `name`, определяющим маршрут.
   *
   *    Например, такие маршруты как `/color/:color/largecode/*largecode/edit` будут заменены на
   *    `/color/brown/largecode/code/with/slashs/edit` и извлечены:
   *
   *      * `color: brown`
   *      * `largecode: code/with/slashs`.
   *
   *
   * @param {Object} route Собранная информация, которая будет сопоставлена `$route.current` в сравнимом маршруте
   *
   *    Свойства объекта:
   *
   *    - `controller` – `{(string|function()=}` – Контроллер, который должен быть связан созданной
   *      областью видимости или именем {@link angular.Module#controller registered controller}, если
   *      передается в виде строки.
   *    - `controllerAs` – `{string=}` – Псевдоним контроллера. Если задан, то контроллер будет доступен
   *      в области видимости под именем `controllerAs`.
   *    - `template` – `{string=|function()=}` – HTML шаблон в виде строки или функция, которая возвращает
   *      строку с HTML шаблоном, которая должна быть использована директивами {@link ng.directive:ngView ngView} 
   *      или {@link ng.directive:ngInclude ngInclude}. Это свойство имеет приоритет над `templateUrl`.
   *
   *      Если `template` функция, то она будет вызвана со следующими параметрами:
   *
   *      - `{Array.<Object>}` - параметры маршрута, извлеченные из текущего
   *        `$location.path()` применяющиеся в текущем маршруте.
   *
   *    - `templateUrl` – `{string=|function()=}` – путь или функция, возвращающая путь до html-шаблона
   *      который должен использоваться в {@link ng.directive:ngView ngView}.
   *
   *      Если `templateUrl` функция, она будет вызвана со следующими параметрами:
   *
   *      - `{Array.<Object>}` - параметры маршрута, извлеченные из текущего
   *        `$location.path()` применяющиеся в текущем маршруте.
   *
   *    - `resolve` - `{Object.<string, function>=}` - Необязательный набор зависимостей, которые должны
   *      быть внедрены в контроллер. Если любая из этих зависимостей является обещанием, они будут
   *      приняты и преобразованы в значение перед тем как создастся экземпляр контроллера и создается и
   *      событие `$routeChangeSuccess` будет сброшено. Объект набора представляет собой:
   *
   *      - `key` – `{string}`: имя зависимости, которая будет внедрена в контроллер.
   *      - `factory` - `{string|function}`: Если это строка то это псевдоним сервиса.
   *        Если же это функция, то она {@link api/AUTO.$injector#invoke внедряется}
   *        и возвращает значение, обрабатывающееся как зависимость. Если результат является обещанием, он принимается
   *        до внедрения значения в контроллер.
   *
   *    - `redirectTo` – {(string|function())=} – значение для обновления пути
   *      {@link ng.$location $location} с триггером перенаправления маршрута.
   *
   *      Если `redirectTo` функция, то она будет вызвана со следующими параметрами:
   *
   *      - `{Object.<string>}` - параметры маршрута, извлеченные из текущего
   *        `$location.path()` с помощью применения templateUrl текущего маршрута.
   *      - `{string}` - текущий `$location.path()`
   *      - `{Object}` - текущий `$location.search()`
   *
   *      Обычно ожидается, что функция `redirectTo` возвратит строку, которая будет использована
   *      для обновления `$location.path()` и `$location.search()`.
   *
   *    - `[reloadOnSearch=true]` - {boolean=} - перезагрузка маршрута только после изменения $location.search().
   *
   *      Если свойство установлено в `false` и url в браузере изменился, то
   *      событие `$routeUpdate` распространяется в корневую область видимости.
   *
   *    - `[caseInsensitiveMatch=false]` - {boolean=} - соответствует маршрутам без учета регистра
   *
   *      Если установлено в `true`, то маршрут может быть сопоставлен без учета регистра.
   * 
   *
   * @returns {Object} саму себя
   *
   * @description
   * Добавляет новое определение маршрута в сервис `$route`.
   */
  this.when = function(path, route) {
    routes[path] = extend({reloadOnSearch: true, caseInsensitiveMatch: false}, route);

    // create redirection for trailing slashes
    if (path) {
      var redirectPath = (path[path.length-1] == '/')
          ? path.substr(0, path.length-1)
          : path +'/';

      routes[redirectPath] = {redirectTo: path};
    }

    return this;
  };

  /**
   * @ngdoc method
   * @name ng.$routeProvider#otherwise
   * @methodOf ng.$routeProvider
   *
   * @description
   * Устанавливает определение маршрута, которое будет использоваться при изменении маршрута, когда никаких
   * других совпадений не найдено.
   *
   * @param {Object} params Составленая информация, которая будет присвоена `$route.current`.
   * @returns {Object} саму себя
   */
  this.otherwise = function(params) {
    this.when(null, params);
    return this;
  };


  this.$get = ['$rootScope', '$location', '$routeParams', '$q', '$injector', '$http', '$templateCache',
      function( $rootScope,   $location,   $routeParams,   $q,   $injector,   $http,   $templateCache) {

    /**
     * @ngdoc object
     * @name ng.$route
     * @requires $location
     * @requires $routeParams
     *
     * @property {Object} current Reference to the current route definition.
     * The route definition contains:
     *
     *   - `controller`: The controller constructor as define in route definition.
     *   - `locals`: A map of locals which is used by {@link ng.$controller $controller} service for
     *     controller instantiation. The `locals` contain
     *     the resolved values of the `resolve` map. Additionally the `locals` also contain:
     *
     *     - `$scope` - The current route scope.
     *     - `$template` - The current route template HTML.
     *
     * @property {Array.<Object>} routes Array of all configured routes.
     *
     * @description
     * Используется для внешнего связывания URL с контроллерами и представлениями (HTML частичками). 
     * Он отслеживает изменения `$location.url()` и пытается по карте путей найти для него существующее 
     * определение.
     * 
     * Можно определить маршруты через {@link ng.$routeProvider $routeProvider} API.
     * 
     * Сервис `$route` обычно используется совместно с директивой {@link ng.directive:ngView ngView}
     * и сервисом {@link ng.$routeParams $routeParams}
     *
     * @example
       Этот пример показывает как в случае изменения хэша URL сервис $route находит маршрут следующего URL, 
       и ngView получает свое представление.
       
       Заметьте, что этот пример использует {@link ng.directive:script строковые шаблоны}, 
       это сделано для чтобы получить его в процессе работы.

     <example module="ngView">
       <file name="index.html">
         <div ng-controller="MainCntl">
           Choose:
           <a href="Book/Moby">Moby</a> |
           <a href="Book/Moby/ch/1">Moby: Ch1</a> |
           <a href="Book/Gatsby">Gatsby</a> |
           <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
           <a href="Book/Scarlet">Scarlet Letter</a><br/>

           <div ng-view></div>
           <hr />

           <pre>$location.path() = {{$location.path()}}</pre>
           <pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>
           <pre>$route.current.params = {{$route.current.params}}</pre>
           <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
           <pre>$routeParams = {{$routeParams}}</pre>
         </div>
       </file>

       <file name="book.html">
         controller: {{name}}<br />
         Book Id: {{params.bookId}}<br />
       </file>

       <file name="chapter.html">
         controller: {{name}}<br />
         Book Id: {{params.bookId}}<br />
         Chapter Id: {{params.chapterId}}
       </file>

       <file name="script.js">
         angular.module('ngView', [], function($routeProvider, $locationProvider) {
           $routeProvider.when('/Book/:bookId', {
             templateUrl: 'book.html',
             controller: BookCntl,
             resolve: {
               // I will cause a 1 second delay
               delay: function($q, $timeout) {
                 var delay = $q.defer();
                 $timeout(delay.resolve, 1000);
                 return delay.promise;
               }
             }
           });
           $routeProvider.when('/Book/:bookId/ch/:chapterId', {
             templateUrl: 'chapter.html',
             controller: ChapterCntl
           });

           // configure html5 to get links working on jsfiddle
           $locationProvider.html5Mode(true);
         });

         function MainCntl($scope, $route, $routeParams, $location) {
           $scope.$route = $route;
           $scope.$location = $location;
           $scope.$routeParams = $routeParams;
         }

         function BookCntl($scope, $routeParams) {
           $scope.name = "BookCntl";
           $scope.params = $routeParams;
         }

         function ChapterCntl($scope, $routeParams) {
           $scope.name = "ChapterCntl";
           $scope.params = $routeParams;
         }
       </file>

       <file name="scenario.js">
         it('should load and compile correct template', function() {
           element('a:contains("Moby: Ch1")').click();
           var content = element('.doc-example-live [ng-view]').text();
           expect(content).toMatch(/controller\: ChapterCntl/);
           expect(content).toMatch(/Book Id\: Moby/);
           expect(content).toMatch(/Chapter Id\: 1/);

           element('a:contains("Scarlet")').click();
           sleep(2); // promises are not part of scenario waiting
           content = element('.doc-example-live [ng-view]').text();
           expect(content).toMatch(/controller\: BookCntl/);
           expect(content).toMatch(/Book Id\: Scarlet/);
         });
       </file>
     </example>
     */

    /**
     * @ngdoc event
     * @name ng.$route#$routeChangeStart
     * @eventOf ng.$route
     * @eventType broadcast on root scope
     * @description
     * Транслируется перед изменением маршрута. В этой точке сервис route начинает разрешение всех требуемых 
     * зависимостей, нужных для изменения маршрута. Обычно это включает извлечение шаблона представления, 
     * так и любых других зависимостей, определенных в свойстве маршрута `resolve`. После того как все зависимости 
     * будут разрешены, генерируется событие `$routeChangeSuccess`.
     *
     * @param {Route} next Информация о маршруте для перехода.
     * @param {Route} current Информация о текущем маршруте.
     */

    /**
     * @ngdoc event
     * @name ng.$route#$routeChangeSuccess
     * @eventOf ng.$route
     * @eventType broadcast on root scope
     * @description
     * Транслируется когда все зависимости маршрута будут разрешены. {@link ng.directive:ngView ngView} 
     * слушает его для директив чтобы создать контроллер и отобразить представление.
     *
     * @param {Object} angularEvent Синтезированный объект события.
     * @param {Route} current Информация о текущем маршруте.
     * @param {Route|Undefined} previous Информация о предыдущем маршруте, или undefined, если текущий маршрут первый.
     */

    /**
     * @ngdoc event
     * @name ng.$route#$routeChangeError
     * @eventOf ng.$route
     * @eventType broadcast on root scope
     * @description
     * Транслируется, если любое из принятых обещаний было отклонено.
     *
     * @param {Route} current Информация о текущем маршруте.
     * @param {Route} previous Информация о предыдущем маршруте.
     * @param {Route} rejection Отвергнуто ли обещание. Обычно ошибка или испорченное обещание.
     */

    /**
     * @ngdoc event
     * @name ng.$route#$routeUpdate
     * @eventOf ng.$route
     * @eventType broadcast on root scope
     * @description
     *
     * Транслируется когда свойство `reloadOnSearch` установлено в false, и мы повторно
     * используем тот же экземпляр контроллера.
     */

    var forceReload = false,
        $route = {
          routes: routes,

          /**
           * @ngdoc method
           * @name ng.$route#reload
           * @methodOf ng.$route
           *
           * @description
           * Пытается перезагрузить текущий маршрут, если {@link ng.$location $location} не изменен.
           *
           * Как результат {@link ng.directive:ngView ngView} создает новую область видимости, 
           * и пересоздается контроллер.
           */
          reload: function() {
            forceReload = true;
            $rootScope.$evalAsync(updateRoute);
          }
        };

    $rootScope.$on('$locationChangeSuccess', updateRoute);

    return $route;

    /////////////////////////////////////////////////////

    /**
     * @param on {string} current url
     * @param when {string} route when template to match the url against
     * @param whenProperties {Object} properties to define when's matching behavior
     * @return {?Object}
     */
    function switchRouteMatcher(on, when, whenProperties) {
      // TODO(i): this code is convoluted and inefficient, we should construct the route matching
      //   regex only once and then reuse it

      // Escape regexp special characters.
      when = '^' + when.replace(/[-\/\\^$:*+?.()|[\]{}]/g, "\\$&") + '$';

      var regex = '',
          params = [],
          dst = {};

      var re = /\\([:*])(\w+)/g,
          paramMatch,
          lastMatchedIndex = 0;

      while ((paramMatch = re.exec(when)) !== null) {
        // Find each :param in `when` and replace it with a capturing group.
        // Append all other sections of when unchanged.
        regex += when.slice(lastMatchedIndex, paramMatch.index);
        switch(paramMatch[1]) {
          case ':':
            regex += '([^\\/]*)';
            break;
          case '*':
            regex += '(.*)';
            break;
        }
        params.push(paramMatch[2]);
        lastMatchedIndex = re.lastIndex;
      }
      // Append trailing path part.
      regex += when.substr(lastMatchedIndex);

      var match = on.match(new RegExp(regex, whenProperties.caseInsensitiveMatch ? 'i' : ''));
      if (match) {
        forEach(params, function(name, index) {
          dst[name] = match[index + 1];
        });
      }
      return match ? dst : null;
    }

    function updateRoute() {
      var next = parseRoute(),
          last = $route.current;

      if (next && last && next.$$route === last.$$route
          && equals(next.pathParams, last.pathParams) && !next.reloadOnSearch && !forceReload) {
        last.params = next.params;
        copy(last.params, $routeParams);
        $rootScope.$broadcast('$routeUpdate', last);
      } else if (next || last) {
        forceReload = false;
        $rootScope.$broadcast('$routeChangeStart', next, last);
        $route.current = next;
        if (next) {
          if (next.redirectTo) {
            if (isString(next.redirectTo)) {
              $location.path(interpolate(next.redirectTo, next.params)).search(next.params)
                       .replace();
            } else {
              $location.url(next.redirectTo(next.pathParams, $location.path(), $location.search()))
                       .replace();
            }
          }
        }

        $q.when(next).
          then(function() {
            if (next) {
              var locals = extend({}, next.resolve),
                  template;

              forEach(locals, function(value, key) {
                locals[key] = isString(value) ? $injector.get(value) : $injector.invoke(value);
              });

              if (isDefined(template = next.template)) {
                if (isFunction(template)) {
                  template = template(next.params);
                }
              } else if (isDefined(template = next.templateUrl)) {
                if (isFunction(template)) {
                  template = template(next.params);
                }
                if (isDefined(template)) {
                  next.loadedTemplateUrl = template;
                  template = $http.get(template, {cache: $templateCache}).
                      then(function(response) { return response.data; });
                }
              }
              if (isDefined(template)) {
                locals['$template'] = template;
              }
              return $q.all(locals);
            }
          }).
          // after route change
          then(function(locals) {
            if (next == $route.current) {
              if (next) {
                next.locals = locals;
                copy(next.params, $routeParams);
              }
              $rootScope.$broadcast('$routeChangeSuccess', next, last);
            }
          }, function(error) {
            if (next == $route.current) {
              $rootScope.$broadcast('$routeChangeError', next, last, error);
            }
          });
      }
    }


    /**
     * @returns the current active route, by matching it against the URL
     */
    function parseRoute() {
      // Match a route
      var params, match;
      forEach(routes, function(route, path) {
        if (!match && (params = switchRouteMatcher($location.path(), path, route))) {
          match = inherit(route, {
            params: extend({}, $location.search(), params),
            pathParams: params});
          match.$$route = route;
        }
      });
      // No route matched; fallback to "otherwise" route
      return match || routes[null] && inherit(routes[null], {params: {}, pathParams:{}});
    }

    /**
     * @returns interpolation of the redirect path with the parameters
     */
    function interpolate(string, params) {
      var result = [];
      forEach((string||'').split(':'), function(segment, i) {
        if (i == 0) {
          result.push(segment);
        } else {
          var segmentMatch = segment.match(/(\w+)(.*)/);
          var key = segmentMatch[1];
          result.push(params[key]);
          result.push(segmentMatch[2] || '');
          delete params[key];
        }
      });
      return result.join('');
    }
  }];
}
