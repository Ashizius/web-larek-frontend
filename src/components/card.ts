import { TAction } from '../types';
import { ICardBase, ICardBasket, ICardCatalog } from '../types/card';
import { TPrice, TWareInfo } from '../types/model';
import { TWareCategory, constantCategory } from '../utils/constants';
import { ensureElement } from '../utils/utils';
import { Component } from './base/component';
import { IEvents } from './base/events';

export function makePriceText(val: TPrice): string {
  return val === null ? 'бесценно' : `${val} синапсов`;
}

export abstract class CardBase<T extends TWareInfo>
  extends Component<T>
  implements ICardBase<T>
{
  protected _titleElement: HTMLHeadElement;
  protected _priceElement: HTMLSpanElement;
  protected _price: TPrice;
  protected _buttonElement: HTMLButtonElement | undefined;
  protected _action: TAction;
  constructor(
    protected _container: HTMLElement,
    protected _event: IEvents,
    buttonSelector?: string
  ) {
    super(_container, _event);
    this._titleElement = ensureElement<HTMLHeadElement>(
      '.card__title',
      this._container
    );
    this._priceElement = ensureElement<HTMLSpanElement>(
      '.card__price',
      this._container
    );
    if (buttonSelector) {
      this._buttonElement = this._container.querySelector(buttonSelector);
    } else {
      this._buttonElement = this._container as HTMLButtonElement;
    }
    this._buttonElement.addEventListener('click', this.action.bind(this));
  }

  protected action(event: MouseEvent) {
    this._action.call(this, event);
  }

  public setAction(value: TAction) {
    this._action = value;
  }

  set id(value: string) {
    this._container.dataset.id = value;
  }

  get id() {
    return this._container.dataset.id as string;
  }

  set title(value: string) {
    this.setText(this._titleElement, value);
  }

  get title(): string {
    return this._titleElement.textContent as string;
  }

  set price(price: TPrice) {
    this.setText(this._priceElement, makePriceText(price));
    this._price = price;
    if (this._price === null && this._buttonElement !== this._container) {
      this.setDisabled(this._buttonElement, true);
      this.setText(this._buttonElement, 'недоступен');
    }
  }

  public clearListeners() {
    this._buttonElement.removeEventListener('click', this.action.bind(this));
  }
}

export class CardCatalog<T extends TWareInfo>
  extends CardBase<T>
  implements ICardCatalog<T>
{
  protected _imageElement: HTMLImageElement;
  protected _categodyElement: HTMLSpanElement;
  protected _isInCart: boolean;
  protected _text?: HTMLParagraphElement;
  constructor(
    protected _container: HTMLElement,
    protected _event: IEvents,
    buttonSelector?: string
  ) {
    super(_container, _event, buttonSelector);
    this._imageElement = ensureElement<HTMLImageElement>(
      '.card__image',
      this._container
    );
    this._categodyElement = ensureElement<HTMLSpanElement>(
      '.card__category',
      this._container
    );
    this._isInCart = false;
    this._text = this._container.querySelector(
      '.card__text'
    ) as HTMLParagraphElement;
  }

  set category(value: TWareCategory) {
    this._categodyElement.classList.forEach((value) => {
      if (value !== 'card__category') {
        this._categodyElement.classList.remove(value);
      }
    });
    this._categodyElement.classList.add(
      `card__category_${
        constantCategory
          ? value in constantCategory
            ? constantCategory[value]
            : 'other'
          : 'other'
      }`
    );
    this.setText(this._categodyElement, `${value}`);
  }

  set title(value: string) {
    super.title = value;
    this.setImage(this._imageElement, this.image, value);
  }

  set image(value: string) {
    this.setImage(this._imageElement, value, this.title);
  }

  get image() {
    return this._imageElement.src;
  }

  set isInCart(value: boolean) {
    if (this._buttonElement && this._price !== null) {
      this.setDisabled(this._buttonElement, false);
      this.setText(this._buttonElement, value ? 'Убрать' : 'Купить');
    }
    this._isInCart = value;
  }

  get isInCart(): boolean {
    return this._isInCart;
  }

  set description(value: string | string[]) {
    if (this._text) {
      this.setLines(this._text, value);
    }
  }
}

export class CardBasket<T extends TWareInfo>
  extends CardBase<T>
  implements ICardBasket<T>
{
  protected _title: HTMLSpanElement;
  protected _index: HTMLSpanElement;
  constructor(
    protected _container: HTMLElement,
    protected _event: IEvents,
    buttonSelector?: string
  ) {
    super(_container, _event, buttonSelector);
    this._index = ensureElement<HTMLButtonElement>(
      '.basket__item-index',
      _container
    );
  }

  set index(value: number) {
    this.setText(this._index, value);
  }
}
