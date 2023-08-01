import React from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import { connect } from "react-redux";

  const mapStateToProps = (state:any) => ({
      isAuthenticated: state.isAuthenticated,
      role: state.user.role
    });

/*export const PrivateRouteHOC = (Component: any, auth: any) => {
  const PrivateRoute = ({ ...rest }) =>
    auth.isAuthenticated === true ? (
      <Component {...rest} />
    ) : (
      <Navigate to="/login" />
    );

  return connect((state) => (mapStateToProps))(PrivateRouteHOC);
};*/

const AdminRoute = (props: any) => {
    const {component: Component, isAuthenticated, role} = props;
    if(!isAuthenticated){
      return <Navigate to="/auth" replace />
    }
    else
      return <Component />
   /* return (
        <Route {...rest} render={(props:any)=>( 
          <Component {...props} />
        )} />
    );
   return isAuthenticated ? (
        <Route {...rest} />
        ) :
        (
        <Route {...rest} element={<Navigate to="/auth" replace />} />
        )*/
};





export default connect(
    mapStateToProps,
  )(AdminRoute)
