import { TPaymentType } from "../types/model";
import { ensureAllElements, ensureElement } from "../utils/utils";
import { Component } from "./base/component";
import { IEvents } from "./base/events";


abstract class Form extends Component<object> {
    protected _error: HTMLSpanElement;
    protected _submitButton: HTMLButtonElement;
    protected _inputs: HTMLInputElement[];
    public name:string;
    constructor(protected _container:HTMLFormElement, protected _event:IEvents) {
        super(_container, _event);
        this._error=ensureElement<HTMLSpanElement>('.form__errors',_container);
        this._inputs=[];
        this.name=_container.name;
        Array.from(this._container.elements).forEach((element)=>{
            if (element.nodeName === 'INPUT') {
                this._inputs.push(element as HTMLInputElement);
            }
            else if(element.nodeName === 'BUTTON'){
                if ((element as HTMLButtonElement).type==='submit'){
                    this._submitButton=element as HTMLButtonElement;
                }
            }
        })
        this.addListener(this._submitButton,'click',this._onSubmit.bind(this));
    }

    set error(value:string) {
        this.setText(this._error,value);
        if (value.length>0) {
            this.setDisabled(this._submitButton,true);
        }
        else {
            this.setDisabled(this._submitButton,false);
        }
    }

    get values() {
        return {}
    }

    protected _validateForm(){
        this._event.emit(`Form:validate`,{name:this._container.name,info:this.values});
    }

    protected _addEventListeners() {
        this._inputs.forEach(input=>{
                this.addListener(input,'input',this._validateForm.bind(this));
            }
        )
    }

    protected _onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        this._event.emit('form:advance');
    }

    public reset():void {
        this.error='';
        this.setDisabled(this._submitButton,true);
    };
}

export class FormOrder extends Form {
    protected _paymentType: TPaymentType|undefined;
    protected _paymentSwitchers: HTMLButtonElement[];
    protected _addressInput:HTMLInputElement;
    constructor(protected _container:HTMLFormElement,protected _event:IEvents) {
        super(_container,_event);
        this._paymentSwitchers=ensureAllElements<HTMLButtonElement>('.button_alt',_container);
        this._addressInput=this._inputs.find(input=>input.name==='address');
        this._addEventListeners();
        this._listenPaymentSelector();

    }

    private _listenPaymentSelector () {
        this._paymentSwitchers.forEach(button=>{
            button.addEventListener('click',this._changePayment.bind(this));
        })
    }

    private _deselectPayment () {
        this._paymentType=undefined;
        this._paymentSwitchers.forEach(button=>{
            this.toggleClass(button,'button_alt-active',false);
        })
    }
    private _changePayment(event:MouseEvent|undefined) {
        let name='';
        if (event) {
            this._deselectPayment ();
            const button=event.target as HTMLButtonElement;
            name=button.name;
            this.toggleClass(button,'button_alt-active',true);
        }
        else {
            name='';
            this._deselectPayment ();
        }
        switch (name) {
            case 'card':
                this._paymentType='online';
                break;
            case 'cash':
                this._paymentType='cash';
                    break;        
            default:
                this._paymentType=undefined;
                break;
        }
        this._validateForm.call(this);
    }

    get payment():TPaymentType|undefined {
        return this._paymentType
    }

    set payment (val:TPaymentType|undefined) {
        this._paymentType=val;
        if (!val) {
            this._deselectPayment();
        }
    }

    get address():string {
        return this._addressInput.value;
    }

    set address (val:string) {
        this._addressInput.value=val;
    }

    public reset() {
        this._addressInput.value='';
        this.payment=undefined;
        super.reset();
    }

    get values() {
        return {payment:this.payment,address:this.address}
    }

}

export class FormContacts extends Form {
    protected _phoneInput:HTMLInputElement;
    protected _emailInput:HTMLInputElement;

    constructor(protected _container:HTMLFormElement, protected _event:IEvents) {
        super(_container,_event);
        this._emailInput=this._inputs.find(input=>input.name==='email');
        this._phoneInput=this._inputs.find(input=>input.name==='phone');
        this._addEventListeners();
    }

    get phone():string {
        return this._phoneInput.value;
    }

    set phone (val:string) {
        this._phoneInput.value=val;
    }

    get email():string {
        return this._emailInput.value;
    }

    set email (val:string) {
        this._emailInput.value=val;
    }

    public reset() {
        this._emailInput.value='';
        this._phoneInput.value='';
        super.reset();
    }

        get values() {
        return {phone:this.phone,email:this.email}
    }
}

export class Dialog extends Component<object> {
    protected _response:HTMLParagraphElement;
    protected _title:HTMLHeadElement;
    protected _button:HTMLButtonElement;
    constructor(protected _container:HTMLElement, protected _event:IEvents) {
        super(_container, _event);
        this._response=ensureElement<HTMLParagraphElement>('.order-success__description',_container);
        this._title=ensureElement<HTMLHeadElement>('.order-success__title',_container);
        this._button=ensureElement<HTMLButtonElement>('.button',_container);
        this._button.addEventListener('click',this._onSubmit.bind(this));
    }
    set total (val:number) {
        this.setText(this._title,'Заказ оформлен');
        this.setText(this._response,`Списано ${String(val)} синапсов`);
    }

    set error (val:string) {
        this.setText(this._title,'ошибка заказа');
        this.setText(this._response,val);
    }
    get currentElement() {
        return this._container;
    }

    protected _onSubmit(evt:SubmitEvent) {
        evt.preventDefault();
        this._event.emit('success');
    }

}