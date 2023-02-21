import {useState, useEffect} from "react";
import request from '../utils/request'
import ListGroup from 'react-bootstrap/ListGroup';

type PageItem = {
    menu_id: number;
    page_id: number;
    page_name: string;
}

type MenuItems = {

}

export default function PageManager(){

    const [menuItems, setMenuItems] = useState<any>({}),
          [menuPages, setMenuPages] = useState<any>([]);
    
    const selectItem = (e:any, selectedMenuItem: string) => {
        let pages = menuItems[selectedMenuItem];
        setMenuPages(pages);
    }


    useEffect(()=>{
        request({method: "post", data: {action: "getMenuPages"}}).then((response)=>{
            const {data} = response;
            setMenuItems(data);
        });
    }, []);

    return (
        <div className="block-wrapper">
            <div className="col-2">
                <div className="col-title">Элементы верхнего меню</div>
                <ListGroup>
                    {
                        Object.entries(menuItems).map(([key, value], i) => {
                                //return <div>{menuItems[key][0].menu_id}</div>
                                return <ListGroup.Item action id={menuItems[key][0].menu_id} onClick={(e)=>selectItem(e, key)} eventKey={menuItems[key][0].menu_id}>{key}</ListGroup.Item> 
                        })
                   
                           
                    }
                </ListGroup>
            </div>
            <div className="col-2">
                <div className="col-title">Страницы</div>
                <ListGroup>
                   {
                    menuPages.map((v:PageItem)=>(
                        <ListGroup.Item eventKey={v.page_id}><div>{v.page_name}<div className="right-panel"><span><i className="bi bi-pencil-fill"></i><i className="bi bi-trash3-fill"></i></span></div></div></ListGroup.Item>
                    ))
                   }
                </ListGroup>
            </div>
        </div>
    )
}