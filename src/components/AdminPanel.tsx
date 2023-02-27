import {useState} from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Tickets from './Tickets'
import PageManager from './PageManager'

function TabTitle({tab_type}:{tab_type: number}){
    return (
        <div>новая страница</div>
    )
}

export default () => {
    const [key, setKey] = useState('tickets'),
          [pageTabtype, setpageTabtype] = useState(0);

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
                    <Tab eventKey="settings" title="Параметры">
                        Profile
                    </Tab>
                    <Tab eventKey="pagemanager" title="менеджер страниц">
                        <PageManager setpageTabtype={setpageTabtype} />
                    </Tab>
                    <Tab eventKey="newpage" tabClassName={(pageTabtype!=0)?'':'hide'} title={<TabTitle tab_type={pageTabtype} />}></Tab>
                </Tabs>
            </div>
        </div>
    )
}