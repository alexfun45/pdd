import {useState, useEffect} from 'react'
import Table from 'react-bootstrap/Table'
import {Modal, Button} from 'react-bootstrap';
import DialogUser from './Tickets/EditUserDialog'
import PasswordDialog from './Tickets/ChangePasswordDialog'
import request from '../utils/request'

type userType = {
    id: number;
    name: string;
    login: string;
    email: string;
    role: number;
    state: number;
    password: string;
    reg_date: number;
    last_auth: number;
};

const roleNames = ["администратор", "менеджер сайта", "пользователь"];
const defaultEmptyUser = {
    id: 0,
    name: "",
    login: "",
    email: "",
    state: 0,
    role: 3,
    password: "",
    reg_date: 0,
    last_auth: 0
}
let selUser = defaultEmptyUser,
    userId = 0;

export default () => {

    const [users, setUsers] = useState<userType[]>([]),
          [reset, setReset] = useState(false),
          [showDeleteModal, setShowDeleteModal] = useState(false),
          [showPasswordDialog, setPasswordDialog] = useState(false),
          [showUserDialog, setUserDialog] = useState('hide');

    const getUsers = () => {
        request({method: 'post', data: {action: 'getUsers'}}).then(response => {
            const {data} = response;
            setUsers(data);
        });
    }

    useEffect(()=>{
        getUsers();
    }, []);

    // show create new user dialog
    const handleDialog = () => {
        selUser = defaultEmptyUser;
        setUserDialog('create');
    }

    // show edit user dialog
    const handleEditUser = (user: userType) => {
        selUser = user;
        setUserDialog('edit');
    }

    const handleCloseDelete = () => {
        setShowDeleteModal(false);
    }

    const deleteUser = () => {
        request({method: 'post', data: {action: 'removeUser', data: {user_id: selUser.id}}}).then(response=>{
            getUsers();
        });
        setShowDeleteModal(false);
    }

    const changePassword = (user_id: number) => {
        userId = user_id;
        setPasswordDialog(true);
    }

    const getColor = (state: number) => {
        switch(state){
            case 1: return "#40bd40";
            case 0: return "rgb(187, 40, 40)";
            default: return "#f2f55b";
        }
    }

    const getTitle = (state: number) => {
        switch(state){
            case 1: return "онлайн";
            case 0: return "оффлайн";
            default: return "еще не заходил";
        }
    }

    const getOnlineUsersNum = () => {
        let num = 0;
        users.forEach(item=>(item.state==1?num++:0));
        return num;
    }

    return (
        <div className="tableWrapper">
            <DialogUser showUserDialog={showUserDialog} setUserDialog={setUserDialog} selectedUser={selUser} users={users} setUsers={setUsers} />
            <PasswordDialog userId={userId} showPasswordDialog={showPasswordDialog} setShow={setPasswordDialog}  />
            <Button onClick={handleDialog} style={{marginRight: '220px'}} variant="primary">Добавить пользователя</Button>
            <div className="table-topheader" style={{display:"inline", float: "left"}}>Всего зарегистрировано: <b>{users.length}</b>  <span style={{marginLeft: "4px", marginRight: "3px", color: "rgb(25, 157, 25)"}}>онлайн:</span><b>{getOnlineUsersNum()}</b></div>
            <Table className="users-table" responsive>
                <thead>
                    <tr>
                        <th>Имя</th>
                        <th>Логин</th>
                        <th>email</th>
                        <th>Роль</th>
                        <th>Дата регистрации</th>
                        <th>Дата последней авторизации</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((v:userType, i: number)=>(
                            <>
                                <tr>
                                    <td><i title={getTitle(v.state)} style={{color: getColor(v.state)}} className="bi bi-circle-fill status-circle"></i>{(v.name||"")}</td>
                                    <td>{v.login}</td>
                                    <td>{v.email}</td>
                                    <td className="role-cell">{roleNames[v.role-1]}</td>
                                    <td>{v.reg_date}</td>
                                    <td>{v.last_auth}</td>
                                    <td><span className='btn-panel'><i onClick={(e)=>handleEditUser(v)} className="bi bi-pencil-fill"></i><i onClick={()=>{ selUser = v; if(v.id!=1) setShowDeleteModal(true)}} className="bi bi-trash3-fill"></i><i onClick={()=>changePassword(v.id)} title="изменить пароль" className="bi bi-key-fill"></i></span></td>
                                </tr>
                             </>  
                        )
                        )
                    }
                </tbody>
            </Table>
            <Modal show={showDeleteModal} onHide={handleCloseDelete}>
                <Modal.Header closeButton>
                <Modal.Title>Удаление пользователя</Modal.Title>
                </Modal.Header>
                <Modal.Body>Вы действительно хотите удалить пользователя?</Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseDelete}>
                    Нет
                </Button>
                <Button variant="primary" onClick={deleteUser}>
                    Да
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}