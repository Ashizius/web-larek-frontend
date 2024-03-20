import { IModalWindow } from "../types/modal";
import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";


export class ModalWindow implements IModalWindow {
  protected _closeButton: HTMLButtonElement;
  protected _content:HTMLDivElement;
  constructor(protected _container: HTMLElement, protected _currentElement: HTMLElement, protected _event:IEvents) {
    _container.append(_currentElement);
    this._content=ensureElement<HTMLDivElement>('.modal__content',_currentElement);
    this._closeButton=ensureElement<HTMLButtonElement>('.modal__close',_currentElement);
  }

  protected closeEvent(evt: KeyboardEvent) {
    if (evt.key === 'Escape' || (evt.type === 'click') && evt.target===this._currentElement || evt.target===this._closeButton) {
      this.close();
    }
  }

  open() {
    this._currentElement.addEventListener(
      'click',
      this.closeEvent.bind(this)
    );
    document.addEventListener('keydown', this.closeEvent.bind(this));
    this._currentElement.classList.add('modal_active');
    this._event.emit('modal:open');
    return this
  }

  close() {
    this._currentElement.removeEventListener(
      'click',
      this.closeEvent.bind(this)
    );
    document.removeEventListener('keypressed', this.closeEvent.bind(this));
    this._currentElement.classList.remove('modal_active');
    this._event.emit('modal:close');
    return this
  }

  setContent(value:HTMLElement):ModalWindow {
    this._content.replaceChildren(value);
    return this
  }
  
}



