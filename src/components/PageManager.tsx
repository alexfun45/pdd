import {useState, useEffect} from "react";
import request from '../utils/request'
import {ListGroup, Button} from 'react-bootstrap';

type PageItem = {
    title: string;
    id: number;
    name: string;
}

type PageType = {
    id: number;
    name: string;
    title: string;
};

export default function PageManager({setpageTabtype}: any){

    const [menuItems, setMenuItems] = useState<any>([]),
          [menuPages, setMenuPages] = useState<any>([]),
          [allPages, setAllPages] = useState<any>([]),
          [selectedMenuId, setSelectedMenuId] = useState<any>(),
          [selectedPage, setSelectedPage]= useState<PageType>(),
          [update, setUpdate] = useState(0);

    const selectItem = (menu_id: number) => {
        setSelectedMenuId(menu_id);
        request({method: "post", data: {action: "getMenuPages", data: {menu_id: menu_id}}}).then(response=>{
            const {data} = response;
            setMenuPages(data);
        });
        //let pages = menuItems[selectedMenuKey];
        //setMenuPages(pages);
        //setSelectedMenuId(selectedMenuItemId);
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
                        return [...menuPages, {...selectedPage}]
                    })
                });
        }
      
    }

    // remove menuitem
    const removeMenuItem = (pageId: number, menu_pages_index: number) => {
        if(selectedMenuId && pageId){
            request({method: "post", data: {action: "removeMenuItem", data:{menu_id: selectedMenuId, page_id: pageId}}}).then((response)=>{
                let copyMenuPages = [...menuPages];
                copyMenuPages.splice(menu_pages_index, 1);
                setMenuPages(copyMenuPages);
            });
        }
    }

    const createPage = () => {
        setpageTabtype(1);
    }

    // getting all menu items and all pages
    useEffect(()=>{
        request({method: "post", data: {action: "getMenuItems"}}).then((response)=>{
            const {data} = response;
            setMenuItems(data.menus);
            setAllPages(data.pages);
        });
    }, [update]);

    return (
        <div className="block-wrapper">
            <div className="col-3">
                <div className="col-title">Элементы верхнего меню</div>
                <ListGroup>
                    {
                        menuItems.map((value:any) => {
                                //return <div>{menuItems[key][0].menu_id}</div>
                                return <ListGroup.Item action id={value.id} onClick={(e)=>selectItem(value.id)} eventKey={value.id}>{value.name}</ListGroup.Item> 
                        })
                   
                           
                    }
                </ListGroup>
            </div>
            <div className="col-3">
                <div className="col-title">Страницы меню</div>
                <ListGroup>
                   {
                    menuPages.map((v:PageItem, i: number)=>(
                        <ListGroup.Item eventKey={v.id}><div>{v.title}<div className="right-panel"><span><i className="bi bi-pencil-fill"></i><i onClick={()=>removeMenuItem(v.id, i)} className="bi bi-trash3-fill"></i></span></div></div></ListGroup.Item>
                    ))
                   }
                </ListGroup>
            </div>
            <div className="middle-column">
                <i onClick={addPageToMenu} className={"bi bi-arrow-left "+((selectedPage!==undefined || selectedMenuId!==undefined)?"":"hide")}></i>    
            </div>
            <div className="col-3">
                <div className="col-title">Все страницы <Button onClick={createPage} variant="outline-success">+ Создать</Button></div>
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