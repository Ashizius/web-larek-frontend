import './scss/styles.scss';
import { CDN_URL, API_URL } from './utils/constants';
import { LarekApi } from './components/larekAPI';
import { Cart, Catalog, Order, Ware } from './components/model';
import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/view';
import { CardCatalog, CardBasket } from './components/card';
import { ModalWindow } from './components/modal';
import { Dialog, FormContacts, FormOrder } from './components/form';
import { CatalogView, BasketView } from './components/catalog';
import { ICardCatalog } from './types/card';
import { IWare, TOrderInfo, TWareInfo } from './types/model';
import { TOrderResult } from './types';

const api = new LarekApi(CDN_URL, API_URL);
const eventEmitter = new EventEmitter();

const cart = new Cart();
const catalog = new Catalog(Ware, eventEmitter);
const order = new Order();

const cardCatalogTemplate: HTMLTemplateElement =
  ensureElement<HTMLTemplateElement>('#card-catalog');
const cardBasketTemplate: HTMLTemplateElement =
  ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate: HTMLTemplateElement =
  ensureElement<HTMLTemplateElement>('#basket');
const cardPreviewTemplate: HTMLTemplateElement =
  ensureElement<HTMLTemplateElement>('#card-preview');
const formOrderTemplate: HTMLTemplateElement =
  ensureElement<HTMLTemplateElement>('#order');
const formContactsTemplate: HTMLTemplateElement =
  ensureElement<HTMLTemplateElement>('#contacts');
const dialogSuccessTemplate: HTMLTemplateElement =
  ensureElement<HTMLTemplateElement>('#success');

const pageElement: HTMLElement = ensureElement('.page');
const galleryElement: HTMLElement = ensureElement('.gallery');
const basketElement: HTMLElement = cloneTemplate(basketTemplate);
const cardPreviewElement: HTMLElement = cloneTemplate(cardPreviewTemplate);
const modalContainer = ensureElement('#modal-container');
const formOrderElement: HTMLFormElement = cloneTemplate(formOrderTemplate);
const formContactsElement: HTMLFormElement =
  cloneTemplate(formContactsTemplate);
const dialogSuccessElement: HTMLElement = cloneTemplate(dialogSuccessTemplate);

const pageView = new Page(pageElement, eventEmitter);

const galleryView = new CatalogView<ICardCatalog<TWareInfo>, TWareInfo>(
  galleryElement,
  eventEmitter,
  CardCatalog,
  cardCatalogTemplate,
  (card) => {
    card.setAction(() => {
      eventEmitter.emit('catalog.card:view', { id: card.id });
    });
  }
);

const basketView = new BasketView(
  basketElement,
  eventEmitter,
  CardBasket,
  cardBasketTemplate,
  (card) => {
    card.setAction(() => {
      eventEmitter.emit('ware:removeFromCart', { id: card.id });
    });
  }
);

const cardPreview = new CardCatalog<TWareInfo & { isInCart: boolean }>(
  cardPreviewElement,
  eventEmitter,
  '.card__button'
);

cardPreview.setAction(() => {
  if (!cardPreview.isInCart) {
    eventEmitter.emit('ware:addToCart', { id: cardPreview.id });
    cardPreview.isInCart = true;
  } else {
    eventEmitter.emit('ware:removeFromCart', { id: cardPreview.id });
    cardPreview.isInCart = false;
  }
});

const modal = new ModalWindow(pageElement, modalContainer, eventEmitter);
const formOrder = new FormOrder(formOrderElement, eventEmitter);
const formContacts = new FormContacts(formContactsElement, eventEmitter);
const dialogSuccess = new Dialog(dialogSuccessElement, eventEmitter);

let orderStep = 0;

api.getWaresList().then((itemList: TWareInfo[]) => {
  catalog.list = itemList;
});

eventEmitter.on('catalog:changed', () => {
  galleryView.setList(catalog.list);
});

eventEmitter.on('modal:open', () => {
  pageView.lock();
});

eventEmitter.on('modal:close', () => {
  if (orderStep > 0) {
    orderStep = 0;
    formContacts.reset();
    formOrder.reset();
  }
  pageView.lock(false);
});

eventEmitter.on('catalog.card:view', ({ id }: Partial<TWareInfo>) => {
  const ware = catalog.findWare(id);
  if (ware) {
    cardPreview.render({ ...ware.info, isInCart: ware.isInCart });
    modal.setContent(cardPreview.container).open();
  }
});

eventEmitter.on('cart:changeItem', (ware: IWare | undefined) => {
  basketView.setList(cart.positions);
  basketView.fullprice = cart.fullprice;
  pageView.waresAmount = cart.amount;
  if (ware) {
    ware.isInCart = cart.contains(ware);
    if (cardPreview.id === ware.info.id) {
      cardPreview.isInCart = ware.isInCart;
    }
  } else {
    catalog.list.forEach((wareInfo) => {
      const ware = catalog.findWare(wareInfo.id);
      if (ware) {
        ware.isInCart = cart.contains(ware);
      }
    });
  }
});

eventEmitter.on('ware:addToCart', ({ id }: Partial<TWareInfo>) => {
  const ware = catalog.findWare(id);
  if (ware) {
    cart.addItem(ware);
    eventEmitter.emit('cart:changeItem', ware);
  }
});

eventEmitter.on('ware:removeFromCart', ({ id }: Partial<TWareInfo>) => {
  const ware = catalog.findWare(id);
  if (ware) {
    cart.removeItem(ware);
    eventEmitter.emit('cart:changeItem', ware);
  }
});

eventEmitter.on('orderItems', () => {
  orderStep = 0;
  eventEmitter.emit('form:advance');
});

eventEmitter.on('form:advance', () => {
  orderStep += 1;
  switch (orderStep) {
    case 1:
      modal.setContent(formOrder.container).open();
      break;
    case 2:
      Object.assign(order.info, formOrder.values);
      modal.setContent(formContacts.container).open();
      break;
    case 3:
      Object.assign(order.info, formContacts.values, {
        items: cart.idList,
        total: cart.fullprice,
      });
      api
        .postOrder(order.info)
        .then((data: TOrderResult) => {
          dialogSuccess.total = data.total;
          cart.clear();
          eventEmitter.emit('cart:changeItem');
        })
        .catch((error: string) => {
          if (/Товар с id [\w-]* не продается/.test(error)) {
            const ware = catalog.findWare(
              error.replace('Товар с id ', '').replace(' не продается', '')
            );
            if (ware) {
              dialogSuccess.error = ware.info.title + ' не продается';
            } else {
              dialogSuccess.error = error;
            }
          } else {
            dialogSuccess.error = error;
          }
        });
      modal.setContent(dialogSuccess.container).open();

      break;
    default:
      orderStep = 0;
      break;
  }
});

eventEmitter.on(
  'form:validate',
  ({ name, info }: { name: string; info: TOrderInfo }) => {
    switch (name) {
      case 'order':
        formOrder.error = order.validate(info);
        break;
      case 'contacts':
        formContacts.error = order.validate(info);
        break;
      default:
        formOrder.error = order.validate(info);
        formContacts.error = order.validate(info);
        break;
    }
  }
);

eventEmitter.on('success', () => {
  modal.close();
});

eventEmitter.on('cart:view', () => {
  modal.setContent(basketView.container).open();
});
