import { TAction } from '../types';
import { ICardBase, ICardBasket, ICardCatalog } from '../types/card';
import { TPrice, TWareCategory, TWareInfo } from '../types/model';
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
    this.addListener(this._buttonElement, 'click', this.action.bind(this));
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

  set price(value: TPrice) {
    this.setText(this._priceElement, makePriceText(value));
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
    this.toggleClass(this._categodyElement, `.card__category_${value}`);
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
    if (this._buttonElement) {
      if (value) {
        this.setText(this._buttonElement, 'Убрать');
      } else {
        this.setText(this._buttonElement, 'Купить');
      }
      this._isInCart = value;
    }
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
