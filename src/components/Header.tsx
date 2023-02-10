import {useEffect, useState} from "react";
import { useLocation } from 'react-router-dom'
import "../css/bootstrap.css"
import "../css/docs18.css"
import Admin from "./Admin"
import Dropdown from "react-bootstrap/Dropdown"
import request from "../utils/request";

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
        <div className={location.pathname=='/auth'?'hide':''}>
            <Admin isLogin={isLogin} />
            <div className="navbar navbar-default navbar-static-top" style={{marginBottom: '10px'}}>
                <div className="container" style={{width: '100%'}}>
                    <div className="navbar-header">
                    </div>
                    <div className="navbar-collapse collapse">
                        <Dropdown>
                            <Dropdown.Toggle variant="light" id="dropdown-basic">
                                Dropdown Button
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="dropdown-menu">
                                <Dropdown.Item href="#/pdd1">Action</Dropdown.Item>
                                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    )
}