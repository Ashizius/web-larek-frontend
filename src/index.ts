import './scss/styles.scss';
import { CDN_URL, API_URL} from './utils/constants';
import { LarekApi } from './components/larekAPI';
import { Cart, Catalog, Order, Ware } from './components/model';
import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/view';
import {CardCatalog, CardPreview, CardBasket} from './components/card';
import { ModalWindow } from './components/modal';
import { Dialog, FormContacts, FormOrder } from './components/form';
import { CatalogView, BasketView } from './components/catalog';
import { ICardCatalog} from './types/card';
import { IWare, TOrderInfo, TWareInfo } from './types/model';
import { TError, TOrderResult } from './types';

const api=new LarekApi (CDN_URL, API_URL);
const event= new EventEmitter();


//const user= new User({});

const cart=new Cart(event);
const catalog=new Catalog(Ware, event);
const order= new Order();

const cardCatalogTemplate:HTMLTemplateElement=ensureElement<HTMLTemplateElement>('#card-catalog');
const cardBasketTemplate:HTMLTemplateElement=ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate:HTMLTemplateElement=ensureElement<HTMLTemplateElement>('#basket');
const cardPreviewTemplate:HTMLTemplateElement=ensureElement<HTMLTemplateElement>('#card-preview');
const formOrderTemplate:HTMLTemplateElement=ensureElement<HTMLTemplateElement>('#order');
const formContactsTemplate:HTMLTemplateElement=ensureElement<HTMLTemplateElement>('#contacts');
const dialogSuccessTemplate:HTMLTemplateElement=ensureElement<HTMLTemplateElement>('#success');

const pageElement:HTMLElement=ensureElement('.page');
const galleryElement:HTMLElement=ensureElement('.gallery');
const basketElement:HTMLElement=cloneTemplate(basketTemplate);
const cardPreviewElement:HTMLElement=cloneTemplate(cardPreviewTemplate);
const formOrderElement:HTMLFormElement=cloneTemplate(formOrderTemplate);
const formContactsElement:HTMLFormElement=cloneTemplate(formContactsTemplate);
const dialogSuccessElement:HTMLElement=cloneTemplate(dialogSuccessTemplate);

const pageView= new Page(pageElement,event)
const galleryView=new CatalogView<ICardCatalog<TWareInfo>,TWareInfo>(galleryElement,event,CardCatalog,cardCatalogTemplate);
const basketView=new BasketView(basketElement,event,CardBasket,cardBasketTemplate);
const modalContainer=ensureElement('#modal-container');
const modal = new ModalWindow(ensureElement('.page'),modalContainer,event);
const cardPreview= new CardPreview<TWareInfo&{isInCart:boolean}>(cardPreviewElement,event);
const formOrder=new FormOrder(formOrderElement,event);
const formContacts=new FormContacts(formContactsElement,event);
const dialogSuccess= new Dialog(dialogSuccessElement,event);

api.getWaresList().then( (itemList:TWareInfo[])=> {
    catalog.list=itemList;
    galleryView.setList(catalog.list);
}
);


let orderStep=0;
event.on('orderItems', ()=>{
    orderStep=0;
    event.emit('form:advance');
})

event.on('success', ()=>{
    modal.close();
})

event.on('form:advance', ()=>{
    orderStep+=1;
    switch (orderStep) {
        case 1:
            modal.setContent(formOrder.container).open();
        break;
        case 2:
            modal.setContent(formContacts.container).open();    
            Object.assign(order.info,formOrder.values);
        break;
        case 3:
            Object.assign(order.info,formContacts.values,{items:cart.idList,total:cart.fullprice});
            api.postOrder(order.info)
                .then((data:Partial<TOrderResult>)=>{
                    dialogSuccess.total=(data as TOrderResult).total;
                    cart.clear();
                    event.emit('cart:changeItem');
                })
                .catch ((error: string)=>{
                    if (/Товар с id [\w-]* не продается/.test(error))
                    {
                        const ware=catalog.findWare(error.replace('Товар с id ','').replace(' не продается',''));
                        if (ware) {
                            dialogSuccess.error=ware.info.title+' не продается';
                        }
                        else{
                            dialogSuccess.error=error;
                        }
                    }
                    else {
                        dialogSuccess.error=error;
                    }
                })
            modal.setContent(dialogSuccess.container).open();

        break;
        default:
            orderStep=0;
        break;
    }
})

event.on('modal:open',()=>{
    pageView.lock();
})

event.on('modal:close',()=>{
    if (orderStep>0) {
        orderStep=0;
        formContacts.reset();
        formOrder.reset();
    }
    pageView.lock(false);
})

event.on('cart:view', ()=>{
    modal.setContent(basketView.container).open();
})

event.on('cart:changeItem',(ware:IWare|undefined)=>{
    basketView.setList(cart.positions);
    basketView.fullprice=cart.fullprice;
    pageView.waresAmount=cart.amount;
    if (ware) {
        ware.isInCart=cart.contains(ware);
        if (cardPreview.id===ware.info.id){
            cardPreview.isInCart=ware.isInCart;
        }
    }
    else {
        catalog.list.forEach(wareInfo=>{
            const ware=catalog.findWare(wareInfo.id);
            ware.isInCart=cart.contains(ware);
        })
    }
    console.log(ware);
}) 

event.on('ware:addToCart',({id}:Partial<TWareInfo>)=>{
    const ware=catalog.findWare(id);
    if (ware) {
        cart.addItem(ware);
        event.emit('cart:changeItem',ware);
    }    
})

event.on('ware:removeFromCart',({id}:Partial<TWareInfo>)=>{
    const ware=catalog.findWare(id);
    if (ware) {
        cart.removeItem(ware);
        event.emit('cart:changeItem',ware);
    }
})

event.on('catalog.card:view',({id}:Partial<TWareInfo>)=>{
    const ware=catalog.findWare(id);
    if (ware) {
        cardPreview.render({...ware.info,isInCart:ware.isInCart});
        modal.setContent(cardPreview.container).open();
    }
})

event.on('Form:validate',({name,info}:{name:string,info:TOrderInfo})=>{
    switch (name) {
        case 'order':
            formOrder.error=order.validate(info);
        break;
        case 'contacts':
            formContacts.error=order.validate(info);
        break;
        default:
            formOrder.error=order.validate(info);
            formContacts.error=order.validate(info);
            break;
    }
})
