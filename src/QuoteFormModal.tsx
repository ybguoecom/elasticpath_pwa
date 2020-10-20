
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-responsive-modal';
import { useFormik } from 'formik';
import { submitQuote } from './service';
import { useTranslation } from './app-state';
import { createRegistrationUrl, createPasswordResetUrl} from './routes';
import { ReactComponent as CloseIcon } from './images/icons/ic_close.svg';
import './QuoteFormModal.scss';

interface AppModalQuoteMainProps {
  handleModalClose: (...args: any[]) => any,
  openModal: boolean,
  inquiredProduct: { product: moltin.Product, imgURL: string | undefined },
}

interface FormValues {
  nameField: string,
  emailField: string,
  inquiredQuantity: number,  
}

export const QuoteFormModal: React.FC<AppModalQuoteMainProps> = (props) => {
  const { handleModalClose, openModal, inquiredProduct: { product, imgURL } } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteRequestFailed, setIsQuoteRequestFailed] = useState(false);
  const [submissionText, setSubmissionText] = useState('');

  const initialValues:FormValues = {
    nameField: '',
    emailField: '',
    inquiredQuantity: 1,
  };

  const validate = (values:any) => {
    const errors:any = {};
    if (!values.emailField) {
      errors.emailField = t('required');
    }
    if (!values.nameField) {
      errors.nameField = t('required');
    }
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
      submitQuote(values.nameField, values.emailField.toLowerCase(), product.id, values.inquiredQuantity )
        .then((result) => {
        console.log("result",result)
          resetForm();
          setSubmissionText(t(`quote-created`));
          setIsLoading(false);
        })
        .catch(error => {
          setIsLoading(false);
          console.log("error",error)
          setSubmissionText(t(`quote-error`));
          console.error(error);
        });
    },
  });

  const handleClose = () => {
    resetForm()
    handleModalClose();
  }

  return (
    <Modal open={openModal} onClose={handleClose} classNames={{ modal: 'quotedialog' }} showCloseIcon={false} >
      {
        (isLoading) ? <div className="epminiLoader --centered" /> : ('')
      }
    
      <div className={`quotedialog__content ${isLoading ? '--loading' : ''}`}>
        <div className="quotedialog__header">
          <h2 className="quotedialog__title">
            {t('request-a-quote')}
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
     
        <div className="quotedialog__body">
         
          <form className="epform" id="quote_modal_form" onSubmit={handleSubmit}>
            <div className={`epform__group ${errors.nameField ? '--error' : ''}`}>
              <label className="epform__label" htmlFor="nameField">
                {t('name')}:
              </label>
              <input className="epform__input" id="nameField" type="text" onChange={handleChange} value={values.nameField} />
              <div className="epform__error">
                {errors.nameField ? errors.nameField : null}
              </div>
            </div>
            <div className={`epform__group ${errors.emailField ? '--error' : ''}`}>
              <label className="epform__label" htmlFor="emailField">
                {t('email')}:
              </label>
              <input className="epform__input" id="emailField" type="email" onChange={handleChange} value={values.emailField} />
              <div className="epform__error">
                {errors.emailField ? errors.emailField : null}
              </div>
            </div>
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
              <button className="epbtn --primary" id="quote_modal_submit_button" type="submit" disabled={isLoading}>
                {t('submit')}
              </button>
          </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
