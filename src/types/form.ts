import { Component } from "../components/base/component";

export interface IForm extends Component<object>{
    name: string;
    set error(value:string);
    reset():void;
}

export interface IFormOrder<T> extends IForm {
    payment:T|undefined;
    address:string;
}

export interface IFormContacts extends IForm {
    phone:string;
    email:string;
}

export interface IDialog extends Component<object> {
set total (val:number); //полная сумма заказа
set error (val:string); //выводит ошибку вместо результата заказа
}