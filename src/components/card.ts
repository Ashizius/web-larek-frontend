import { ICardBase, ICardBasket, ICardCatalog, ICardPreview } from "../types/card";
import { TPrice, TWareCategory, TWareInfo } from "../types/model";
import {  ensureElement } from "../utils/utils";
import { Component } from "./base/component";
import { IEvents } from "./base/events";

export function makePriceText(val:TPrice):string {
    return (val===null)?'бесценно':`${val} синапсов`;
    }
    

export abstract class CardBase<T extends TWareInfo> extends Component<T> implements ICardBase<T> {
    protected _titleElement: HTMLHeadElement;
    protected _priceElement: HTMLSpanElement;
    protected _buttonElement: HTMLButtonElement;

    constructor (protected _container: HTMLElement,protected _event:IEvents) {
        super(_container, _event);
        this._titleElement=ensureElement<HTMLHeadElement>('.card__title',this._container);
        this._priceElement=ensureElement<HTMLSpanElement>('.card__price',this._container);
    }

    set id (value: string) {
        this._container.dataset.id=value;
    }

    get id () {
        return this._container.dataset.id as string;
    }

    set title (value: string) {
        this.setText(this._titleElement,value);
    }

    get title ():string {
        return this._titleElement.textContent as string;
    }

    set price (value: TPrice) {
        this.setText(this._priceElement,makePriceText(value));
    }
}

export class CardCatalog<T extends TWareInfo> extends CardBase<T> implements ICardCatalog<T> {
    protected _imageElement: HTMLImageElement;
    protected _categodyElement: HTMLSpanElement;
    constructor (protected _container: HTMLElement,protected _event:IEvents, buttonElement?:HTMLButtonElement) {
        super(_container, _event);
        if (buttonElement) {
            this._buttonElement=buttonElement;
        }
        else {
            this._buttonElement=_container as HTMLButtonElement;
        }
        this._imageElement=ensureElement<HTMLImageElement>('.card__image',this._container);
        this._categodyElement=ensureElement<HTMLSpanElement>('.card__category',this._container);
        this.addListener(this._buttonElement,'click',this.action.bind(this));
    }
    
    set category (value: TWareCategory) {
        this.toggleClass(this._categodyElement,`.card__category_${value}`);
    }
    

    set title (value: string) {
        super.title=value;
        this.setImage(this._imageElement,this.image,value);
    }

    set image (value: string) {
        this.setImage(this._imageElement,value,this.title);
    }

    get image () {
        return this._imageElement.src;
    }
    action () {
        this._event.emit('catalog.card:view',{id: this.id});
    }
    
}

export class CardPreview<T extends TWareInfo> extends CardCatalog<T> implements ICardPreview<T> {
    protected _text: HTMLParagraphElement;
    protected _isInCart: boolean;
    constructor (protected _container: HTMLElement,protected _event:IEvents) {
        super(_container, _event, ensureElement<HTMLButtonElement>('.card__button',_container));
        this._text=ensureElement<HTMLParagraphElement>('.card__text',_container);
        this._isInCart=false;
    }

    set description (value: string|string[]) {
        this.setLines(this._text,value);
    }

    set isInCart(value:boolean) {
        if (value) {
            this.setText(this._buttonElement,'Убрать');
        }
        else {
            this.setText(this._buttonElement,'Купить');
        }
        this._isInCart=value;
    }

    get isInCart():boolean {
        return this._isInCart;
    }

    action () {
        if (!this.isInCart) {
            this._event.emit('ware:addToCart',{id: this.id});
        }
        else {
            this._event.emit('ware:removeFromCart',{id: this.id});
        }
    }
}

export class CardBasket<T extends TWareInfo> extends CardBase<T> implements ICardBasket<T> {
    protected _title: HTMLSpanElement;
    protected _index: HTMLSpanElement;
    constructor (protected _container: HTMLElement,protected _event:IEvents) {
        super(_container, _event);
        this._buttonElement=ensureElement<HTMLButtonElement>('.basket__item-delete',_container);
        this.addListener(this._buttonElement,'click',this.action.bind(this));
        this._index=ensureElement<HTMLButtonElement>('.basket__item-index',_container);
    }
    protected action() {
        this._event.emit('ware:removeFromCart',{id: this.id});
    }
    set index(value:number) {
        this.setText(this._index,value);
    }
}