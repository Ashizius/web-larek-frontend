import { ILarekApi, TOrderResult } from '../types';
import { TOrderInfo, TWareInfo } from '../types/model';
import { Api, ApiListResponse } from './base/api';


export class LarekApi extends Api  implements ILarekApi {
  readonly cdn: string;
  protected _orderResponse:Partial<TOrderResult>;
  protected _orderInfo: TOrderInfo|undefined;
  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  public getWare(id: string): Promise<TWareInfo> {
    return this.get(`/product/${id}`).then(
        (item: TWareInfo) => ({
            ...item,
            image: this.cdn + item.image,
        })
    );
}

  public getWaresList(): Promise<TWareInfo[]> {
    return this.get('/product').then((data: ApiListResponse<TWareInfo>) =>
        data.items.map((item) => ({
            ...item,
            image: this.cdn + item.image
        }))
    );
  }

  public postOrder(orderData:TOrderInfo): Promise<Partial<TOrderResult>|void> {
    return this.post('/order',orderData)
      .then(data=>{
        if (data) {
          if ('error' in data) {
            return Promise.reject(data.error)
          }
          return data
        }
        else {
          return Promise.reject('empty element')
        }
      })
  }

/*
  protected orderItems(orderInfo:TOrderInfo): Promise<Partial<TOrderResult>|void>  {
    return this.postOrder(orderInfo)
    
  }

  setOrderInfo(orderInfo:TOrderInfo) {
    this._orderInfo=orderInfo;
    return this
  }

  get orderResult():Partial<TOrderResult> {
    const orderResult:Partial<TOrderResult|void>={error:'',id:'',total:0};
    console.log(this._orderInfo);
    if (!this._orderInfo) {
      orderResult.error='нечего заказывать';
      return orderResult
    }
    this.postOrder(this._orderInfo)
    .then(data=>{
      if (data) {
        orderResult.id=(data as Partial<TOrderResult>).id;
        orderResult.total=(data as Partial<TOrderResult>).total;
        this._event.emit
      }
    })
    .catch(error=>orderResult.error=error);
    this._orderInfo=undefined;
    return orderResult
  }
*/
  
}

