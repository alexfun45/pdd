import {useEffect, useState} from "react";
import { useLocation } from 'react-router-dom'
import "../css/docs18.css"
import request from "../utils/request";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from "react-bootstrap/Button"
import Admin from "./Admin"

type menuItem = {
  title: string;
  name: string;
}

type TopMenuType = {

  title: string;
  submenu?: menuItem[]
}

function TopMenu() {

  const [isLogin, setLogin] = useState(false),
        [TopMenu, setTopMenu] = useState<any>({});
  const location = useLocation();

    useEffect(()=>{
        request({method: 'post', data:{action: 'isLogin'}}).then( response => {
            const {data} = response;
            setLogin(data);
        });
        
        request({method: 'post', data:{action: 'getMenu'}}).then( response => {
          const {data} = response;
          setTopMenu(data);
          console.log("data", Object.entries(data));
        });

    }, []);

  const topLevelMenu = [{title: "ПДД 2023", submenu:[{title: "Общие положения", href: "pdd1"}, {title: "Общие обязанности водителей", href:"pdd2"}]}, 
    {title: "Знаки и разметка", submenu: [{title: "Предупреждающие знаки", href: "znak1"}, {title:"Знаки приоритета", href: "znak2"}]},
    {title: "Изменения", submenu:[{title: "1 января 2022", href:""}]}, {title: "Экзамен", href: "pdd-online"}];
  
  return (
    <div className={"top-level-menu "+(location.pathname=='/auth'?'hide':'')}>
      <Admin isLogin={isLogin} />
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