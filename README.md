![AngularJS](http://angularjs.org/img/AngularJS-large.png)

Русская документация по AngularJS

Есть что добавить (важно)
---------

Если у вас есть идеи или вы хотите посодействовать **не стесняйтесь**
пишите в `issue` или на почту!

Что и как переводить?
---------
Основные файлы для перевода находятся тут `docs/content/<раздел>/<файл>.ngdoc`.
Формат `ngdoc` - это расширенный `markdown`.

Все что требует перевода нужно переводить (осталось немного) :) Уже имеющийся перевод так же местами требует правки.
Незабывайте поглядывать в [руководство по переводу](https://github.com/maksimr/docs.angularjs.ru/wiki/*-%D0%A0%D1%83%D0%BA%D0%BE%D0%B2%D0%BE%D0%B4%D1%81%D1%82%D0%B2%D0%BE-%D0%BF%D0%BE-%D0%BF%D0%B5%D1%80%D0%B5%D0%B2%D0%BE%D0%B4%D1%83), которое так же можно править и предлагать свое толкование тем или иным понятиям.


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
Сборка занимает порядка 4 - 5 минут.

Изменения можно будет посмотреть [тут](http://doc.angularjs.cloudbees.net/index.html).
Сейчас это не production host!

Локальная сборка документации
---------

[После того как настроили среду](http://docs.angularjs.org/misc/contribute) запустите команду:

    grunt package

Ссылки
---------

* [Русский сайт](http://doc.angularjs.cloudbees.net/index.html)
* [Учебник](http://doc.angularjs.cloudbees.net/tutorial)

* [Web site (eng)](http://angularjs.org)
* [Tutorial (eng)](http://docs.angularjs.org/tutorial)
* [API Docs (eng)](http://docs.angularjs.org/api)
* [Developer Guide (eng)](http://docs.angularjs.org/guide)
* [Contribution guidelines (eng)](http://docs.angularjs.org/misc/contribute)

* [Видео курс по AngularJS (eng)](http://egghead.io)
* [Ключевое отличие AngularJS от Knockout](http://habrahabr.ru/post/165275)
* [AngularJS — фреймворк для динамических веб-приложений от Google](http://habrahabr.ru/post/149060)
* [7 причин, почему AngularJS крут](http://habrahabr.ru/post/142590)
* [С чего начать изучение AngularJS](http://stepansuvorov.com/blog/2012/12/%D1%81-%D1%87%D0%B5%D0%B3%D0%BE-%D0%BD%D0%B0%D1%87%D0%B0%D1%82%D1%8C-%D0%B8%D0%B7%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5-angularjs)
* [Практикум AngularJS — разработка административной панели](http://habrahabr.ru/post/149757)
* [Практикум AngularJS — разработка административной панели (часть 2)](http://habrahabr.ru/post/150321)
* [Директивы в AngularJS](http://habrahabr.ru/post/164493)
* [Валидация форм в AngularJS](http://habrahabr.ru/post/167793)

Благодарности
---------

[tamtakoe](https://github.com/tamtakoe), [maksimr](https://github.com/maksimr), altbog, alvas, madhead, DWand, Chiuaua и другие

### Continuous Integration

--CloudBees have provided a CI/deployment setup:--

Heorku? \o/
