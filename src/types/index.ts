import { IApi } from '../components/base/api';
import { TOrderInfo, TWareInfo } from './model';

export type TAction = (event: MouseEvent) => void;

export type TOrderResult = {
  id: string;
  total: number;
};

export type TError = {
  error: string;
};

export interface ILarekApi extends IApi {
  getWare(id: string): Promise<TWareInfo>; //получить данные о товаре с сервера
  getWaresList(): Promise<TWareInfo[]>; //получить список товаров с сервера
  postOrder(orderData: TOrderInfo): Promise<TOrderResult>; //отправить заказ на сервер
}
