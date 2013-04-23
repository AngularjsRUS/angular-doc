![AngularJS](http://angularjs.org/img/AngularJS-large.png)

Русская документация по AngularJS

Есть что добавить (важно)
---------

Если у вас есть идеи или вы хотите посодействовать **не стесняйтесь**
пишите в `issue` или на почту!

Что переводить?
---------
Основные файлы для перевода находятся тут `docs/content/<раздел>/<файл>.ngdoc`.
Формат `ngdoc` - это расширенный `markdown`.

Все что требует перевода нужно переводить :)

Перевод есть но не добавлен в файлы 'ngdoc'
---------
Для некоторых страниц уже есть перевод (**Все благодарности** за перевод [tamtakoe](https://github.com/tamtakoe)!), но он не в формате `ngdoc`!
Находится он [тут](https://github.com/maksimr/docs.angularjs.ru/wiki). Смело можно брать и переносить его в
файлы `ngdoc`.

Так же там есть описание, как переводить те или иные слова в тексте.

Соглашение по оформлению сообщений для commit'ов и pull request'ов
---------
Для официального репозитория AngularJS есть соглашение по
оформлению сообщений для commit'ов и pull-request'ов.

Сообщение должно выглядеть следующим образом

    <тип>(<Что меняли>): <сообщение>

В оригинале типов восемь, для перевода предлагаю добавить девятый тип `translate`:

* feat
* fix
* docs
* style
* refactor
* test
* chore
* revert
* **translate**

Пример сообщения:

    translate(guide:bootstrap): Добавил перевод раздела Обзор

Можно просто (???)

    translate(guide:bootstrap): Добавил перевод


Как происходит сборка AngularJS
---------
После добавления изменений в основной репозиторий
автоматически запускается сборка сайта на `cloudbees`.
Сборка занимает порядка 1 - 2 минут.

Изменения можно будет посмотреть [тут](http://doc.angularjs.cloudbees.net).
Сейчас это не production host!

Сборка AngularJS локально
---------
[После того как настроили среду](http://docs.angularjs.org/misc/contribute) запустите команду:

    grunt package

Ссылки
---------

* Русский сайт: http://doc.angularjs.cloudbees.net/index.html
* Учебник: http://doc.angularjs.cloudbees.net/tutorial

* Web site: http://angularjs.org
* Tutorial: http://docs.angularjs.org/tutorial
* API Docs: http://docs.angularjs.org/api
* Developer Guide: http://docs.angularjs.org/guide
* Contribution guidelines: http://docs.angularjs.org/misc/contribute

Участники
---------

+ [tamtakoe](https://github.com/tamtakoe)
+ [maksimr](https://github.com/maksimr)

### Continuous Integration

CloudBees have provided a CI/deployment setup:


If you run this, you will get a cloned version of this repo to start working on in a private git repo,
along with a CI service (in Jenkins) hosted that will run unit and end to end tests in both Firefox and Chrome.

<a href="https://grandcentral.cloudbees.com/?CB_clickstart=https://raw.github.com/CloudBees-community/angular-js-clickstart/master/clickstart.json"><img src="https://d3ko533tu1ozfq.cloudfront.net/clickstart/deployInstantly.png"/></a>
