import { Component } from "../components/base/component";

export interface ICatalogView<C, T> extends Component<T>{
  setList(wares: T[], placeContainer?: HTMLElement | undefined): void;
}

export interface IBasketView<C, T> extends ICatalogView<C, T> {
  set fullprice(value: number);
}
