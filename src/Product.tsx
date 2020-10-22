import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useResolve, useProductImages } from './hooks';
import { addToCart, loadProductBySlug, getProductWithCustomerToken } from './service';
import { CompareCheck } from './CompareCheck';
import { SocialShare } from './SocialShare';
import { useTranslation, useCurrency, useCartData, useCustomerData } from './app-state';
import { isProductAvailable } from './helper';
import { Availability } from './Availability';
import { VariationsSelector } from './VariationsSelector';
import { QuoteFormModal } from "./QuoteFormModal";
import { SubscriptionFormModal } from "./SubscriptionFormModal";
import { LoginDialog } from "./LoginDialog";

import './Product.scss';


interface ProductParams {
  productSlug: string;
}

export const Product: React.FC = () => {
  const { productSlug } = useParams<ProductParams>();
  const { token, isLoggedIn } = useCustomerData();
  const { t } = useTranslation();
  const { selectedLanguage } = useTranslation();
  const { selectedCurrency } = useCurrency();
  const { updateCartItems } = useCartData();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [specialPrice, setSpecialPrice] = useState({ formatted: null , amount: null, currency: null});
  

  const [product] = useResolve(
    async () => loadProductBySlug(productSlug, selectedLanguage, selectedCurrency),
    [productSlug, selectedLanguage, selectedCurrency]
  );
  const [productId, setProductId] = useState('');

  useEffect(() => {
    product && setProductId(product.id);
  }, [product])
  
  useEffect(() => {
    if(isLoggedIn) {
        token && product && (async ()=>{
            let specialPrice = await getProductWithCustomerToken(product.id,token)
            specialPrice = await specialPrice.json()
            specialPrice && specialPrice.membership_pricing && setSpecialPrice(specialPrice.membership_pricing[0].price[0])
            })()
    } else
    { 
        setSpecialPrice({ formatted: null , amount: null, currency: null})
    }
  }, [product,isLoggedIn,token])
   

  const productImageHrefs = useProductImages(product);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isPrevImageVisible = currentImageIndex > 0;
  const isNextImageVisible = currentImageIndex < (productImageHrefs?.length ?? 0) - 1;
  const productBackground = product?.background_color ?? '';

  const handlePrevImageClicked = () => {
    setCurrentImageIndex(currentImageIndex - 1);
  };

  const handleAddToCart = () => {
    const mcart = localStorage.getItem('mcart') || '';
    addToCart(mcart, productId)
      .then(() => {
        updateCartItems()
    })
  };
  
  const handleActionRequest = () => {
    setIsActionModalOpen(true)

  };

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false)

  };

  const handleNextImageClicked = () => {
    setCurrentImageIndex(currentImageIndex + 1);
  };

  function handleVariationChange(childID: string) {
    setProductId(childID);
  }

  return (
    <div className="product">
      {product ? (
        <div className="product__maincontainer">
          <div className="product__imgcontainer">
            {productImageHrefs.length > 0 && (
              <>
                <img className="product__img" src={productImageHrefs?.[currentImageIndex]} alt={product.name} style={{ backgroundColor: productBackground }} />
                {isPrevImageVisible && (
                  <button className="product__previmagebtn" aria-label={t('previous-image')} onClick={handlePrevImageClicked}>
                    <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                )}
                {isNextImageVisible && (
                  <button className="product__nextimagebtn" aria-label={t('next-image')} onClick={handleNextImageClicked}>
                    <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7"></path></svg>
                  </button>
                )}
              </>
            )}
          </div>
          <div className="product__details">
            <h1 className="product__name">
              {product.name}
            </h1>
            <div className="product__price" style={ specialPrice.formatted?{ textDecorationLine: 'line-through' }:{}} >
              {product.meta.display_price.without_tax.formatted}   
            </div>
            { specialPrice.formatted &&
              <div className="product__price" style={{"color":"red"}}>
              YOUR PRICE: { specialPrice.formatted}
               </div>
              
            }
            <Availability available={isProductAvailable(product)} />
            <div className="product__comparecheck">
              <CompareCheck product={product} />
            </div>
            {
              product.meta.variations
                ? <VariationsSelector product={product} onChange={handleVariationChange} />
                : ''
            }
           
            <span className="product__moltinbtncontainer">
              {productId && product.purchasable &&
                <button
                  className="epbtn --secondary"
                  style={{marginRight:"1em"}}
                  onClick={handleAddToCart}
                >{t('add-to-cart')}</button>
              }
              {productId && product.quotable &&
                <button
                  className="epbtn --secondary"
                  style={{marginRight:"1em"}}
                  onClick={handleActionRequest}
                >{t('request-a-quote')}</button>
              }
              {productId && product.sub_id && (isLoggedIn?
                <button
                  className="epbtn --secondary"
                  style={{marginRight:"1em"}}
                  onClick={handleActionRequest}
                >{t('subscribe-button-ok')}</button>: <div>
                <button className="epbtn --secondary" type="button" onClick={handleActionRequest}>
                    {t('subscribe-button-login-required')}
                </button>
                <LoginDialog openModal={isActionModalOpen} handleModalClose={handleCloseActionModal} />
                </div>)
              }
            </span>
            <div className="product__description">
              {product.description}
            </div>
            <div className="product__socialshare">
              <SocialShare name={product.name} description={product.description} imageHref={productImageHrefs?.[0]} />
            </div>
          </div>
          {productId && product.quotable &&
             <QuoteFormModal openModal={isActionModalOpen} handleModalClose={handleCloseActionModal} inquiredProduct={{product,imgURL: productImageHrefs?.[0]}} />
          }
          {productId && product?.sub_id && isLoggedIn &&
             <SubscriptionFormModal openModal={isActionModalOpen} handleModalClose={handleCloseActionModal} inquiredProduct={{product,imgURL: productImageHrefs?.[0]}}  />
          }
        </div>
      ) : (
        <div className="loader" />
      )}
    </div>
  );
};
