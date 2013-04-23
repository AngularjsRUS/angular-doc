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
Для некоторых страниц уже есть перевод (список переводчиков ниже), но он не в формате `ngdoc`!
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

    translate(guide:bootstrap): Добавил перевод


Как происходит сборка документации
---------
Для того чтобы добавленные переводы появились на [сайте](http://doc.angularjs.cloudbees.net/index.html)
необходимо пересобрать html страницы. Сейчас это сделано автоматически после
добавления изменений в основной репозиторий (принятие request pull'ов или добавление commit'ов).
Сборка занимает порядка 1 - 2 минут.

Изменения можно будет посмотреть [тут](http://doc.angularjs.cloudbees.net/index.html).
Сейчас это не production host!

Локальная сборка документации
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

Благодарности
---------

 + [tamtakoe](https://github.com/tamtakoe) — 7770 очков
 + altbog — 2476 очков
 + alvas — 2057 очков
 + madhead — 1699 очков
 + DWand — 1585 очков
 + Chiuaua — 716 очков
 + Alexander — 646 очков
 + dublicator — 331 очко
 + aksenov — 80 очков
 + leshaogonkov — 57 очков
 + iketari — 56 очков
 + pegas — 44 очка
 + jalners — 37 очков
 + piumosso — 30 очков
 + fearmear — 12 очков
 + gcolor — 37 очков
 + semigradsky — 2 очка

### Continuous Integration

CloudBees have provided a CI/deployment setup:


If you run this, you will get a cloned version of this repo to start working on in a private git repo,
along with a CI service (in Jenkins) hosted that will run unit and end to end tests in both Firefox and Chrome.

<a href="https://grandcentral.cloudbees.com/?CB_clickstart=https://raw.github.com/CloudBees-community/angular-js-clickstart/master/clickstart.json"><img src="https://d3ko533tu1ozfq.cloudfront.net/clickstart/deployInstantly.png"/></a>
