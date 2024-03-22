import { TAction } from '.';
import { Component } from '../components/base/component';
import { IEvents } from '../components/base/events';
import { TWareCategory } from '../utils/constants';
import { TPrice } from './model';

export interface ICardBase<T> extends Component<T> {
  id: string; //id карточки
  title: string; // заголовок карточки
  set price(value: TPrice); // цена карточки
  setAction: (action: TAction) => void; // назначить действие с карточкой
}

export interface ICardCatalog<T> extends ICardBase<T> {
  image: string; //изображение карточки
  set category(value: TWareCategory); // категория карточки
  set description(value: string | string[]); //подробное описание
  isInCart: boolean; //наличие в корзине
}

export interface ICardBasket<T> extends ICardBase<T> {
  set index(value: number); //порядковый номер в корзине
}

export interface ICardConstructor<T, C extends ICardBase<T>> {
  new (_container: HTMLElement, _event: IEvents, buttonSelector?: string): C;
}
