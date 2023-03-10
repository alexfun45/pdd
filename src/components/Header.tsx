import React, {useEffect, useState} from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import "../css/docs18.css"
import request from "../utils/request";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from "react-bootstrap/Button"
import Admin from "./Admin"
import {AppContext} from '../app'

type menuItem = {
  title: string;
  name: string;
}

type TopMenuType = {

  title: string;
  submenu?: menuItem[]
}

function TopMenu() {
  const context = React.useContext(AppContext);
  const //[isLogin, setLogin] = useState(false),
        //[role, setRole] = useState<number>(0),
        [TopMenu, setTopMenu] = useState<any>({});
  const location = useLocation();
  let navigate = useNavigate();
    useEffect(()=>{
        /*request({method: 'post', data:{action: 'getUserRole'}}).then( response => {
            const {data} = response;
            setLogin(data.logged);
            setRole(data.role);
        });*/
        
        request({method: 'post', data:{action: 'getMenu'}}).then( response => {
          const {data} = response;
          setTopMenu(data);
        });

    }, []);
  
  const Logout = (e: React.MouseEvent) => {
    request({method: 'post', data:{ action: 'Logout'}});
    //setLogin(false);
    //navigate("/");
    document.location.href = "./";
  }

  const topLevelMenu = [{title: "ПДД 2023", submenu:[{title: "Общие положения", href: "pdd1"}, {title: "Общие обязанности водителей", href:"pdd2"}]}, 
    {title: "Знаки и разметка", submenu: [{title: "Предупреждающие знаки", href: "znak1"}, {title:"Знаки приоритета", href: "znak2"}]},
    {title: "Изменения", submenu:[{title: "1 января 2022", href:""}]}, {title: "Экзамен", href: "pdd-online"}];
  
  return (
    <div className={"top-level-menu "+((location.pathname=='/auth' || location.pathname=='/confirm')?'hide':'')}>
      <Admin Logout={Logout} isLogin={context.logged} role={context.userRole}/>
      {Object.entries(TopMenu).map(
        (item: any, i: number) => {
          return ( item[1].submenu ? (
          <DropdownButton
            as={ButtonGroup}
            className="group-menu-btn"
            key={i}
            id={`dropdown-variants-${i}`}
            variant={item[1].title.toLowerCase()}
            title={item[1].title}>
            {
                item[1].submenu.map((submenuItem: any, j: number)=>(
                  <Dropdown.Item  href={(submenuItem.hasOwnProperty('page_name'))?("#/"+submenuItem.page_name):'#'} eventKey={`${j}`}>{submenuItem.title}</Dropdown.Item>
                ))
            }
          </DropdownButton>
          ) :
          (
            <Button className="menubtn" key={i} href={(item[1].hasOwnProperty('name'))?("#/"+item[1].name):''}>{item[1].title}</Button>
          )
          )
          }
      )}
    </div>
  );
}

export default TopMenu;