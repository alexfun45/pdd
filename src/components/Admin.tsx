import { Link } from "react-router-dom" 
type Props = {
    isLogin: boolean
  }
export default ({isLogin}: Props) => {
    return (
        <div className="admin-panel-wrapper">
            {(!isLogin) ? (
            <div id="login-block">
                <form id="login-form" method="POST">
                    <a href="#/auth" className="btn btn-toplevel btn-auth">Войти</a>
                </form>
            </div>
            ) :
            (
            <div id="admin_panel">
                 <a id="admin-btn" href="#/admin">
                    <i className="bi bi-gear"></i>админ панель
                </a>
                <div className="exit-icon" id="logout">
                    <i style={{marginRight: '3px'}} className="bi bi-box-arrow-left"></i><span>выход</span>
                </div>
            </div>
            )}
        </div>      
    )
}