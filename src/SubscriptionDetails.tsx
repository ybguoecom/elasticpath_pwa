import React from 'react';
import { useTranslation } from './app-state';

import './OrderDetails.scss';

export const SubscriptionDetails: React.FC<any> = (props) => {
  const { t } = useTranslation();
  const { ep_order={}, stripe_subscription={} } = props.subscriptionData;

  return (
        <div >
           <div className="productthumbnail__name">{t('subscription-ep-order-id')}</div>
           <div className="epform__label">{ep_order.id}</div>
           <div className="productthumbnail__name" >{t('subscription-stripe-subscription-id')}</div>
           <div className="epform__label">{stripe_subscription.id}</div>
        </div>
  )
}