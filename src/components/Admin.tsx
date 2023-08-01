import React, {useEffect, useState} from 'react'
import { Button } from "react-bootstrap"
import * as actions from "../store/userActions";
import { useDispatch } from "react-redux";
import { connect } from 'react-redux';
import {AppContext} from '../app'

const mapStateToProps = (state:any) => {
    return {
      data: state
    }
  }

const AdminComponent = (props: any) => {

        const context = React.useContext(AppContext);
        const dispatch = useDispatch();
        let user = props.data.user;
        return (
            <div className="admin-panel-wrapper">
                {(!props.data.isAuthenticated) ? (
                <div id="login-block">
                    <form id="login-form" method="POST">
                        {(context.isMobile) ? 
                            (<Button href="#/auth" className="blue-btn" variant="primary">Войти</Button>)
                            :
                            (<a href="#/auth" className="adminpanel-btn btn btn-primary btn-auth">Войти</a>)
                        }
                    </form>
                </div>
                ) :
                (
                <div id="admin_panel">
                    {((user.role==1 || user.role==2) && !context.isMobile) && (
                        <a className="adminpanel-btn btn btn-primary btn-auth" id="admin-btn" href="#/admin">
                            Личный кабинет
                        </a>
                    )}
                    {(user.role==3) && (
                    <a className="adminpanel-btn btn btn-primary btn-auth" id="admin-btn" href="#/profile">
                            <i className="bi bi-person-square"></i>Личный кабинет
                        </a> 
                    )}
                    <div onClick={()=>dispatch(actions.Logout())} className="adminpanel-btn exit-icon btn btn-primary btn-auth" id="logout">
                        <i style={{marginRight: '3px'}} className="bi bi-box-arrow-left"></i><span>выход</span>
                    </div>
                </div>
                )}
            </div>    
    )
}

//export default AdminComponent;
export default connect(mapStateToProps)(AdminComponent);