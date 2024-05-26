import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../../../Store';

function AdminRouteMain({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo && userInfo.isAdmin ? children : <Navigate to="/signin" />;
}

{
  /**Navigate is a component wrapper around useNavigate() hook and is rendered when called with the changed location. It accepts the same arguments in useNavigate() hook as  props*/
}

export default AdminRouteMain;