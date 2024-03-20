import { Component } from "../components/base/component";

export interface IForm extends Component<object>{
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
