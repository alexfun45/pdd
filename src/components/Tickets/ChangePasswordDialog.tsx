import {useState, useEffect, useMemo} from 'react'
import {useForm} from 'react-hook-form'
import {Form} from 'react-bootstrap';
import {Modal, Button} from 'react-bootstrap';
import '../../css/auth.css';
import request from '../../utils/request'

type PasswordTypes ={
    password: string;
    cppassword: string;
}

export default ({userId, showPasswordDialog, setShow}:{userId: number, showPasswordDialog: boolean, setShow: React.Dispatch<React.SetStateAction<boolean>>}) => {

    const { register: register, setValue, handleSubmit:handleSubmit, watch:watch, formState: { errors: errors } } = useForm<PasswordTypes>({
        mode: 'onBlur'
    });

    const onSubmit = (data: {password: string}) => {
        request({method: 'post', data: {action: 'changePassword', data: {userId: userId, password: data.password}}});
        setShow(false);
    };

    const handleClose = () => {
        setShow(false);
    }

    return (
            <Modal show={showPasswordDialog} onHide={()=>setShow(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Изменение пароля</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit(onSubmit)} action="./admin.php" method="POST" id="signup" className="sign_up">
                            <div className="input_field">
                                            <input type="password"
                                                {...register(
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
                                            placeholder="пароль" className="input" />
                                            {<p className="error-msg">{errors.password && errors.password.message}</p>}
                                        </div>
                                        <div className="input_field">
                                            <input type="cppassword"
                                                {...register(
                                                    "cppassword",{
                                                        required: "Поле обязательно",
                                                        validate: {
                                                            isSame :(v: string) => { if(v!=watch('password')) return "пароли не совпадают" }
                                                        } 
                                                    }
                                                )
                                            }
                                            placeholder="повторите пароль" className="input" />
                                            {<p className="error-msg">{errors.cppassword && errors.cppassword.message}</p>}
                                        </div>
                                        <div className="btn-wrapper"><Button type="submit" variant="success">Сохранить</Button><Button onClick={handleClose} variant="secondary">Отмена</Button></div>
                                </form>
                            </Modal.Body>
                        </Modal>
    )
}