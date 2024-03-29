import {useState, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {Form} from 'react-bootstrap';
import {Modal, Button} from 'react-bootstrap';
import '../../css/auth.css';
import request from '../../utils/request'

type InputSignUpTypes = {
    id: number;
    name2: string;
    login2: string;
    email2: string;
    password2: string;
    role: number;
    state: number;
    cppassword: string;
}

type userType = {
    id: number;
    name2: string;
    login2: string;
    email2: string;
    role: number;
    state: number;
    password2: string;
};

export default ({showUserDialog, setUserDialog, selectedUser, users, setUsers}: {showUserDialog: string,setUserDialog: React.Dispatch<React.SetStateAction<string>>, selectedUser: any, users: any, setUsers: any}) => {

    const [show, setShow] = useState(showUserDialog),
          [editedUser, setEditedUser] = useState(selectedUser);
    const { register: register, setValue, handleSubmit:handleSubmit, watch:watch, formState: { errors: errors } } = useForm<InputSignUpTypes>({
            mode: 'onBlur',
            defaultValues: {login2: "" || selectedUser.login}
        });

    useEffect(()=>{
        setShow(showUserDialog);
    }, [showUserDialog]);

    useEffect(()=>{
        setEditedUser(selectedUser);
        setValue("id", selectedUser.id);
        setValue("name2", selectedUser.name);
        setValue("login2", selectedUser.login);
        setValue("email2", selectedUser.email);
        setValue("role", selectedUser.role);
        setValue("password2", selectedUser.password);
        setValue("cppassword", selectedUser.password);
    }, [ selectedUser.login]);

    const onSubmit = (data: {id: number; name2: string, login2:string, password2:string, role: number, email2: string, state: number}) => {
        if(show=="create"){
            request({method: 'post', data: {action: 'addNewUser', data: data}});
            setUsers([...users, data]);
        }
        else{
            request({method: 'post', data: {action: 'editUser', data: data}});
            let __users = [...users];
            let newUsers = __users.map((v)=>{
                if(v.login==selectedUser.login){
                    return data;
                }
                else
                    return v;
            });
            setUsers(newUsers);
        }
        
        handleClose();
    }
    const handleClose = () => setUserDialog('hide');

    const isUserExists = (v: string) => {
        let isExists = users.find((user: any)=>{
            return (user.login==v && ((show=="edit") && selectedUser.login!=user.login));
        })
        return !(isExists!==undefined);
    }

    return (
        <>
            <Modal show={(show!='hide')} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{(showUserDialog=="create")?"Создание пользователя":"Редактирование"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit(onSubmit)} action="./admin.php" method="POST" id="signup" className="sign_up">
                            <div className="input_field">
                                    <input key={editedUser.name} defaultValue={editedUser.name} type="name2" {
                                        ...register("name2", {
                                            required: "Поле обязательно",
                                            maxLength: 100,
                                            })}  placeholder="ФИО" className="input" />
                                    {<p className="error-msg">{errors.name2 && errors.name2.message}</p>}
                                </div>
                                <div className="input_field">
                                    <input type="login2" {
                                        ...register("login2", {
                                            required: "Поле обязательно",
                                            maxLength: 50,
                                            pattern: {
                                                value: /^[A-Za-z0-9\-@&%_\.]+$/i,
                                                message: "Недопустимые символы",
                                                },
                                            validate: {
                                                    isExists: v => isUserExists(v) || "логин занят"
                                                }
                                            })}  placeholder="логин" className="input" />
                                    {<p className="error-msg">{errors.login2 && errors.login2.message}</p>}
                                </div>
                                <div className="input_field">
                                    <Form.Select {
                                        ...register("role", {
                                            required: "Поле обязательно",  
                                            })
                                        }>
                                        <option value="3">пользователь</option>
                                        <option value="2">менеджер</option>
                                        <option value="1">администратор</option>
                                    </Form.Select>
                                </div>
                                <div className="input_field">
                                    <input type="email2" {
                                        ...register("email2", {
                                            required: "Поле обязательно",
                                            maxLength: 50,
                                            pattern: {
                                                value: /^[A-Za-zа-яА-Я0-9@\._$\'\-#%\&\/]+$/i,
                                                message: "Недопустимый символ",
                                            },
                                            validate: {
                                                isEmail: v => /^[a-zA-Z0-9@\._$\'\-#%\&\/]+?@[a-zA-Z0-9@\._$\'\-#%\&\/]+/.test(v) || "некорретный формат email"
                                                }
                                            }
                                        )}
                                        placeholder="e-mail" id="email" className="input" />
                                        {<p className="error-msg">{errors.email2 && errors.email2.message}</p>}
                                </div>
                                {(show == "create") && (
                                    <>
                                        <div className="input_field">
                                            <input type="password2"
                                                {...register(
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
                                            {<p className="error-msg">{errors.password2 && errors.password2.message}</p>}
                                        </div>
                                        <div className="input_field">
                                            <input type="cppassword"
                                                {...register(
                                                    "cppassword",{
                                                        required: "Поле обязательно",
                                                        validate: {
                                                            isSame :(v: string) => { if(v!=watch('password2')) return "пароли не совпадают" }
                                                        } 
                                                    }
                                                )
                                            }
                                            placeholder="повторите пароль" className="input" />
                                            {<p className="error-msg">{errors.cppassword && errors.cppassword.message}</p>}
                                        </div>
                                    </>
                                )}
                                <div className="btn-wrapper"><Button type="submit" variant="success">{(show=="create")?"Создать":"Сохранить"}</Button><Button onClick={handleClose} variant="secondary">Отмена</Button></div>
                                </form>
                                
                    </Modal.Body>
            </Modal>
            
        </>
    )
}