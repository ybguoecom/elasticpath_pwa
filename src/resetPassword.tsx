
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { useFormik } from 'formik';
import { getResetLink } from './service';
import { useCustomerData, useTranslation } from './app-state';

import './RegistrationForm.scss';

interface FormValues {
  email: string
}

export const PasswordForm: React.FC = (props) => {
  const { setCustomerData } = useCustomerData();
  const { t } = useTranslation();
  const history = useHistory();

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
          const errorsContainer = error.errors.map((el:any) => el.detail).join('\n');
          setIsLoading(false);
          setRegistrationErrors(errorsContainer);
          console.error(error);
        });
        
    },
  });

  return (
    <div className="registrationform container">
      <h1 className="eppagetitle">
        {t('request-password-reset')}
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
                    If we find your email in our system, a reset will will be sent to you.
                  </h1> :('')
             }
               
             <button className="epbtn --primary" id="registration_form_register_button" type="submit" disabled={isLoading}>
                {t('submit')}
             </button>
          </div>
          
        </form>
      </div>

    </div>
  );
};
