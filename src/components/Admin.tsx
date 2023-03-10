import { Link } from "react-router-dom" 

export default ({Logout, isLogin, role}: {Logout: React.MouseEventHandler, isLogin: boolean, role: number}) => {
    return (
        <div className="admin-panel-wrapper">
            {(!isLogin) ? (
            <div id="login-block">
                <form id="login-form" method="POST">
                    <a href="#/auth" className="menubtn btn btn-primary btn-auth">Войти</a>
                </form>
            </div>
            ) :
            (
            <div id="admin_panel">
                {(role==1 || role==2) && (
                    <a className="menubtn btn btn-primary btn-auth" id="admin-btn" href="#/admin">
                        <i className="bi bi-gear"></i>Панель управления
                    </a>
                )}
                {(role==3) && (
                   <a className="menubtn btn btn-primary btn-auth" id="admin-btn" href="#/profile">
                        <i className="bi bi-person-square"></i>Профиль
                    </a> 
                )}
                <div onClick={Logout} className="exit-icon menubtn btn btn-primary btn-auth" id="logout">
                    <i style={{marginRight: '3px'}} className="bi bi-box-arrow-left"></i><span>выход</span>
                </div>
            </div>
            )}
        </div>      
    )
}