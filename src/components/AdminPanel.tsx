import React, {useState, useEffect} from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import TicketManager from './TicketManager'
import SubjectManager from './SubjectManager'
import PageManager from './PageManager'
import PageEditor from './PageEditor'
import UsersManager from './Users'
import Statistic from './Statistic'
import Settings from './Settings'
import Grade from './Grade/Grade'
import { connect } from 'react-redux';
import request from '../utils/request'
import {AppContext} from '../app'

function TabTitle({tab_type, setpageTabtype, setKey, editPageName, setEditPageName}:{tab_type: number, setpageTabtype: React.Dispatch<React.SetStateAction<number>>, setKey: React.Dispatch<React.SetStateAction<string>>, editPageName: string, setEditPageName:React.Dispatch<React.SetStateAction<string>>}){

    const closeTab = () => {
        setpageTabtype(0);
        setEditPageName("");
    }

    return (
        <div style={{position: 'relative'}}>{editPageName || 'новая страница'} <i onClick={closeTab} color='#FFF' style={{width: '0.2em', height: '0.2em', position: 'absolute', top: '-12px', right: '-5px'}} className="bi bi-x"></i></div>
    )
}

const mapStateToProps = (state:any) => {
    return {
      auth: state.user
    }
  }

const AdminPanel = (props: any) => {
    const context = React.useContext(AppContext);
    const [key, setKey] = useState('tickets'),
          [menuItems, setMenuItems] = useState<any>([]),
          [allPages, setAllPages] = useState<any>([]),
          [pageTabtype, setpageTabtype] = useState(0),
          [editPageName, setEditPageName] = useState("");
     // getting all menu items and all pages
     useEffect(()=>{
        request({method: "post", data: {action: "getMenuItems"}}).then((response)=>{
            const {data} = response;
            setMenuItems(data.menus);
            setAllPages(data.pages);
        });
    }, []);
    useEffect(()=>{
        if(pageTabtype==0)
            setKey("pagemanager");
    }, [pageTabtype]);

    return (
        <div className="container admin-container">
            <div className="row">
              <h2>Панель администратора</h2>  
                <Tabs
                    defaultActiveKey="tickets"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    onSelect={k => setKey(k||'tickets')}
                    activeKey={key}
                    >
                    <Tab eventKey="tickets" title="Билеты">
                        <TicketManager />
                    </Tab>
                    <Tab eventKey="subjects" title="Темы">
                        <SubjectManager />
                    </Tab>
                    {(props.auth.role==1) && (
                        <Tab eventKey="settings" title="Настройки">
                            <Settings allPages={allPages} />
                        </Tab>
                    )}
                    {(props.auth.role==1) && (
                        <Tab eventKey="users" title="Пользователи">
                            <UsersManager />
                        </Tab>
                    )}
                    {(props.auth.role==1) && (
                        <Tab eventKey="statistic" title="Статистика">
                            <Statistic />
                        </Tab>
                    )}
                    {(props.auth.role==1) && (
                        <Tab eventKey="grade" title="Успеваемость">
                            <Grade />
                        </Tab>
                    )}
                    <Tab eventKey="pagemanager" title="Менеджер страниц">
                        <PageManager setpageTabtype={setpageTabtype} setKey={setKey} setEditPageName={setEditPageName} __menuItems={menuItems} __allPages={allPages} />
                    </Tab>
                    { (pageTabtype!=0) && (
                        <Tab eventKey="newpage" tabClassName={(pageTabtype!=0)?'':'hide'} title={<TabTitle tab_type={pageTabtype} editPageName={editPageName} setpageTabtype={setpageTabtype} setKey={setKey} setEditPageName={setEditPageName}/>}>
                            <PageEditor editPageName={editPageName} setEditPageName={setEditPageName} mode={pageTabtype}/>
                        </Tab>
                    )}
                </Tabs>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(AdminPanel)