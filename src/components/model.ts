import { IWare, TWareInfo, ICatalog, IWareConstructor, IOrder, TOrderInfo, ICart, TPrice } from '../types/model';
import { IEvents } from './base/events';

export class Ware implements IWare {
  protected _isInCart: boolean;
  constructor(protected _info: TWareInfo, protected _event: IEvents) {
    this._isInCart = false;
  }

  set info (val:TWareInfo) {
    this._event.emit('ware:change',this);
    this._info=val;
  }

  get info (): TWareInfo {
    //this._event.emit('ware:change',this);
    return this._info
  }

  public get isInCart(): boolean {
    return this._isInCart;
  }

  public set isInCart(val:boolean) {
    this._isInCart=val;
    this._event.emit('ware:change',{id:this.info.id});
  }

}

export class Catalog implements ICatalog {
  protected _wares:IWare[];
  constructor (protected _WareConstructor:IWareConstructor, protected _event: IEvents) {
    this._wares=[];
  }
  addWare(val:TWareInfo) {
    this._wares.push(new this._WareConstructor(val,this._event));
  }
  set list(list:TWareInfo[]) {
    list.forEach(ware=>this.addWare(ware));
  }
  get list () {
    return this._wares.map(item=>{return item.info});
  }
  findWare(id:string|undefined):IWare|undefined {
    if (id) {
      return this._wares.find(ware=>(id===ware.info.id));
    }
  }
}

export class Cart implements ICart {
  public waresList: Map<IWare, number>;
  protected _fullprice:number|undefined;
  protected _idList:string[]|undefined;
  protected _amount:number|undefined;
  protected _positions: TWareInfo[]|undefined;
  constructor( _event: IEvents) {
    this.waresList=new Map<IWare, number>();
  }

  protected _resetCache () {
    this._fullprice=undefined;
    this._idList=undefined;
    this._amount=undefined;
    this._positions=undefined;
  }

  public get idList() {
    if (this._idList) {
      return this._idList;
    }
    const idList: string[] = [];
    this.waresList.forEach((val, key) => {
      for (let i = 1; i<=val; i += 1) {
        idList.push(key.info.id);
      }
    });
    this._idList=idList;
    return idList;
  }

  public get fullprice(): number {
    if (this._fullprice) {
      return this._fullprice;
    }
    let price: TPrice = 0;
    this.waresList.forEach((val, key) => {
      for (let i = 1; i<=val; i = i + 1) {
        price += (key.info.price===null)?0:key.info.price;
      }
    });
    this._fullprice=price;
    return price;
  }

  public get amount(): number {
    if (!this._amount) {
      this._amount=this.waresList.size;
    }
    return this._amount
  }

  public get positions():TWareInfo[] {
    if (!this._positions) {
      this._positions=[];
      this.waresList.forEach((value,key)=>{
        const amount=value;
        if (this._positions){
          this._positions.push(Object.assign({},key.info,{title:key.info.title+`(${amount})`,price:(key.info.price===null)?null:key.info.price*amount}));
        }
      })
  }
    return this._positions
  }

  public addItem(ware: IWare): void {
    if (this.waresList.has(ware)) {
      this.waresList.set(ware, this.waresList.get(ware) + 1);
    } else {
      this.waresList.set(ware, 1);
      ware.isInCart=true;
    }
    this._resetCache();
  }

  public removeItem(ware: IWare): void {
    if (this.waresList.has(ware)) {
      this.waresList.set(ware, this.waresList.get(ware) - 1);
      if (this.waresList.get(ware)===0) {
        this.waresList.delete(ware);
        ware.isInCart=false;
      }
      this._resetCache();
    } 
  }

  public contains(ware: IWare): boolean {
    return this.waresList.has(ware);
  }

  public clear():void{
    this._resetCache();
    this.waresList=new Map<IWare, number>();
  }

  get isEmpty(): boolean {
    return (this.idList.length>0)
  }
}

export class Order implements IOrder {
  public info: TOrderInfo;
  constructor() {
    this.clearInfo();
  }

  public clearInfo(): void{
    this.info={
      payment:undefined,
      total:0,
      items:[],
      phone:undefined,
      address:undefined,
      email:undefined,
    };
  }

  public isValid(orderInfo:Partial<TOrderInfo>, key:string):boolean {
    switch (key) {
      case 'payment':
        return Boolean((orderInfo[key]==='online')||(orderInfo[key]==='cash'))
      case 'items':
        return (orderInfo[key].length>0)
      case 'phone':
      case 'address':      
      case 'email':
          return (orderInfo[key].length>0)               
      default:
        return true
    }
  }

  validate(orderInfo:Partial<TOrderInfo>):string {
    
    return Object.keys(orderInfo).every(key=>this.isValid(orderInfo,key))?'':'проверьте введённые данные'
  }
}
