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
    password: string;
};

const roleNames = ["администратор", "менеджер сайта", "пользователь"];
const defaultEmptyUser = {
    id: 0,
    name: "",
    login: "",
    email: "",
    role: 3,
    password: ""
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

    return (
        <div style={{textAlign: 'left'}}>
            <DialogUser showUserDialog={showUserDialog} setUserDialog={setUserDialog} selectedUser={selUser} users={users} setUsers={setUsers} />
            <PasswordDialog userId={userId} showPasswordDialog={showPasswordDialog} setShow={setPasswordDialog}  />
            <Button onClick={handleDialog} style={{marginLeft: '20px'}} variant="primary">Добавить пользователя</Button>
            <Table className="users-table" responsive>
                <thead>
                    <tr>
                        <th>Имя</th>
                        <th>Логин</th>
                        <th>email</th>
                        <th>роль</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((v:userType, i: number)=>(
                            <>
                                <tr>
                                    <td>{(v.name||"")}</td>
                                    <td>{v.login}</td>
                                    <td>{v.email}</td>
                                    <td className="role-cell">{roleNames[v.role-1]}</td>
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