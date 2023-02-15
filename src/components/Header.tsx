import {useEffect, useState} from "react";
import { useLocation } from 'react-router-dom'
import "../css/bootstrap.css"
import "../css/docs18.css"
import Admin from "./Admin"
import Dropdown from "react-bootstrap/Dropdown"
import Button from "react-bootstrap/Button"
import request from "../utils/request";
import DropdownButton from 'react-bootstrap/DropdownButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';


export default () => {

    const [isLogin, setLogin] = useState(false);
    const location = useLocation();
    useEffect(()=>{
        request({method: 'post', data:{action: 'isLogin'}}).then( response => {
            const {data} = response;
            setLogin(data);
        });
    }, [])

    return (
        <div style={{position: 'relative', padding: '1rem'}} className={location.pathname=='/auth'?'hide':''}>
            <Admin isLogin={isLogin} />
            {/*<div className="navbar navbar-default navbar-static-top" style={{marginBottom: '10px'}}>
                <div className="container" style={{width: '100%'}}>
                    <div className="navbar-header">
                    </div>
    <div className="navbar-collapse collapse">*/}
                
                   <div>
                    {['Primary', 'Secondary', 'Success', 'Info', 'Warning', 'Danger'].map(
                        (variant) => (
                        <DropdownButton
                            className="btngroup"
                            style={{display: 'inline-block !important', float: 'none'}}
                            as={ButtonGroup}
                            key={variant}
                            id={`dropdown-variants-${variant}`}
                            variant="primary"
                            title={variant}
                        >
                            <Dropdown.Item eventKey="1">Action</Dropdown.Item>
                            <Dropdown.Item eventKey="2">Another action</Dropdown.Item>
                            <Dropdown.Item eventKey="3" active>
                            Active Item
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
                        </DropdownButton>
                        ),
                        )}
                   </div>
                   {/*<Dropdown style={{display: "inline-block"}}>
                            <Dropdown.Toggle className="menubtn" variant="light" id="dropdown-basic">
                                ПДД2023
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="dropdown-menu">
                                <Dropdown.Item href="#/pdd1">Action</Dropdown.Item>
                                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown style={{display: "inline-block"}}>
                            <Dropdown.Toggle className="menubtn" variant="light" id="dropdown-basic">
                                Знаки и разметка
                            </Dropdown.Toggle>
                        </Dropdown>
                        <Dropdown style={{display: "inline-block"}}>
                            <Dropdown.Toggle className="menubtn" variant="light" id="dropdown-basic">
                                Изменения
                            </Dropdown.Toggle>
                        </Dropdown>
                        <Dropdown style={{display: "inline-block"}}>
                            <Dropdown.Toggle className="menubtn" variant="light" id="dropdown-basic">
                                Допуск и неисправности
                            </Dropdown.Toggle>
                        </Dropdown>
                        <Button className="menubtn" variant="light" id="dropdown-basic">
                                Экзамен
                        </Button>
                        
                    </div>
                </div>
            </div>*/}
        </div>
    )
}