import React, { useState } from 'react';
import Modal from 'react-responsive-modal';
import { useFormik } from 'formik';
import { createSubscription } from './service';
import { useTranslation, useCustomerData } from './app-state';
import { SubscriptionDetails } from './SubscriptionDetails';
import { ReactComponent as CloseIcon } from './images/icons/ic_close.svg';
import './SubscriptionFormModal.scss';

interface AppModalSubscriptionMainProps {
  handleModalClose: (...args: any[]) => any,
  openModal: boolean,
  inquiredProduct: { product: moltin.Product, imgURL: string | undefined },
 
}

interface FormValues {
  inquiredQuantity: number,  
}

export const SubscriptionFormModal: React.FC<AppModalSubscriptionMainProps> = (props) => {
  const { id:customer_id, isLoggedIn } = useCustomerData();
  const { handleModalClose, openModal, inquiredProduct: { product, imgURL } } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [Subscription, SetSubscription] = useState(null);
  const [submissionText, setSubmissionText] = useState('');

  const initialValues:FormValues = {
    inquiredQuantity: 1
  };

  const validate = (values:any) => {
    const errors:any = {};
    if (!values.inquiredQuantity) {
      errors.inquiredQuantity = t('required');
    }
    if (values.inquiredQuantity<1) {
      errors.inquiredQuantity = t('error_property_gt_x',{x: "1", property:"quantity"});
    }

    return errors;
  }

  const {handleSubmit, handleChange, resetForm, values, errors} = useFormik({
    initialValues,
    validate,
    onSubmit: (values) => {
      setIsLoading(true);
      setSubmissionText('')
      if(isLoggedIn){
      createSubscription(customer_id, product.id, values.inquiredQuantity)
        .then(async (result) => {
          resetForm();
          result= await result.json()
          console.log("result",result)
          SetSubscription(result);
          setSubmissionText(t('subscription-stripe-message'));
          setIsLoading(false);
        })
        .catch(error => {
          setIsLoading(false);
          console.log("error",error)
          SetSubscription(null);
          setSubmissionText(t('quote-error'));
          console.error(error);
        });    
      }
    },
  });

  const handleClose = () => {
    resetForm()
    SetSubscription(null);
    setSubmissionText('');
    handleModalClose();
  }

  return (
    <Modal open={openModal} onClose={handleClose} classNames={{ modal: 'quotedialog' }} showCloseIcon={false} >
      {
        (isLoading) ? <div className="epminiLoader --centered" /> : ('')
      }
    
      <div className={`subscriptiondialog__content ${isLoading ? '--loading' : ''}`}>
        <div className="subscriptiondialog__header">
          <h2 className="subscriptiondialog__title">
            {t('subscribe-form-title')}
          </h2>
          <button type="button" aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="productgrid" >
        <div className="productthumbnail__imgcontainer">
          <img className="productmainimage" src={imgURL} alt={product.name}/>
        </div>
         <div className="productthumbnail__name">
          {product.name}
        </div>
         </div>
     
        <div className="subscriptiondialog__body">
         { Subscription===null?(
          <form className="epform" id="subscription_modal_form" onSubmit={handleSubmit}>
            <div className={`epform__group ${errors.inquiredQuantity ? '--error' : ''}`}>
              <label className="epform__label" htmlFor="inquiredQuantity">
                {t('quote-quantity')}:
              </label>
              <input className="epform__input" id="inquiredQuantity" type="number" onChange={handleChange} value={values.inquiredQuantity} />
              <div className="epform__error">
                {errors.inquiredQuantity ? errors.inquiredQuantity : null}
              </div>
            </div>
            {submissionText}
            <div className="epform__group --btn-container">
              <button className="epbtn --primary" id="subscription_modal_submit_button" type="submit" disabled={isLoading}>
                {t('subscribe-form-submit')}  
              </button>
          </div>
          </form>):(
            <>
            <SubscriptionDetails subscriptionData={Subscription} /><br/>
            <div className="subscriptiondialog__title">{submissionText}</div>
            </>
            )
         }
        </div>
      </div>
    </Modal>
  );
};
