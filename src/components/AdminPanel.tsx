import {useState} from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Tickets from './Tickets'
import PageManager from './PageManager'

export default () => {
    const [key, setKey] = useState('tickets');
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
                    <Tab eventKey="pagemanager" title="Менеджер страниц">
                        <PageManager />
                    </Tab>
                </Tabs>
            </div>
        </div>
    )
}