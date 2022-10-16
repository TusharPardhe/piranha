import React, { Suspense } from 'react';
import { Route, Routes as RoutesBundle, useLocation } from 'react-router-dom';
import { ROUTES } from './constants/app.constants';

const Home = React.lazy(() => import('./modules/home/home'));

const Routes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={'Loading...'}>
      <RoutesBundle location={location}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path="/*" element={<div>Error</div>} />
      </RoutesBundle>
    </Suspense>
  );
};

export default Routes;
