import {useState, useEffect} from 'react'
import Table from 'react-bootstrap/Table'
import {Modal, Button} from 'react-bootstrap';
import DialogUser from './Tickets/EditUserDialog'
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
let selUser = defaultEmptyUser;

export default () => {

    const [users, setUsers] = useState<userType[]>([]),
          [showDeleteModal, setShowDeleteModal] = useState(false),
          [showUserDialog, setUserDialog] = useState('hide');

    useEffect(()=>{
        request({method: 'post', data: {action: 'getUsers'}}).then(response => {
            const {data} = response;
            setUsers(data);
        });
    }, [users]);

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
            setUsers([]);
        });
        setShowDeleteModal(false);
    }

    return (
        <div style={{textAlign: 'left'}}>
            <DialogUser showUserDialog={showUserDialog} setUserDialog={setUserDialog} selectedUser={selUser} users={users} setUsers={setUsers} />
            <Button onClick={handleDialog} style={{marginLeft: '20px'}} variant="primary" >Добавить пользователя</Button>
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
                                    <td><span className='btn-panel'><i onClick={(e)=>handleEditUser(v)} className="bi bi-pencil-fill"></i><i onClick={()=>{ selUser = v; setShowDeleteModal(true)}} className="bi bi-trash3-fill"></i></span></td>
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