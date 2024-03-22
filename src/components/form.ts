import { IDialog, IForm } from '../types/form';
import { TOrderInfo, TPaymentType } from '../types/model';
import { ensureAllElements, ensureElement } from '../utils/utils';
import { Component } from './base/component';
import { IEvents } from './base/events';

abstract class Form extends Component<object> implements IForm {
  protected _error: HTMLSpanElement; //элемент ошибки
  protected _submitButton: HTMLButtonElement; //элемент кнопки сабмита
  protected _inputs: HTMLInputElement[]; //элемент ввода
  protected _name: string; //имя формы
  constructor(
    protected _container: HTMLFormElement,
    protected _event: IEvents
  ) {
    super(_container, _event);
    this._error = ensureElement<HTMLSpanElement>('.form__errors', _container);
    this._inputs = [];
    this._name = _container.name;
    Array.from(this._container.elements).forEach((element) => {
      if (element instanceof HTMLInputElement) {
        this._inputs.push(element as HTMLInputElement);
      } else if (element instanceof HTMLButtonElement) {
        if ((element as HTMLButtonElement).type === 'submit') {
          this._submitButton = element as HTMLButtonElement;
        }
      }
    });
    this.addListener(this._submitButton, 'click', this._onSubmit.bind(this));
  }

  set error(value: string) {
    this.setText(this._error, value);
    if (value.length > 0) {
      this.setDisabled(this._submitButton, true);
    } else {
      this.setDisabled(this._submitButton, false);
    }
  }

  abstract get values(): object; //абстрактный метод выводит объект со всеми значениями инпутов и переключателей, реализуется в производных классах

  get name(): string {
    return this._name;
  }

  protected _validateForm() {
    this._event.emit(`form:validate`, { name: this.name, info: this.values });
  }

  protected _addEventListeners() {
    this._inputs.forEach((input) => {
      this.addListener(input, 'input', this._validateForm.bind(this));
    });
  }

  protected _onSubmit(evt: SubmitEvent) {
    evt.preventDefault();
    this._event.emit('form:advance');
  }

  public reset(): void {
    this.error = '';
    this.setDisabled(this._submitButton, true);
  }
}

export class FormOrder extends Form {
  protected _paymentType: TPaymentType | undefined; //тип опаты
  protected _paymentSwitchers: HTMLButtonElement[]; //переключатели типа оплаты
  protected _addressInput: HTMLInputElement; //элемент инпута адреса
  constructor(
    protected _container: HTMLFormElement,
    protected _event: IEvents
  ) {
    super(_container, _event);
    this._paymentSwitchers = ensureAllElements<HTMLButtonElement>(
      '.button_alt',
      _container
    );
    this._addressInput = this._inputs.find((input) => input.name === 'address');
    this._addEventListeners();
    this._listenPaymentSelector();
  }

  private _listenPaymentSelector() {
    //слушатель клика по опладе для переключения
    this._paymentSwitchers.forEach((button) => {
      button.addEventListener('click', this._changePayment.bind(this));
    });
  }

  private _deselectPayment() {
    //выключить все кнопки выбора оплаты
    this._paymentType = undefined;
    this._paymentSwitchers.forEach((button) => {
      this.toggleClass(button, 'button_alt-active', false);
    });
  }
  private _changePayment(event: MouseEvent | undefined): void {
    //переключить тип оплаты: выключает все кнопки и включает ту, по которой нажали
    let name = '';
    if (event) {
      this._deselectPayment();
      const button = event.target as HTMLButtonElement;
      name = button.name;
      this.toggleClass(button, 'button_alt-active', true);
    } else {
      name = '';
      this._deselectPayment();
    }
    switch (name) {
      case 'card':
        this._paymentType = 'online';
        break;
      case 'cash':
        this._paymentType = 'cash';
        break;
      default:
        this._paymentType = undefined;
        break;
    }
    this._validateForm.call(this);
  }

  get payment(): TPaymentType | undefined {
    return this._paymentType;
  }

  set payment(val: TPaymentType | undefined) {
    this._paymentType = val;
    if (!val) {
      this._deselectPayment();
    }
  }

  get address(): string {
    return this._addressInput.value;
  }

  set address(val: string) {
    this._addressInput.value = val;
  }

  public reset() {
    this._addressInput.value = '';
    this.payment = undefined;
    super.reset();
  }

  get values(): Partial<TOrderInfo> {
    return { payment: this.payment, address: this.address };
  }
}

export class FormContacts extends Form {
  protected _phoneInput: HTMLInputElement;
  protected _emailInput: HTMLInputElement;

  constructor(
    protected _container: HTMLFormElement,
    protected _event: IEvents
  ) {
    super(_container, _event);
    this._emailInput = this._inputs.find((input) => input.name === 'email');
    this._phoneInput = this._inputs.find((input) => input.name === 'phone');
    this._addEventListeners();
  }

  get phone(): string {
    return this._phoneInput.value;
  }

  set phone(val: string) {
    this._phoneInput.value = val;
  }

  get email(): string {
    return this._emailInput.value;
  }

  set email(val: string) {
    this._emailInput.value = val;
  }

  public reset() {
    this._emailInput.value = '';
    this._phoneInput.value = '';
    super.reset();
  }

  get values(): Partial<TOrderInfo> {
    return { phone: this.phone, email: this.email };
  }
}

export class Dialog extends Component<object> implements IDialog {
  protected _response: HTMLParagraphElement;
  protected _title: HTMLHeadElement;
  protected _button: HTMLButtonElement;
  constructor(protected _container: HTMLElement, protected _event: IEvents) {
    super(_container, _event);
    this._response = ensureElement<HTMLParagraphElement>(
      '.order-success__description',
      _container
    );
    this._title = ensureElement<HTMLHeadElement>(
      '.order-success__title',
      _container
    );
    this._button = ensureElement<HTMLButtonElement>('.button', _container);
    this._button.addEventListener('click', this._onSubmit.bind(this));
  }
  set total(val: number) {
    this.setText(this._title, 'Заказ оформлен');
    this.setText(this._response, `Списано ${String(val)} синапсов`);
  }

  set error(val: string) {
    this.setText(this._title, 'ошибка заказа');
    this.setText(this._response, val);
  }

  protected _onSubmit(evt: SubmitEvent) {
    evt.preventDefault();
    this._event.emit('success');
  }
}
