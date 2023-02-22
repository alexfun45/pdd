import {useState, useEffect} from "react";
import request from '../utils/request'
import ListGroup from 'react-bootstrap/ListGroup';

type PageItem = {
    menu_id: number;
    page_id: number;
    page_name: string;
}

type PageType = {
    id: number;
    name: string;
    title: string;
};

export default function PageManager(){

    const [menuItems, setMenuItems] = useState<any>({}),
          [menuPages, setMenuPages] = useState<any>([]),
          [allPages, setAllPages] = useState<any>([]),
          [selectedMenuId, setSelectedMenuId] = useState<any>(),
          [selectedPage, setSelectedPage]= useState<PageType>(),
          [update, setUpdate] = useState(0);

    const selectItem = (selectedMenuItemId:any, selectedMenuKey: string) => {
        let pages = menuItems[selectedMenuKey];
        setMenuPages(pages);
        setSelectedMenuId(selectedMenuItemId);
    }

    // Select current page
    const selectPage = (pageItem: PageType) => {
        setSelectedPage(pageItem);
    }

    const isPageExists = (page_id: number) => {
        for(let i=0;i<menuPages.length;i++){
            if(menuPages[i].page_id==page_id)
                return true;
        }
        return false;
    }

    // Add page to menu item
    const addPageToMenu = () => {
        if(selectedPage){
            if(!isPageExists(selectedPage.id))
                request({method: "post", data: {action: "addPageMenu", data: {menu_id: selectedMenuId, page_id: selectedPage.id}}}).then((response)=>{
                    setMenuPages(()=>{
                        return [...menuPages, {page_name: selectedPage.title, page_id: selectedPage.id}]
                    })
                });
        }
      
    }

    const removeMenuItem = (pageId: number) => {
        if(selectedMenuId && pageId){

            request({method: "post", data: {action: "removeMenuItem", data:{menu_id: selectedMenuId, page_id: pageId}}}).then((response)=>{
                setTimeout(()=>{
                    setUpdate(update+1);
                }, 1000);
            });
        }
    }

    useEffect(()=>{
        request({method: "post", data: {action: "getMenuPages"}}).then((response)=>{
            const {data} = response;
            setMenuItems(data.menus);
            setAllPages(data.allpages);
        });
    }, [update]);

    return (
        <div className="block-wrapper">
            <div className="col-3">
                <div className="col-title">Элементы верхнего меню</div>
                <ListGroup>
                    {
                        Object.entries(menuItems).map(([key, value], i) => {
                                //return <div>{menuItems[key][0].menu_id}</div>
                                return <ListGroup.Item action id={menuItems[key][0].menu_id} onClick={(e)=>selectItem(menuItems[key][0].menu_id, key)} eventKey={menuItems[key][0].menu_id}>{key}</ListGroup.Item> 
                        })
                   
                           
                    }
                </ListGroup>
            </div>
            <div className="col-3">
                <div className="col-title">Страницы меню</div>
                <ListGroup>
                   {
                    menuPages.map((v:PageItem)=>(
                        <ListGroup.Item eventKey={v.page_id}><div>{v.page_name}<div className="right-panel"><span><i className="bi bi-pencil-fill"></i><i onClick={()=>removeMenuItem(v.page_id)} className="bi bi-trash3-fill"></i></span></div></div></ListGroup.Item>
                    ))
                   }
                </ListGroup>
            </div>
            <div className="middle-column">
                <i onClick={addPageToMenu} className={"bi bi-arrow-left "+((selectedPage!==undefined || selectedMenuId!==undefined)?"":"hide")}></i>    
            </div>
            <div className="col-3">
                <div className="col-title">Все страницы</div>
                <ListGroup>
                    {
                        allPages.map((v:PageType)=>(
                            <ListGroup.Item action onClick={(e)=>selectPage(v)} eventKey={v.name}>{v.title}</ListGroup.Item> 
                        ))
                    }
                </ListGroup>
            </div>
        </div>
    )
}