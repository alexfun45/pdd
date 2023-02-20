import {useEffect, useState} from "react";
import { useLocation } from 'react-router-dom'
//import "../css/bootstrap.css"
import "../css/docs18.css"
import request from "../utils/request";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from "react-bootstrap/Button"
import Admin from "./Admin"

function TopMenu() {

  const [isLogin, setLogin] = useState(false);
    const location = useLocation();
    useEffect(()=>{
        request({method: 'post', data:{action: 'isLogin'}}).then( response => {
            const {data} = response;
            setLogin(data);
        });
    }, []);

  const topLevelMenu = [{title: "ПДД 2023", submenu:[{title: "Общие положения", href: "pdd1"}, {title: "Общие обязанности водителей", href:"pdd2"}]}, 
    {title: "Знаки и разметка", submenu: [{title: "Предупреждающие знаки", href: "znak1"}, {title:"Знаки приоритета", href: "znak2"}]},
    {title: "Изменения", submenu:[{title: "1 января 2022", href:""}]}, {title: "Экзамен", href: "pdd-online"}];
  
  return (
    <div className={"top-level-menu "+(location.pathname=='/auth'?'hide':'')}>
      <Admin isLogin={isLogin} />
      {topLevelMenu.map(
        (item, i) => {
          return ( item.submenu ? (
          <DropdownButton
            as={ButtonGroup}
            className="group-menu-btn"
            key={i}
            id={`dropdown-variants-${i}`}
            variant={item.title.toLowerCase()}
            title={item.title}>
            {
                item.submenu.map((submenuItem, j)=>(
                  <Dropdown.Item  href={(submenuItem.hasOwnProperty('href'))?("#/"+submenuItem.href):'#'} eventKey={`${j}`}>{submenuItem.title}</Dropdown.Item>
                ))
            }
          </DropdownButton>
          ) :
          (
            <Button className="menubtn" key={i} href={(item.hasOwnProperty('href'))?("#/"+item.href):''}>{item.title}</Button>
          )
          )
          }
      )}
    </div>
  );
}

export default TopMenu;