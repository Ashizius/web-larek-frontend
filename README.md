# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```



# Проектная работа «WEB-ларёк» #
Реализация интернет-магазина с товарами для веб-разработчиков — Web-ларёк. В нём можно посмотреть каталог товаров, добавить товары в корзину и сделать заказ.
Используемый стек: 
*TypeScript, 
*HTML, 
*SCSS.
Для сборки используется Webpack.
Подключены инструменты линтинга и форматирования.
Используется MVP-архитектура веб-приложения


## Инструкция по сборке и запуску ##
После клонирования проекта установить зависимости:
```
npm install
```
Для запуска проекта в режиме разработки выполнить команду:
```
npm run start
```
и открыть в браузере страницу по адресу http://localhost:8080
Для сборки проекта в продакшен выполнить команду:
```
npm run build
```
___

## Архитектура проекта ##

### Структура проекта ###
Проект построен по схеме MVP.

#### Модель ####
Модель проекта пожно разбить на 4 элемента:
- классы для работы с API, позволяющий принять с сервера данные по товарам, принять данные отдельного товара \
 и отправить список для оформления покупки с результатом в виде ответа сервера о стоимости товаров
- класс, содержащий данные о товаре и методы работы с этими данными
- класс для работы с каталогом товаров, позволяющий собрать данные о товаре в список и методы для работы с данным списком (добавление, удаление, поиск в каталоге)
- класс корзины, позволяющий собирать товары для покупки, с методами определения полной цены, списка артикулов и количества к покупке для каждого артикула

экземпляры классов каталога, корзины и товаров связаны через класс для управления данными, с методами этого класса и подразумевается работа

#### представление ####
представление можно разбить на 5 частей:
- классы карточек галереи, корзины и превьювера
- классы галереи и корзины
- классы форм отправки данных о покупке и диалог о результате
- класс модального окна
- класс управления страницей и её мелкими элементами

### UML схема ###

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ссылка на UML!!!!!!!!!!!!!!!!!!!!!!!!!!!

### Ключевые типы данных ###

*типы, относящиеся к товарам:
типы цены и категории, (последний выделил на случай необходимости ограничения категорий в дальнейшем, пока назначил string):
```
type TPrice=number|null;
type TWareCategory = string;
```
тип информации о товаре
```
type TWareInfo = {
  id: string;
  description: string;
  image: string;
  title: string;
  category: TWareCategory;
  price: TPrice;
};
```

*типы, относящиеся к заказу:
тип оплаты:
```
type TPaymentType = 'online' | 'cash';
```
тип информации о заказе:
```
type TOrderInfo = {
  total: number;
  items: string[] | undefined;
  email?: string;
  phone?: string;
  address?: string;
  payment: TPaymentType | undefined; 
};
```


```
export type TOrderResult = {
  id: string;
  total: number;
  error: string;
};

export type TError = {
  error: string;
};
```

### Базовый код ###

