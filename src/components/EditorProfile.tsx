import React, {useState, useEffect} from 'react'
import Form from 'react-bootstrap/Form';
import request from "../utils/request";
import Button from "react-bootstrap/Button"
import {AppContext} from '../app'

type userType = {
    id: number;
    login: string;
    name: string;
    email: string;
    confirmed: number;
    role: number;
    reg_date: number;
    last_auth: number;
    isMobile: boolean;
    settings: object;
  };

let defaultUser = {
  id: 0,
  login: "",
  name: "",
  email: "",
  confirmed: 0,
  role: 3,
  isMobile: false,
  settings: {}
  };

let editUser = {};

export default ({user, setUser}:{user: userType, setUser: Function}) => {

    const [editModes, setEditModes] = useState({login: false, name: false, email: false}),
          [passwordError, setPassError] = useState(false),
          [newPassword, setNewPassword] = useState(""),
          [errorMsg, setErrorMsg] = useState("");

    const handleChange = (value: string, key: string) => {
        if(value.length<100){
            setUser({...user, [key]: value});
            editUser = {...user, [key]: value};
        }
    }

    const enterValue = (event: any, key: string) => {
        if(event.keyCode==13){
            //setEditModes({...editModes, [key]: false});
            saveUser(key);
        }
    }

    const checkPassword = (event: any) => {
        let v = event.target.value;
        if(v.length<8){
            setPassError(true);
            setErrorMsg("Пароль должен содержать не меньше 8 символов");
            return;
        }
        if( !((/[0-9]/.test(v)) && (/[A-Z]/.test(v))) ){
            setPassError(true);
               setErrorMsg("Пароль должен содержать буквы и цифры и символы в верхнем и нижнем регистре");
            return;
        }
        setPassError(false);
        setErrorMsg("");
        setNewPassword(v);
    }

    const saveUser = (key: string) => {
        setEditModes({...editModes, [key]: false});
        request({method: "post", data: {action: "editUser", data: {...user}}});
        
    }

    const changePassword = () => {
        if(!passwordError){
            request({method: "post", data: {action: "changePassword", data: {userId: user.id, password: newPassword}}});  
        }
    }

    return (
        <div>
            
            {(user.confirmed==0) &&
                <div className="confirm-msg">Вы не подтвердили свой аккаунт. Проверьте почту и перейдите по ссылке для подтверждения регистрации, иначе вам будет недоступно редактирование профиля.</div>
            }
            <div className="profileBody">
                <div><label>Логин</label>
                    <span>
                        {( (editModes.login) && (user.confirmed==1)) ?
                            (<Form.Control
                                type="text"
                                id="loginText"
                                value={user.login}
                                onChange={(e)=>handleChange(e.target.value, 'login')}
                                onKeyDown={(e)=>enterValue(e, 'login')}
                                onBlur={()=>saveUser('login')}
                            />) :
                            (<span>{user.login}<i onClick={()=>{console.log("confirmed", user.confirmed); setEditModes({...editModes, ['login']: true})}} className="bi bi-pencil-square mini-btn"></i></span>)
                        }
                    </span>
                </div>
                <div><label>Имя</label><span>
                    {(editModes.name && user.confirmed==1) ?
                                (<Form.Control
                                    type="text"
                                    id="nameText"
                                    value={user.name}
                                    onChange={(e)=>handleChange(e.target.value, 'name')}
                                    onKeyDown={(e)=>enterValue(e, 'name')}
                                    onBlur={()=>saveUser('name')}
                                />) :
                                (<span>{user.name}<i onClick={()=>setEditModes({...editModes, ['name']: true})} className="bi bi-pencil-square mini-btn"></i></span>)
                            }
                            </span></div>
                    <div><label>email</label><span>
                        {(editModes.email && user.confirmed==1) ?
                                    (<Form.Control
                                        type="text"
                                        id="emailText"
                                        value={user.email}
                                        onChange={(e)=>handleChange(e.target.value, 'email')}
                                        onKeyDown={(e)=>enterValue(e, 'email')}
                                        onBlur={()=>saveUser('email')}
                                    />) :
                                    (<span>{user.email}<i onClick={()=>setEditModes({...editModes, ['email']: true})} className="bi bi-pencil-square mini-btn"></i></span>)
                                }</span></div>
                        <div className="password-field">
                                <div>
                                    <Form.Control
                                        type="password"
                                        id="passwordText"
                                        onChange={(e)=>checkPassword(e)}
                                    />
                                    <div className="error-msg">{errorMsg}</div>
                                </div>
                                        <Button onClick={changePassword}>изменить пароль</Button></div>
            </div>
        </div>
    )
}