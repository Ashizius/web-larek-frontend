import { Component } from '../components/base/component';

export type TcardModifier<C> = (card: C) => void;

export interface ICatalogView<T> extends Component<T> {
  setList(wares: T[], placeContainer?: HTMLElement | undefined): void;
}

export interface IBasketView<T> extends ICatalogView<T> {
  set fullprice(value: number);
}
