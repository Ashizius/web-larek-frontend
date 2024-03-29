import { ILarekApi, TOrderResult } from '../types';
import { TOrderInfo, TWareInfo } from '../types/model';
import { Api, ApiListResponse } from './base/api';

export class LarekApi extends Api implements ILarekApi {
  readonly cdn: string;
  protected _orderResponse: Partial<TOrderResult>;
  protected _orderInfo: TOrderInfo | undefined;
  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  public getWare(id: string): Promise<TWareInfo> {
    return this.get(`/product/${id}`).then((item: TWareInfo) => ({
      ...item,
      image: this.cdn + item.image,
    }));
  }

  public getWaresList(): Promise<TWareInfo[]> {
    return this.get('/product').then((data: ApiListResponse<TWareInfo>) =>
      data.items.map((item) => ({
        ...item,
        image: this.cdn + item.image,
      }))
    );
  }

  public postOrder(orderData: TOrderInfo): Promise<TOrderResult> {
    return this.post('/order', orderData).then((data: TOrderResult) => data);
  }
}
