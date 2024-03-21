import { TAction } from '../types';
import { ICardBase, ICardConstructor, ICardBasket } from '../types/card';
import { IBasketView, ICatalogView, TcardModifier } from '../types/catalog';
import { TWareInfo } from '../types/model';
import { cloneTemplate, ensureElement } from '../utils/utils';
import { Component } from './base/component';
import { IEvents } from './base/events';
import { makePriceText } from './card';

export class CatalogView<C extends ICardBase<T>, T extends TWareInfo>
  extends Component<T>
  implements ICatalogView<C, T>
{
  protected _cards: C[];
  protected _customButtonSelector: string | undefined;
  constructor(
    protected _container: HTMLElement,
    protected _event: IEvents,
    protected _CardConstructor: ICardConstructor<T, C>,
    protected _cardTemplate: HTMLTemplateElement,
    protected _cardModifier: TcardModifier<C>
  ) {
    super(_container, _event);
    this._cards = [];
  }

  protected addCard(ware: T): C {
    //добавить карточку, создав её при помощи конструктора
    const newCard: C = new this._CardConstructor(
      cloneTemplate(this._cardTemplate),
      this._event,
      this._customButtonSelector
    );
    newCard.render(ware);
    this._cards.push(newCard);
    this._cardModifier(newCard);
    return newCard;
  }

  public setList(wares: T[], placeContainer?: HTMLElement | undefined): void {
    //назначить список карточек, если уже есть карточки, то обновить их, удалив лишние
    const container = placeContainer ? placeContainer : this._container;
    let replace = false;
    const length: number = this._cards.length;
    if (length > wares.length) {
      this._cards.splice(wares.length).forEach((card) => card.clearListeners());
      container.replaceChildren();
      replace = true;
    }
    wares.forEach((ware, index) => {
      if (index > length - 1) {
        this.addCard(ware).place(container);
      } else {
        if (replace) {
          this._cards[index].render(ware).place(container);
        } else {
          this._cards[index].render(ware);
        }
      }
    });
  }

  public find(id: string): C | undefined {
    return this._cards.find((card) => card.id === id);
  }
}

export class BasketView<C extends ICardBasket<T>, T extends TWareInfo>
  extends CatalogView<C, TWareInfo & { index: number }>
  implements IBasketView<C, T>
{
  protected _listContainer: HTMLUListElement; //контейнер, где располагаются карточки
  protected _index: number; //индекс каждой карточки в корзине
  protected _price: HTMLSpanElement; //полная цена
  protected _button: HTMLButtonElement; //кнопка покупки
  constructor(
    _currentElement: HTMLElement,
    _event: IEvents,
    _CardConstructor: ICardConstructor<T, C>,
    _cardTemplate: HTMLTemplateElement,
    _cardModifier: TcardModifier<C>
  ) {
    super(
      _currentElement,
      _event,
      _CardConstructor,
      _cardTemplate,
      _cardModifier
    );
    this._listContainer = ensureElement<HTMLUListElement>(
      '.basket__list',
      _currentElement
    );
    this._price = ensureElement<HTMLUListElement>(
      '.basket__price',
      _currentElement
    );
    this._button = ensureElement<HTMLButtonElement>(
      '.basket__button',
      _currentElement
    );
    this._index = 0;
    this._button.addEventListener('click', this.action.bind(this));
    this._customButtonSelector = '.basket__item-delete';
    this.setEmpty();
  }

  protected action(): void {
    //действие при нажатии на кнопку
    this._event.emit('orderItems');
  }

  public setList(wares: TWareInfo[], listContainer?: HTMLElement) {
    this._index = 0;
    const cartWares = wares.map((ware) => {
      this._index += 1;
      return { ...ware, index: this._index };
    });
    super.setList(
      cartWares,
      listContainer ? listContainer : this._listContainer
    );
    this.setEmpty(this._index === 0);
  }
  set fullprice(value: number) {
    this._price.textContent = makePriceText(value);
  }

  protected setEmpty(value = true): void {
    //очистка корзины, фактически просто выключает кнопку
    this.setDisabled(this._button, value);
  }
}
