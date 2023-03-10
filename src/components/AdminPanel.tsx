import React, {useState, useEffect} from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Tickets from './Tickets'
import PageManager from './PageManager'
import PageEditor from './PageEditor'
import CloseButton from 'react-bootstrap/CloseButton';
import UsersManager from './Users'
import Settings from './Settings'
import {AppContext} from '../app'

function TabTitle({tab_type, setpageTabtype, setKey, editPageName}:{tab_type: number, setpageTabtype: React.Dispatch<React.SetStateAction<number>>, setKey: React.Dispatch<React.SetStateAction<string>>, editPageName: string}){

    const closeTab = () => {
        setpageTabtype(0);
    }

    return (
        <div style={{position: 'relative'}}>{editPageName || 'новая страница'} <CloseButton onClick={closeTab} color='#FFF' style={{width: '0.2em', height: '0.2em', position: 'absolute', top: '-7px', right: '-12px'}} /></div>
    )
}

export default () => {
    const context = React.useContext(AppContext);
    const [key, setKey] = useState('tickets'),
          [pageTabtype, setpageTabtype] = useState(0),
          [editPageName, setEditPageName] = useState("");

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
                        <Tickets />
                    </Tab>
                    {(context.userRole==1) && (
                        <Tab eventKey="settings" title="Настройки">
                            <Settings />
                        </Tab>
                    )}
                    {(context.userRole==1) && (
                        <Tab eventKey="users" title="Пользователи">
                            <UsersManager />
                        </Tab>
                    )}
                    <Tab eventKey="pagemanager" title="Менеджер страниц">
                        <PageManager setpageTabtype={setpageTabtype} setKey={setKey} setEditPageName={setEditPageName} />
                    </Tab>
                    { (pageTabtype!=0) && (
                        <Tab eventKey="newpage" tabClassName={(pageTabtype!=0)?'':'hide'} title={<TabTitle tab_type={pageTabtype} editPageName={editPageName} setpageTabtype={setpageTabtype} setKey={setKey}/>}>
                            <PageEditor editPageName={editPageName} setEditPageName={setEditPageName} mode={pageTabtype}/>
                        </Tab>
                    )}
                </Tabs>
            </div>
        </div>
    )
}