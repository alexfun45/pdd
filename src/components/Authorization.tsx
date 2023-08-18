import React, {useState, useEffect} from 'react'
import "../css/auth.css"
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from "react-bootstrap/Button"
import {useForm} from 'react-hook-form'
import Form from 'react-bootstrap/Form';
import { useParams, useNavigate } from "react-router-dom";
import LoginMobile from './LoginMobile'
import request from '../utils/request'
import * as actions from "../store/userActions";
import { useDispatch } from "react-redux";
import {AppContext} from '../app'
import { gapi } from 'gapi-script';
import store from '../store/store'

type InputSingInTypes = {
    login: string; 
    password: string;
  };

type InputSignUpTypes = {
    login2: string;
    name2: string;
    email2: string;
    password2: string;
    cppassword: string;
}

type emailRecoveryType = {
    email_recovery: string;
}

type userType = {
    id: number;
    name: string;
    login: string;
    email: string;
    role: number;
    password: string;
};

export default () => {
    let navigate = useNavigate();
    const [users, setUsers] = useState<userType[]>([]),
          [isForgot, setForgot] = useState(false),
          [SendingEmail, setSendingEmail] = useState(false);
    const {register, handleSubmit, setError, watch, setValue, formState: { errors } } = useForm<InputSingInTypes>({mode: 'onBlur'});
    const {register: register2, handleSubmit:handleSubmit2, watch:watch2, formState: { errors: errors2 } } = useForm<InputSignUpTypes>({mode: 'onBlur'});
    const {register: register3, handleSubmit: handleSubmit3, formState: {errors: errors3}} = useForm<emailRecoveryType>({mode: 'onBlur'});
    const onSubmit = (data: {login:string, password:string}) => {
        store.dispatch(actions.Login(data));
    }
    /*const onSubmit = (data: {login:string, password:string}) => { 
        request({method: "post", data: {action: "login", data: {login: data.login, password: data.password}}}).then((response)=>{
            const {data} = response;
            if(data==true){
                navigate("/");
                document.location.href = "./";
            }
            else{
                setError('password', {
                    type: "server",
                    message: 'Неверный логин или пароль',
                });
            }
        });
     }*/
    const onSubmit2 = (data: {login2:string, name2: string, password2:string, email2: string}) => {
            store.dispatch(actions.SignUp(data));
        }

    const onSubmit3 = (data: {email_recovery: string}) => {
        request({method: "post", data: {action: "email_recovery", data: {email: data.email_recovery}}});
        setSendingEmail(true);
        setTimeout(()=>{
            setSendingEmail(false);
            setForgot(false);
        }, 3000);
    }
    
    const handleForgotBtn = (event: any) => {
        event.preventDefault();
        setForgot(true);
    }

    const handlePrev = () => {
        setSendingEmail(false);
        setForgot(false);
    }

    const _onInit = (auth2:any) => {
        console.log('init OK', auth2)
      }
      const _onError = (err:any) => {
        console.log('error', err);
      }

    useEffect(()=>{
        request({method: 'post', data: {action: 'getUsers'}}).then(response => {
            const {data} = response;
            setUsers(data);
        });

        gapi.load('auth2', function() {
            gapi.auth2
              .init({ // не забудьте указать ваш ключ в .env
                client_id:
                    process.env.APP_GOOGLE_CLIENT_ID,
              })
              .then(_onInit, _onError)
          });
            //console.log("GOOGLE_CLIENT_ID", process.env.APP_GOOGLE_CLIENT_ID);
            //revokeAccess();
    }, []);

    const toHomePage = () => {
        navigate("/");
    }

    const trySampleRequest = () => {
        var accessToken = localStorage.getItem('oauth2-test-params');
        if (accessToken) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET',
              'https://www.googleapis.com/drive/v3/about?fields=user&' +
              'access_token=' + accessToken);
          xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
              console.log("response", xhr.response);
            } else if (xhr.readyState === 4 && xhr.status === 401) {
              // Token invalid, so prompt for user permission.
              signIn();
            }
          };
          xhr.send(null);
        } else {
            signIn();
        }
      }

    function revokeAccess() {
        // Google's OAuth 2.0 endpoint for revoking access tokens.
        var revokeTokenEndpoint = 'https://oauth2.googleapis.com/revoke';
      
        // Create <form> element to use to POST data to the OAuth 2.0 endpoint.
        var form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', revokeTokenEndpoint);
      
        // Add access token to the form so it is set as value of 'token' parameter.
        // This corresponds to the sample curl request, where the URL is:
        //      https://oauth2.googleapis.com/revoke?token={token}
        let accessToken = 'xJYSnBxr8_gdv0erGM0t7nd_0i9wm6sktH2d3nkzFJxfsX7KG2M79si4T0NNKGzk3mwNgY_7AL_83rbxRJaCgYKAcQSARMSFQHsvYlsaIpe61EUhTtT3tshvsICrw0163';
        //let accessToken = localStorage.getItem('oauth2-test-params');
        var tokenField = document.createElement('input');
        tokenField.setAttribute('type', 'hidden');
        tokenField.setAttribute('name', 'token');
        tokenField.setAttribute('value', accessToken);
        form.appendChild(tokenField);
      
        // Add form to page and submit it to actually revoke the token.
        document.body.appendChild(form);
        form.submit();
      
      }
    

    const signIn = () => {
        // Google's OAuth 2.0 endpoint for requesting an access token
        var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

        // Create element to open OAuth 2.0 endpoint in new window.
        var form = document.createElement('form');
        form.setAttribute('method', 'GET'); // Send as a GET request.
        form.setAttribute('action', oauth2Endpoint);
        
        // Parameters to pass to OAuth 2.0 endpoint.
        var params:any = {
                    'client_id': process.env.APP_GOOGLE_CLIENT_ID,
                    'redirect_uri': 'https://www.pddlife.ru/',
                    'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly',
                    'state': 'try_sample_request',
                    'include_granted_scopes': 'true',
                    'response_type': 'token'};

        // Add form parameters as hidden input values.
        let p: any = "";
        for (p in params) {
            var input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', p);
            input.setAttribute('value', params[p]);
            form.appendChild(input);
        }

        // Add form to page and submit it to open the OAuth 2.0 endpoint.
        document.body.appendChild(form);
        form.submit();

    }

    const signIn2 = () => {
        const auth2 = gapi.auth2.getAuthInstance()
        auth2.signIn().then(googleUser => {
        
          // метод возвращает объект пользователя
          // где есть все необходимые нам поля
          const profile = googleUser.getBasicProfile()
          console.log('ID: ' + profile.getId()) // не посылайте подобную информацию напрямую, на ваш сервер!
          console.log('Full Name: ' + profile.getName())
          console.log('Given Name: ' + profile.getGivenName())
          console.log('Family Name: ' + profile.getFamilyName())
          console.log('Image URL: ' + profile.getImageUrl())
          console.log('Email: ' + profile.getEmail())
    
          // токен
          const id_token = googleUser.getAuthResponse().id_token
          console.log('ID Token: ' + id_token)
        })
      }
      
      const signOut = () => {
        const auth2 = gapi.auth2.getAuthInstance()
        auth2.signOut().then(function() {
          console.log('User signed out.')
        })
      }

    return (
        <>
        <div className="wrapper">
            <div className="mainContainer">
                <div style={{width: '100%', textAlign: 'center'}}><a onClick={toHomePage} className="homeLink"><i className="bi bi-house"></i>На главную</a></div>
                <div className={(!isForgot)?"hide":""}>
                    <div className="top-btn-panel"><input onClick={handlePrev} className="btn-control" value="< Назад" type="button" /></div>
                    <div className="tab-content">
                        <Form onSubmit={handleSubmit3(onSubmit3)}>
                            <div className={(SendingEmail)?"":"hide"}>На указанную почту отправлено письмо с инструкцией для восстановления пароля</div>
                            <Form.Group className={(!SendingEmail)?"mb-3":"md-3 hide"} controlId="exampleForm.ControlInput1">
                                <Form.Label>Введите email, который был указан вами при регистрации. На него придет письмо с инструкцией по восстановлению</Form.Label>
                                <Form.Control {...register3("email_recovery", {
                                            required: "Поле обязательно",
                                            maxLength: 50,
                                            pattern: {
                                                value: /^[a-zA-Z0-9@\._$\'\-#%\&\/]+$/i,
                                                message: "Пробелы недопустимы",
                                            },
                                            validate: {
                                                isEmail: v => /^[a-zA-Z0-9@\._$\'\-#%\&\/]+?@[a-zA-Z0-9@\._$\'\-#%\&\/]+/.test(v) || "некорретный формат email"
                                            }})
                                            } type="email" placeholder="name@example.com" />
                                {<p className="error-msg">{errors3.email_recovery && errors3.email_recovery.message}</p>}
                                <div className="btn"><input id="sendToEmail" value="Отправить" type="submit" /></div>
                            </Form.Group>
                        </Form>
                    </div>
                </div>
                <div className={(isForgot)?"hide":"auth_container"}>
                    <Tabs
                        defaultActiveKey="signin"
                        id="justify-tab-example"
                        className="mb-3"
                        >
                        <Tab eventKey="signin" title="Войти">
                            <form onSubmit={handleSubmit(onSubmit)} action="./admin.php" id="login-form" method="POST" className="sign_in">
                                <div className="input_field">
                                    <input type="login" 
                                        {...register("login", {
                                            required: "Поле обязательно",
                                            maxLength: 50,
                                            pattern: {
                                                value: /^[A-Za-z0-9\-@&%_\.]+$/i,
                                                message: "Недопустимые символы",
                                                },
                                            })} 
                                        name="login" placeholder="логин" className="input required" />
                                        {<p className="error-msg"> {errors.login && errors.login.message}</p>}
                                </div>
                                <div className="input_field">
                                    <input
                                        {...register("password")}
                                        type="password" placeholder="пароль" className="input" />
                                    {<p className="error-msg">{errors.password && errors.password.message}</p>}
                                </div>
                                <div style={{width: '100%', textAlign: 'center'}}>
                                    <div className="btn"><input id="signin" value="Войти" type="submit" /></div>
                                    <div className="btn"><input onClick={handleForgotBtn} id="passforgot" value="Забыли пароль?" type="submit" /></div>
                                </div>
                                <input name="call" value="signin" type="hidden" />
                                <div className="auth-block" style={{textAlign: 'center'}}><div onClick={signIn}><img style={{maxWidth: '25px', float: 'left'}} src='./img/icons8-google-48.png' />Google</div></div>
                            </form>
                        </Tab>
                        <Tab eventKey="signUp" title="Регистрация">
                            <form onSubmit={handleSubmit2(onSubmit2)} action="./admin.php" method="POST" id="signup" className="sign_up">
                                <div className="input_field">
                                    <input type="login2" {
                                        ...register2("login2", {
                                            required: "Поле обязательно",
                                            maxLength: 50,
                                            pattern: {
                                                value: /^[A-Za-z0-9_@$#\/&\'\(\)%]+$/i,
                                                message: "недопустимые символы",
                                                },
                                            validate:{
                                                 isLoginExist: v => (users.find(user => {return user.login==v})===undefined) || "этот логин уже занят"
                                            }
                                            })}  placeholder="логин" className="input" />
                                    {<p className="error-msg">{errors2.login2 && errors2.login2.message}</p>}
                                </div>
                                <div className="input_field">
                                    <input type="name2" {
                                        ...register2("name2", {
                                            required: "Поле обязательно",
                                            maxLength: 50,
                                            pattern: {
                                                value: /[а-яА-Яa-zA-Z]+$/i,
                                                message: "допустимы только символы",
                                                },
                                            })}  placeholder="имя" className="input" />
                                    {<p className="error-msg">{errors2.name2 && errors2.name2.message}</p>}
                                </div>
                                <div className="input_field">
                                    <input type="email2" {
                                        ...register2("email2", {
                                            required: "Поле обязательно",
                                            maxLength: 50,
                                            pattern: {
                                                value: /^[A-Za-zа-яА-Я0-9@\._$\'\-#%\&\/]+$/i,
                                                message: "недопустимые символы",
                                            },
                                            validate: {
                                                isEmail: v => /^[a-zA-Z0-9@\._$\'\-#%\&\/]+?@[a-zA-Z0-9@\._$\'\-#%\&\/]+/.test(v) || "некорретный формат email",
                                                isEmailExist: v => (users.find(user => {return user.email==v})===undefined) || "этот email уже занят"
                                            }
                                        }
                                    )}
                                        placeholder="e-mail" id="email" className="input" />
                                        {<p className="error-msg">{errors2.email2 && errors2.email2.message}</p>}
                                </div>
                                <div className="input_field">
                                    <input type="password"
                                        {...register2(
                                            "password2",{
                                                required: "Поле обязательно",
                                                maxLength: 50,
                                                minLength: {
                                                    value:8,
                                                    message: "пароль должен быть не менее 8 символов"
                                                },
                                                validate: {
                                                    isSafe: v => ((/[0-9]/.test(v)) && (/[A-Z]/.test(v))) || "пароль должен содержать буквы и цифры и символы в верхнем и нижнем регистре"
                                                } 
                                            }
                                        )
                                    }
                                    placeholder="пароль" className="input" />
                                    {<p className="error-msg">{errors2.password2 && errors2.password2.message}</p>}
                                </div>
                                <div className="input_field">
                                    <input type="password"
                                        {...register2(
                                            "cppassword",{
                                                required: "Поле обязательно",
                                                validate: {
                                                    isSame :(v: string) => { if(v!=watch2('password2')) return "пароли не совпадают" }
                                                } 
                                            }
                                        )
                                    }
                                    placeholder="повторите пароль" className="input" />
                                    {<p className="error-msg">{errors2.cppassword && errors2.cppassword.message}</p>}
                                </div>
                                <div style={{width: '100%', textAlign: 'center'}}>
                                    <div className="btn">
                                        <input type="submit" value="Зарегистрироваться" />
                                    </div>
                                </div>
                                <input name="call" value="signup" type="hidden" />
                            </form>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </div>
    </>
    )
}