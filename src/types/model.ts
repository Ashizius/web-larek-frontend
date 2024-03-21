import { IEvents } from "../components/base/events";

export type TPrice=number|null;

export type TWareCategory = string;

export type TWareInfo = {
  id: string;
  description: string;
  image: string;
  title: string;
  category: TWareCategory;
  price: TPrice;
};

export type TPaymentType = 'online' | 'cash';

export type TOrderInfo = {
  total: number;
  items: string[] ;
  email: string | undefined;
  phone: string | undefined;
  address: string | undefined;
  payment: TPaymentType | undefined; 
};


export interface IOrder {
  info: TOrderInfo; //информация о заказе и пользователе
  clearInfo (info: Partial<TOrderInfo>): void; // очистка информации о заказе
  isValid(orderInfo:Partial<TOrderInfo>, key:string):boolean; //проверка валидности переданных данных по ключу
  validate(orderInfo:Partial<TOrderInfo>):string; //проверка валидности всех переданных данных
}


export interface IWare {
  info: TWareInfo; // информация о товаре
  isInCart: boolean; // назначение и снятие того, что элемент в корзине
}

export interface IWareConstructor {
  new (_info: TWareInfo, _event: IEvents): IWare;
}

export interface ICatalog {
  addWare(val: TWareInfo): void; // добавить товар в каталог
  list: TWareInfo[];  // список товаров
  findWare(id: string): IWare|undefined; // поиск товара в каталоге по id
}

export interface ICart {
    waresList: Map<IWare, number>; //список товаров с количеством
    get fullprice(): number; //полная цена товаров в каталоге
    get idList(): string[]; //список айдишников товаров
    get amount(): number; //полное количество товаров
    addItem: (ware: IWare) => void; //добавить товар в корзину
    removeItem: (ware: IWare) => void; //удалить товар из корзины
    contains: (ware: IWare)=>boolean; //содержит товар в корзине
    clear: () => void; //очистить корзину
  };

