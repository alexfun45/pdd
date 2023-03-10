import React from 'react'
import "../css/auth.css"
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import {useForm} from 'react-hook-form'
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

export default () => {

    let navigate = useNavigate();
    const { register, handleSubmit, setError, watch, setValue, formState: { errors } } = useForm<InputSingInTypes>({mode: 'onBlur'});
    const { register: register2, handleSubmit:handleSubmit2, watch:watch2, formState: { errors: errors2 } } = useForm<InputSignUpTypes>({mode: 'onBlur'});
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

    return (
        <>
        <div className="wrapper">
            <div className="mainContainer">
                <Tabs
                    defaultActiveKey="signin"
                    id="justify-tab-example"
                    className="mb-3"
                    >
                    <Tab eventKey="signin" title="Войти">
                        <form  onSubmit={handleSubmit(onSubmit)} action="./admin.php" id="login-form" method="POST" className="sign_in">
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
                                            isEmail: v => /^[a-zA-Z0-9]+?@[a-zA-Z0-9]+/.test(v) || "некорретный формат email"
                                        }
                                    }
                                )}
                                    placeholder="e-mail" id="email" className="input" />
                                    {<p className="error-msg">{errors2.email2 && errors2.email2.message}</p>}
                            </div>
                            <div className="input_field">
                                <input type="password2"
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
                                <input type="cppassword"
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
    </>
    )
}