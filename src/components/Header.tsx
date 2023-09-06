import React, {useEffect, useState} from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import "../css/docs18.css"
import request from "../utils/request";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from "react-bootstrap/Button"
import Admin from "./Admin"
import $ from 'jquery'
import {AppContext} from '../app'

type menuItem = {
  title: string;
  name: string;
}

type TopMenuType = {

  title: string;
  submenu?: menuItem[]
}

var formData = new FormData();

function TopMenu({showLogo}:{showLogo: string}) {
  const context = React.useContext(AppContext);
  const //[isLogin, setLogin] = useState(false),
        //[role, setRole] = useState<number>(0),
        [homeIcon, setHomeIcon] = useState(""),
        [TopMenu, setTopMenu] = useState<any>({});
  const location = useLocation();
  let navigate = useNavigate();
    useEffect(()=>{
        request({method: 'post', data:{action: 'getHomeIcon'}}).then( response => {
            const {data} = response;
            setHomeIcon(data);
        });
        
        request({method: 'post', data:{action: 'getMenu'}}).then( response => {
          const {data} = response;
          setTopMenu(data);
        });

    }, []);

    useEffect(()=>{
      if(location.pathname=="/pdd-online" || location.pathname=="/pdd_for_school"){
        if(context.settings['background-color-tickets'])
          document.body.style.backgroundColor = context.settings['background-color-tickets'];
        if(context.settings['background-image-tickets']){
          let src = "./img/" + context.settings['background-image-tickets'];
          document.body.style.backgroundImage = `url(${src})`;
        }
      }
      else{
        if(context.settings['background-color'])
          document.body.style.backgroundColor = context.settings['background-color'];
        if(context.settings['background-image-tickets']){
          let src = "./img/" + context.settings['background-image'];
          document.body.style.backgroundImage = `url(${src})`;
        }
      }
    }, [window.location.href])
  
  const Logout = () => {
    request({method: 'post', data:{ action: 'Logout'}});
    window.localStorage.clear();
    document.location.href = "./";
  }

  const changeHomeIcon = (event: any) => {
      let file = event.target.files[0];
      var reader = new FileReader();
      reader.onloadend = function() {
        if(reader.result)
          setHomeIcon(reader.result.toString());
      }
    reader.readAsDataURL(file);
    formData.append("file", file);
    formData.append("action", "setHomeIcon");
    request({method: "post", headers: {"Content-Type": "multipart/form-data"}, data: formData});
  }

  const triggerUpload = (event:any) => {
    if(context.userRole!=1)
      event.preventDefault();
  }

  const handleHomeLink = (e: any) => {
    if(context.userRole!=1){
      document.location.href = "./";
    }
  }
  return (
    <div className={"top-level-menu "+((location.pathname=='/auth' || location.pathname=='/confirm')?'hide':'')}>
      <div className={(showLogo=="0")?"hide":"homeIcon"} onClick={handleHomeLink}><a href="./"></a><input onClick={triggerUpload} id="homeIcon" onChange={changeHomeIcon} type="file" /><img src={homeIcon}></img></div>
      <Admin Logout={Logout} isLogin={context.logged} role={context.userRole} isMobile={false}/>
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
                  <Dropdown.Item key={j} href={(submenuItem.hasOwnProperty('page_name'))?("#/"+submenuItem.page_name):'#'} eventKey={`${j}`}>{submenuItem.title}</Dropdown.Item>
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