import {useEffect, useState} from 'react'
import { Button } from "react-bootstrap"
import $ from 'jquery'

export default ({Logout, isLogin, role, isMobile}: {Logout: React.MouseEventHandler, isLogin: boolean, role: number, isMobile: boolean}) => {

    /*useEffect(()=>{
        $('.footer-edit-btn').click(function(){
            $("#footer-wrapper").hide();
            $(this).parent().append('<textarea id="summernote" name="editordata"></textarea>');
            $('#summernote').summernote();
        });
    }, []);*/

    return (
        <div className="admin-panel-wrapper">
            {(!isLogin) ? (
            <div id="login-block">
                <form id="login-form" method="POST">
                    {(isMobile) ? 
                        (<Button href="#/auth" className="blue-btn" variant="primary">Войти</Button>)
                        :
                        (<a href="#/auth" className="adminpanel-btn btn btn-primary btn-auth">Войти</a>)
                    }
                </form>
            </div>
            ) :
            (
            <div id="admin_panel">
                {((role==1 || role==2) && !isMobile) && (
                    <a className="adminpanel-btn btn btn-primary btn-auth" id="admin-btn" href="#/admin">
                        <i className="bi bi-gear"></i>
                    </a>
                )}
                {(role==3) && (
                   <a className="adminpanel-btn btn btn-primary btn-auth" id="admin-btn" href="#/profile">
                        <i className="bi bi-person-square"></i>Профиль
                    </a> 
                )}
                <div onClick={Logout} className="adminpanel-btn exit-icon btn btn-primary btn-auth" id="logout">
                    <i style={{marginRight: '3px'}} className="bi bi-box-arrow-left"></i><span>выход</span>
                </div>
            </div>
            )}
        </div>      
    )
}