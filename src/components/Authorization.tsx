import React, {useState, useEffect} from 'react'
import "../css/auth.css"
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from "react-bootstrap/Button"
import {useForm} from 'react-hook-form'
import Form from 'react-bootstrap/Form';
import { useParams, useNavigate } from "react-router-dom";
import request from '../utils/request'

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
     } 
    const onSubmit2 = (data: {login2:string, name2: string, password2:string, email2: string}) => {
        request({method: "post", data: {action: "signup", data: {
                    login: data.login2, password: data.password2, name: data.name2, email: data.email2}}}).then((response)=>{
                        document.location.href = "./#/confirm";
                });
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

    const isLoginExists = (v: string) => {
        let isExist = users.find(user => {return user.login==v});
        console.log("isExist", (isExist!==undefined));
        return (isExist!==undefined);
    }

    useEffect(()=>{
        request({method: 'post', data: {action: 'getUsers'}}).then(response => {
            const {data} = response;
            setUsers(data);
        });
    }, []);

    return (
        <>
        <div className="wrapper">
            <div className="mainContainer">
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
                                                value: /^[A-Za-zа-яА-Я0-9@\.]+$/i,
                                                message: "Пробелы недопустимы",
                                            },
                                            validate: {
                                                isEmail: v => /^[a-zA-Z0-9]+?@[a-zA-Z0-9]+/.test(v) || "некорретный формат email"
                                            }})
                                            } type="email" placeholder="name@example.com" />
                                {<p className="error-msg">{errors3.email_recovery && errors3.email_recovery.message}</p>}
                                <div className="btn"><input id="sendToEmail" value="Отправить" type="submit" /></div>
                            </Form.Group>
                        </Form>
                    </div>
                </div>
                <div className={(isForgot)?"hide":""}>
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
                                            required: "Field is required",
                                            maxLength: 50,
                                            pattern: {
                                                value: /^[A-Za-z0-9]+$/i,
                                                message: "Пробелы недопустимы",
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
                                <div className="btn"><input id="signin" value="Войти" type="submit" /></div>
                                <div className="btn"><input onClick={handleForgotBtn} id="passforgot" value="Забыли пароль?" type="submit" /></div>
                                <input name="call" value="signin" type="hidden" />
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
                                                value: /^[A-Za-z0-9]+$/i,
                                                message: "Пробелы недопустимы",
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
                                                value: /^[A-Za-zа-яА-Я0-9@\.]+$/i,
                                                message: "Пробелы недопустимы",
                                            },
                                            validate: {
                                                isEmail: v => /^[a-zA-Z0-9]+?@[a-zA-Z0-9]+/.test(v) || "некорретный формат email",
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
                                
                                <div className="btn"><input type="submit" value="Зарегистрироваться" /></div>
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