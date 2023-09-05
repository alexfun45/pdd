import React, {useState, useEffect} from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import { connect } from "react-redux";

  const mapStateToProps = (state:any) => ({
      isAuthenticated: state.isAuthenticated,
      role: state.role
    });

const AdminRoute = (props: any) => {

    const {component: Component, isAuthenticated, role} = props;
    const [isAuth, setAuth] = useState(isAuthenticated);
    useEffect(()=>{
      setAuth(isAuth);
    }, [isAuthenticated])

    if(isAuth===null) return <div></div>;
    if(isAuth===false && (role!=1 && role!=2)){
      return <Navigate to="/auth" replace />
    }
    else
      return <Component />
};





export default connect(
    mapStateToProps,
  )(AdminRoute)
