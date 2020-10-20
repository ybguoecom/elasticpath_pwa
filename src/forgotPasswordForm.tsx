import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { getResetLink } from './service';
import {  useTranslation } from './app-state';



import './RegistrationForm.scss';

interface FormValues {
  email: string
}


interface IntiState {

  location: { 
    state: {
       time?: string
    }    
  } 
}

export const PasswordForm: React.FC<IntiState> = (props) => {

  const { location: { state: { time }} } = props; 
  const { t } = useTranslation();


 
  const [registrationErrors, setRegistrationErrors] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestSent, setisRequestSent] = useState(false);
  

  const initialValues:FormValues = {
    email: ''
  };

  const validate = (values:FormValues) => {
    const errors:any = {};
    if (!values.email) {
      errors.email = t('required');
    }
    return errors;
  }
  
  useEffect(() => {
     setisRequestSent(false)
}, [time]);
  
  const {handleSubmit, handleChange, values, errors} = useFormik({
    initialValues,
    validate,
    onSubmit: (values) => {
      setRegistrationErrors('');
      setIsLoading(true);

      getResetLink(`${values.email}`)
        .then((e) => {
           setIsLoading(false);
           setisRequestSent(true)
 
           console.log(e)
        })
        .catch(error => {
          //const errorsContainer = error.errors.map((el:any) => el.detail).join('\n');
          setIsLoading(false);
          //setRegistrationErrors(errorsContainer);
          console.error(error);
          setisRequestSent(true)
        });
        
    },
  });

  return (
    <div className="registrationform container">
      <h1 className="eppagetitle">
        {t('pw-reset-request-page-title')}
      </h1>

      <div className="registrationform__feedback">
        {registrationErrors}
      </div>

      <div className={`registrationform__content ${isLoading ? '--loading' : ''}`}>
        <form className="epform" onSubmit={handleSubmit}>
          {
            (isLoading) ? <div className="epminiLoader --centered" /> : ('')
          }
        
          <div className={`epform__group ${errors.email ? '--error' : ''}`}>
            <label htmlFor="email"  className="epform__label">
              {t('email-slash-username')} *
            </label>
            <input id="email" name="email" className="epform__input" type="email" onChange={handleChange} value={values.email} />
            <div className="epform__error">
              {errors.email ? errors.email : null}
            </div>
          </div>
    
        
          <div className="epform__group --btn-container">
            {
               (isRequestSent) ?
                  <h1 className="message">
                    {t('pw-reset-request-sent')}
                  </h1> :('')
             }
               
             <button className="epbtn --primary" id="registration_form_register_button" type="submit" disabled={isLoading}>
                {t('pw-reset-request-submit')}
             </button>
          </div>
          
        </form>
      </div>

    </div>
  );
};
