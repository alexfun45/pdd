import React, {useEffect, useState} from "react";
import {useForm} from 'react-hook-form'
import Form from 'react-bootstrap/Form';
import { useParams, useNavigate } from "react-router-dom";

import request from '../utils/request'

type PasswordRecoveryType = {
    password: string;
    cppassword: string;
}

export default () => {

    const [isSuccess, setResult] = useState(false),
          params = useParams(),
          {register, handleSubmit, watch, formState: { errors } } = useForm<PasswordRecoveryType>({mode: 'onBlur'});
    let navigate = useNavigate();
    useEffect(()=>{
            request({method: "post", data: {action: "checkEmailToken", data: {email: params.email, token: params.secret}}}).then(response=>{
                const {data} = response;
                setResult(data);
                
            });
        }, []);

    const onSubmit = (data: PasswordRecoveryType) => { 
        
            request({method: "post", data: {action: "changePassword", data: {email: params.email, password: data.password}}}).then(()=>{
                document.location.href = "./#/auth";
            });        
    };

    return (
        <div className="wrapper">
            <div className="mainContainer">
            {(isSuccess) ? 
                (
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group controlId="exampleForm.ControlInput1">
                            <Form.Label>Придумайте новый пароль для входа в аккаунт</Form.Label>
                            <Form.Control type="password" {...register(
                                                "password",{
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
                                />
                            {<p className="error-msg">{errors.password && errors.password.message}</p>}
                        </Form.Group>    
                        <Form.Group controlId="exampleForm.ControlInput1">
                            <Form.Label>Повторите пароль</Form.Label>
                            <Form.Control type="password" {...register(
                                                "cppassword",{
                                                    required: "Поле обязательно",
                                                    maxLength: 50,
                                                    minLength: {
                                                        value:8,
                                                        message: "пароль должен быть не менее 8 символов"
                                                    },
                                                    validate: {
                                                        isSame :(v: string) => { if(v!=watch('password')) return "пароли не совпадают" }
                                                    } 
                                                }
                                            )
                                        }
                                />
                            {<p className="error-msg">{errors.cppassword && errors.cppassword.message}</p>}
                        </Form.Group> 
                        <div className="btn"><input id="sendToEmail" value="Подтвердить" type="submit" /></div>
                    </Form>
                ) :
                (
                    <div style={{fontSize: '18px', fontWeight: 400}}>Указан неверный email или секретный ключ</div>
                )
                }
            </div>
        </div>
    )
}