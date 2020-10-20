
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { resetPassword } from './service';
import { useTranslation } from './app-state';

import './RegistrationForm.scss';

interface FormValues {
  email: string,
  password: string,
  passwordConfirm: string
}


interface FormData {
  match: { params: {token: string} }
}

export const PasswordResetForm: React.FC<FormData> = (props) => {
  const { match: { params: {token} } }= props
  const { t } = useTranslation();

  const [resetStatus, setResetStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const initialValues:FormValues = {
    email: '',
    password: '',
    passwordConfirm: ''
  };

  const validate = (values:FormValues) => {
    const errors:any = {};
    if (!values.email) {
      errors.email = t('required');
    }
    if (!values.password) {
      errors.password = t('required');
    }
    if (!values.passwordConfirm) {
      errors.passwordConfirm = t('required');
    }
    if (values.password && values.passwordConfirm && values.password !== values.passwordConfirm) {
      errors.passwordConfirm = t('password-confirm-error');
    }

    return errors;
  }

  const {handleSubmit, handleChange, values, errors} = useFormik({
    initialValues,
    validate,
    onSubmit: async(values) => {
      setResetStatus('');
      setErrorMessage('');
      setIsLoading(true);
      resetPassword(values.email, values.password, token).then((e) => {
           setIsLoading(false);
           setResetStatus("pw-reset-success")
           console.log(e)
        })
        .catch(error => {
         setErrorMessage(error)
         setResetStatus("pw-reset-error")
          //const errorsContainer = error.errors.map((el:any) => el.detail).join('\n');
          setIsLoading(false);
          //setRegistrationErrors(errorsContainer);
          console.error(error);
        });
    },
  });

  return (
    <div className="registrationform container">
      <h1 className="eppagetitle">
        {t('pw-reset-request-page-title')}
      </h1>
      
        <h2 className="eppagetitle">
        {t('pw-reset-request-page-text')}
       </h2>
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
    
             <div className={`epform__group ${errors.password ? '--error' : ''}`}>
            <label htmlFor="password" className="epform__label">
              {t('password')} *
            </label>
            <input id="password" name="password" className="epform__input" type="password" onChange={handleChange} value={values.password} />
            <div className="epform__error">
              {errors.password ? errors.password : null}
            </div>
          </div>
          <div className={`epform__group ${errors.passwordConfirm ? '--error' : ''}`}>
            <label htmlFor="passwordConfirm" className="epform__label">
              {t('password-confirmation')} *
            </label>
            <input id="passwordConfirm" name="passwordConfirm" className="epform__input" type="password" onChange={handleChange} value={values.passwordConfirm} />
            <div className="epform__error">
              {errors.passwordConfirm ? errors.passwordConfirm : null}
            </div>
          </div>
          <div className="epform__group --btn-container">
            <h1 className="eppagetitle">
                {t(resetStatus, {code: errorMessage})}
            </h1>
             <button className="epbtn --primary" id="registration_form_register_button" type="submit" disabled={isLoading}>
                {t('pw-reset-reset-button')}
             </button>
          </div>
          
        </form>
      </div>

    </div>
  );
};