Располагается в папке **src/components/base** и в папке **src/utils/**

#### 1. функции для работы с DOM ####
располагаются в файле **src/utils/utils.ts**
Стоит выделить основные функции:
-*ensureElement* и *ensureAllElements*, принимающие на вход селектор или набор селекторов (вторая функция) и возвращающие DOM-элемент или их коллекцию, соответственно
-*cloneTemplate*, принимающую на вход темплэйт элемента, и возвращающую его клон

#### 1. Класс EventEmitter####
располагается в файле **src/components/base/events.ts**
является брокером событий с интерфейсом 
```
IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void; \\Установить обработчик на событие
    emit<T extends object>(event: string, data?: T): void; \\ Инициировать событие с данными
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void; \\ Сделать коллбек триггер, генерирующий событие при вызове
}
```
также данный брокер позволяет
-Снять обработчик с события (метод: *off(eventName: EventName, callback: Subscriber)*)
-Слушать все события (метод: *onAll(callback: (event: EmitterEvent) => void)*)
-Сбросить все обработчики (метод: *offAll()*)

#### 1. Класс Компонент####
Является абстрактным
располагается в файле **src/components/base/component.ts**
Принимает дженерик, определяющий тип объекта из которого рендерится отображение экземпляра класса
Имеет защищённое свойство - Map(элемент,TeventListener[] -- колбэки слушателя элемента с типом слушателя).
```
type TeventListener = {
    callback:TAction,
    type:string
  };
```
Также содержит защищённые методы:
- Переключение класса элемента (метод *toggleClass(element: HTMLElement, className: string, force?: boolean)*)
- назначение текста элементу  (метод *setText(element: HTMLElement, value: unknown)*)
- назначение многоблокового элемента с дублированием элемента поблочно, если на входе массив строк (метод *setLines(element: HTMLElement, value: unknown)*)
- переключить статус disabled элемента (метод *setDisabled(element: HTMLElement, state: boolean)*)
- спрятать элемент (метод *setHidden(element: HTMLElement)*)
- показать элемент (метод *setVisible(element: HTMLElement)*)
- назначить картинку и альт изображения (метод *setImage(element: HTMLImageElement, src: string, alt?: string)*)

имплементирует следующий интерфейс:
```
interface IComponent<T> {
    place(container: HTMLElement):void;     //разместить в элементе
    get container (): HTMLElement;      // Вернуть корневой DOM-элемент
    addListener(element:HTMLButtonElement|HTMLInputElement,type:string,callback:TAction);    //добавить слушатель к элементу
    clearListeners(element?:HTMLButtonElement|HTMLInputElement);    //снять слушатели с элемента/элементов
    render(data?: Partial<T>): Component<T>;    //рендерится отображение в контейнере
}
```

#### 1. Класс API####
имплементирует следующий интерфейс:
```
interface IApi {
    get(uri: string); //получить данные с сервера
    post(uri: string, data: object, method: ApiPostMethods); //вывести данные на сервер
}
```

### Компоненты модели данных (Model) ###
состоит из набора классов:
- *Ware*, экземпляры которого принимают информацию о товаре и информацию о наличии в корзине.
```
interface IWare {
  info: TWareInfo; // информация о товаре
  isInCart: boolean; // назначение и снятие того, что элемент в корзине
}

interface IWareConstructor {
  new (_info: TWareInfo, _event: IEvents): IWare;
}
```
- *Catalog* каталог товаров, содержащий массив экземпляров классов IWare
```
interface ICatalog {
  addWare(val: TWareInfo): void; // добавить товар в каталог
  list: TWareInfo[];  // список товаров
  findWare(id: string): IWare; // поиск товара в каталоге по id
}
```
- абстрактный класс *Order* содержит информацию о заказе и метод очистки инфромации
```
interface IOrder {
    info: TOrderInfo; //информация о заказе и пользователе
    clearInfo (info: Partial<TOrderInfo>): void; // очистка информации о заказе
}
```
- класс корзины *Cart*, расширяющий класс *Order*
```
interface ICart {
    waresList: Map<IWare, number>; //список товаров с количеством
    get fullprice(): number; //полная цена товаров в каталоге
    get idList(): string[]; //список айдишников товаров
    get amount(): number; //полное количество товаров
    addItem: (ware: IWare) => void; //добавить товар в корзину
    removeItem: (ware: IWare) => void; //удалить товар из корзины
    contains: (ware: IWare) => void; //содержит товар в корзине
    clear: () => void; //очистить корзину
  };
```

- класс заказа *Order*
```
interface IOrder {
  info: TOrderInfo; //информация о заказе и пользователе
  clearInfo (info: Partial<TOrderInfo>): void; // очистка информации о заказе
  isValid(orderInfo:Partial<TOrderInfo>, key:string):boolean; //проверка валидности переданных данных по ключу
  validate(orderInfo:Partial<TOrderInfo>):string; //проверка валидности всех переданных данных
}
```

### сервисные компоненты ###

-  *LarekApi* отвечает за получение списка покупок с сервера
```
export interface ILarekApi extends IApi  {
  getWare(id: string): Promise<TWareInfo> //получить данные о товаре с сервера

  getWaresList(): Promise<TWareInfo[]>  //получить список товаров с сервера

  postOrder(orderData:TOrderInfo): Promise<Partial<TOrderResult>|void> //отправить заказ на сервер
  }

```


### Компоненты представления (View) ###
Разбиты по файлам:
- *card.ts*  классы карточек
-- *CardBase* принимает дом-элемент, сделанный из темплейта карточки и ивентэмиттер, позволяет назначить и получить общие данные по карточкам, выводимым в разных контейнерах
-- *CardCatalog* карточка в галерее, расширяет содержимое базовой карточки
-- *CardPreview* карточка-превью, расширяет карточку галереи , содержит ещё информацию по сравнению с карточкой в галерее, в частности, подробное описание
-- *CardBasket* карточка в корзине, основана на базовой карточке, содержит порядковый номер в корзине
```
interface ICardBase<T> extends IComponent<T> {
    id: string; //id карточки
    title: string; // заголовок карточки
    set price(value: number); // цена карточки
};

interface ICardCatalog<T> extends ICardBase<T> {
action: (event: MouseEvent) => void; //действие с карточкой
image: string; //изображение карточки
set category(value: TWareCategory);  // категория карточки
};

interface ICardPreview<T> extends ICardCatalog<T> {
set description(value: string | string[]); //подробное описание
isInCart:boolean; //наличие в корзине
};

interface ICardBasket<T> extends ICardBase<T> {
set index(value:number); //порядковый номер в корзине
};

interface ICardConstructor<T,C extends ICardBase<T>> {
new (_container: HTMLElement, _event: IEvents): C; 
};
  
```
- *catalog.ts* контейнеры для карточек
-- *CatalogView* класс галереи, содержит список отображений карточек
-- *IBasketView* расширяет класс галереи, содержит гарточки в корзине и полную цену
их интерфейсы:
```
interface ICatalogView<C, T> extends Component<T>{
  setList(wares: T[], placeContainer?: HTMLElement | undefined): void;
}

interface IBasketView<C, T> extends ICatalogView<C, T> {
  set fullprice(value: number);
}

```
- *form.ts* 
```
interface IForm extends Component<object>{
    set error(value:string);
    reset():void;
}

interface IFormOrder<T> extends IForm {
    payment:T|undefined;
    address:string;
}

interface IFormContacts extends IForm {
    phone:string;
    email:string;

}

```
- *modal.ts* 
 

### элементы презентера (Presenter) ###



## Размещение в сети ##

