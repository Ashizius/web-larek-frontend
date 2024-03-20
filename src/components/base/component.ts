import { TAction } from '../../types';
import { IEvents } from './events';

/**
 * Базовый компонент
 */

export type TeventListener = {
  callback: TAction;
  type: string;
};

interface IComponent<T> {
  //разместить в элементе
  place(container: HTMLElement): void;
  // Вернуть корневой DOM-элемент
  get container(): HTMLElement;
  //добавить слушатель к элементу
  addListener(
    element: HTMLButtonElement | HTMLInputElement,
    type: string,
    callback: TAction
  ): void;
  //снять слушатели с элемента/элементов
  clearListeners(element?: HTMLButtonElement | HTMLInputElement): void;
  //рендерится отображение в контейнере
  render(data?: Partial<T>): Component<T>;
}

export abstract class Component<T> implements IComponent<T> {
  protected _callbacks: Map<
    HTMLButtonElement | HTMLInputElement,
    TeventListener[]
  >;
  protected constructor(
    protected readonly _container: HTMLElement,
    protected readonly _event: IEvents
  ) {
    // Учитывайте что код в конструкторе исполняется ДО всех объявлений в дочернем классе
    this._callbacks = new Map();
  }

  // Инструментарий для работы с DOM в дочерних компонентах

  // Переключить класс
  protected toggleClass(
    element: HTMLElement,
    className: string,
    force?: boolean
  ) {
    element.classList.toggle(className, force);
  }

  // Установить текстовое содержимое
  protected setText(element: HTMLElement, value: unknown) {
    if (element) {
      element.textContent = String(value);
    }
  }

  protected setLines(element: HTMLElement, value: unknown) {
    if (element) {
      if (Array.isArray(value)) {
        const subElements: Node[] = value.map((item) => {
          const subElement = element.cloneNode(false);
          subElement.textContent = String(item);
          subElements.push(subElement);
          return subElement;
        });
        element.replaceChildren(...subElements);
      } else {
        element.textContent = String(value);
      }
    }
  }

  // Сменить статус блокировки
  protected setDisabled(element: HTMLElement, state: boolean) {
    if (element) {
      if (state) element.setAttribute('disabled', 'disabled');
      else element.removeAttribute('disabled');
    }
  }

  // Скрыть
  protected setHidden(element: HTMLElement) {
    element.style.display = 'none';
  }

  // Показать
  protected setVisible(element: HTMLElement) {
    element.style.removeProperty('display');
  }

  // Установить изображение с алтернативным текстом
  protected setImage(element: HTMLImageElement, src: string, alt?: string) {
    if (element) {
      element.src = src;
      if (alt) {
        element.alt = alt;
      }
    }
  }
  //разместить в элементе
  public place(container: HTMLElement) {
    container.append(this._container);
  }
  // Вернуть корневой DOM-элемент
  public get container(): HTMLElement {
    return this._container;
  }

  public addListener(
    element: HTMLButtonElement | HTMLInputElement,
    type: string,
    callback: TAction
  ) {
    element.addEventListener(type, callback);
    if (!this._callbacks.has(element)) {
      this._callbacks.set(element, [{ type: type, callback: callback }]);
    } else {
      this._callbacks.get(element).push({ type: type, callback: callback });
    }
  }

  public clearListeners(element?: HTMLButtonElement | HTMLInputElement) {
    if (!element) {
      this._callbacks.forEach((listeners, element) => {
        listeners.forEach((listener) =>
          element.removeEventListener(listener.type, listener.callback)
        );
      });
    } else {
      this._callbacks
        .get(element)
        .forEach((listener) =>
          element.removeEventListener(listener.type, listener.callback)
        );
    }
  }

  public render(data?: Partial<T>): Component<T> {
    Object.assign(this as object, data ?? {});
    return this;
  }
}
