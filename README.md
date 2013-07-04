AngularJS [![Build Status](https://travis-ci.org/maksimr/angular-doc.png?branch=master)](https://travis-ci.org/maksimr/angular-doc)
=========

AngularJS позволяет вам писать web приложение на стороне клиента, так как если бы у вас
был умный браузер.
Эта технология позволяет использовать старый добрый HTML (или HAML, Jade и иже с ними!) в качестве
шаблона и расширять его синтаксис, что позволяет вам описывать компоненты приложения кратко и ясно.
Так же AngularJS автоматически синхронизирует данные внутри UI(представления) с
объектами в JavaScript(моделью) используя двунаправленную привязку данных.
Что бы помочь вам лучше структурировать ваше приложение и сделать его простым для написания тестов,
AngularJS учит браузер как делать внедрение зависимостей(dependency injection) и инверсию управления(inversion of control).
Ах да, AngularJS так же помогает взаимодействовать с сервером, укрощая асинхронные вызовы с promises и deferreds,
и делает клиентскую навигацию и [deeplinking](http://ru.wikipedia.org/wiki/%D0%92%D0%BD%D0%B5%D1%88%D0%BD%D0%B5%D0%B5_%D1%81%D0%B2%D1%8F%D0%B7%D1%8B%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5)
с hashbang уралми(urls) или HTML5 pushState пустяковым делом. И самое лучшее:
Вы будете получать удовольствие от разработки!

Ссылки
---------

Русский перевод документации:
* Русский сайт: http://angular-doc.herokuapp.com/index.html
* Учебник: http://angular-doc.herokuapp.com/index.html

Официальный сайт:
* Web site: http://angularjs.org
* Tutorial: http://docs.angularjs.org/tutorial
* API Docs: http://docs.angularjs.org/api
* Developer Guide: http://docs.angularjs.org/guide
* Contribution guidelines: http://docs.angularjs.org/misc/contribute

Дополнительный материал:
* Видео курс по AngularJS(eng): http://egghead.io
* С чего начать изучение AngularJS: http://stepansuvorov.com/blog/2012/12/%D1%81-%D1%87%D0%B5%D0%B3%D0%BE-%D0%BD%D0%B0%D1%87%D0%B0%D1%82%D1%8C-%D0%B8%D0%B7%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5-angularjs
* AngularJS — фреймворк для динамических веб-приложений от Google: http://habrahabr.ru/post/149060
* 7 причин, почему AngularJS крут: http://habrahabr.ru/post/142590
* Ключевое отличие AngularJS от Knockout: http://habrahabr.ru/post/165275
* Директивы в AngularJS: http://habrahabr.ru/post/164493
* Валидация форм в AngularJS: http://habrahabr.ru/post/167793
* Практикум AngularJS — разработка административной панели: http://habrahabr.ru/post/149757
* Практикум AngularJS — разработка административной панели (часть 2): http://habrahabr.ru/post/150321
* Лучшие практики AngularJS: http://habrahabr.ru/post/181882/

Участие в проекте
---------

**Перевод**

Если вы хотите помочь с переводом то можете использовать кнопку `Улучшить перевод`
на сайте или перейти на Gitube в папку [docs/content](https://github.com/maksimr/angular-doc/tree/master/docs/content) выбрать раздел и файл, например
`tutorial/index.ngdoc`. После того как открылся файл нажмите 'Edit', все теперь
можно добавлять или улучшать перевод! Формат `ngdoc` - это расширенный [`markdown`](http://daringfireball.net/projects/markdown/).

Все что требует перевода нужно переводить (осталось немного) ;)

Уже имеющийся перевод так же местами требует правки.
Не забывайте поглядывать в [руководство по переводу](http://www.angular.ru/misc/translate), которое так же можно править и предлагать свое толкование тем или иным понятиям.

**Улучшение проекта**

Если у вас есть идеи как можно улучшить проект **не стесняйтесь** делайте pull-request'ы,
пишите в [`issue`](https://github.com/maksimr/angular-doc/issues) или на почту!

**Соглашения по оформлению commit'ов и pull-request'ов**

Есть некоторые соглашения по оформлению commit'ов и pull-request'ов, взятые
из официального репозитория.

Сообщение должно выглядеть следующим образом

    <тип>(<Что меняли>): <сообщение>

В оригинале типов восемь, для перевода добавили девятый тип `translate`:

* feat (улучшение)
* fix (исправление)
* docs (документация)
* style (оформление)
* refactor (рефакторинг)
* test (тестирование)
* chore (рутина)
* revert (откат изменений)
* **translate** (перевод)

Пример сообщения:

    translate(guide:bootstrap): Добавил перевод


Сборка документации
---------

Сейчас еще не определились с хостингом.
На данный момент используем связку travis + heroku,
до этого использовали cloudbees(сейчас там сборка приостановлена но hook'и остались).
Сборка начинается после добавления изменений в основной репозиторий и занимает порядка 4 - 5 минут.
**Любые советы, предложения приветствуются.**
Основная задача запускать автоматически сборку документации на сайте после изменения основного
репозитория на github'е.

* Сайт на heroku: http://angular-doc.herokuapp.com
* Сайт на cloudbees:  http://doc.angularjs.cloudbees.net/index.html

Если статус [![Build Status](https://travis-ci.org/maksimr/angular-doc.png?branch=master)](https://travis-ci.org/maksimr/angular-doc) зеленый (passing),
то последняя сборка на travis прошла успешно.

**Локальная сборка документации**

Необходимо склонировать себе проект и запустить сборку.
Для этого необходимо сделать следующие команды:

    # клонируем проект
    git clone https://github.com/maksimr/angular-doc.git
    # переходим в него
    cd angular-doc
    # устанавливаем npm пакеты
    npm install
    # запускаем сборку документации
    grunt heroku
    # запускаем сборку проекта и сервер
    ./init-app.sh

Благодарности
---------

* [tamtakoe](https://github.com/tamtakoe)
* [maksimr](https://github.com/maksimr)
* [vsorlov](https://github.com/vsorlov)
* altbog
* alvas
* madhead
* DWand
* Chiuaua
* и другие
