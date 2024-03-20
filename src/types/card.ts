import { Component } from "../components/base/component";
import { IEvents } from "../components/base/events";
import { TWareCategory } from "./model";

export interface ICardBase<T> extends Component<T> {
    id: string; //id карточки
    title: string; // заголовок карточки
    set price(value: number); // цена карточки
  };
  
  export interface ICardCatalog<T> extends ICardBase<T> {
    action: (event: MouseEvent) => void; //действие с карточкой
    image: string; //изображение карточки
    set category(value: TWareCategory);  // категория карточки
  };
  
  export interface ICardPreview<T> extends ICardCatalog<T> {
    set description(value: string | string[]); //подробное описание
    isInCart:boolean; //наличие в корзине
  };
  
  export interface ICardBasket<T> extends ICardBase<T> {
    set index(value:number); //порядковый номер в корзине
  };
    
  export interface ICardConstructor<T,C extends ICardBase<T>> {
    new (_container: HTMLElement, _event: IEvents): C; 
  };
  
