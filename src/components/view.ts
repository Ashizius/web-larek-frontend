import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";


export class Page {
    protected _basketButton: HTMLButtonElement;
    protected _basketCounter: HTMLSpanElement;
    protected _wrapper: HTMLElement;
    constructor (protected _container: HTMLElement,protected _event:IEvents) {
        this._basketButton=ensureElement<HTMLButtonElement>('.header__basket',_container);
        this._basketCounter=ensureElement<HTMLSpanElement>('.header__basket-counter',_container);
        this._basketButton.addEventListener('click',this.basketOpen.bind(this));
        this._wrapper=ensureElement<HTMLElement>('.page__wrapper',_container);
    }
    set waresAmount(value:number) {
        this._basketCounter.textContent=String(value);
    }
    private basketOpen () {
        this._event.emit('cart:view');
    }
    public lock(locked=true) {
        locked?this._wrapper.classList.add('page__wrapper_locked'):this._wrapper.classList.remove('page__wrapper_locked');
    }
}