import {useState, useEffect} from "react";
import request from '../utils/request'
import {ListGroup, Button} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import DeleteDialog from './Tickets/DeleteDialog'

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

var currentRemoveItem:any,
    removeMethod: Function;

export default function PageManager({setpageTabtype, setKey, setEditPageName}: any){

    const [menuItems, setMenuItems] = useState<any>([]),
          [menuPages, setMenuPages] = useState<any>([]),
          [allPages, setAllPages] = useState<any>([]),
          [showRemovePageDialog, setRemovePageDialog] = useState(false),
          [selectedMenuId, setSelectedMenuId] = useState<any>(),
          [selectedPage, setSelectedPage]= useState<PageType>(),
          [showModal, setShowModal] = useState(false),
          [validated, setValidated] = useState(false),
          [menuName, setMenuName] = useState(""),
          [menuTitle, setMenuTitle] = useState(""),
          [update, setUpdate] = useState(0);

    const selectItem = (menu_id: number) => {
        setSelectedMenuId(menu_id);
        request({method: "post", data: {action: "getMenuPages", data: {menu_id: menu_id}}}).then(response=>{
            const {data} = response;
            setMenuPages(data);
        });
    }

    // handle for close modal of menu creation
    const handleClose = () => setShowModal(false);

    // handle for show modal of menu creation
    const handleShow = () => setShowModal(true);

    const handleSubmit = (event: any) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
          event.stopPropagation();
          return;
        } 
        else{
            createMenuItem();
        } 
        setValidated(true);
      }

    // Select current page
    const selectPage = (pageItem: PageType) => {
        setSelectedPage(pageItem);
    }

    const removePage = () => {
        request({method: "post", data: {action: "removePage", data: {page_id: currentRemoveItem.id, page_name: currentRemoveItem.name}}});
        let pages = [...allPages];
        let indx = pages.findIndex(x => x.id === currentRemoveItem.id);
        pages.splice(indx, 1);
        setAllPages(pages);
        setRemovePageDialog(false);
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

    const createMenuItem = () => {
        request({method: "post", data: {action: "createMenuItem", data: {menu_name: menuName, menu_title: menuTitle}}}).then(response=>{
            const {data} = response;
            setMenuItems([...menuItems, data]);
            handleClose();
        });
    }

    // remove menuitem
    const removeMenuItem = () => {
        if(selectedMenuId && currentRemoveItem.pageId){
            request({method: "post", data: {action: "removeMenuItem", data:{menu_id: selectedMenuId, page_id: currentRemoveItem.pageId}}}).then((response)=>{
                let copyMenuPages = [...menuPages];
                copyMenuPages.splice(currentRemoveItem.menu_pages_index, 1);
                setMenuPages(copyMenuPages);
            });
        }
        setRemovePageDialog(false);
    }

    const removeMenu = () => {
        request({method: "post", data: {action: "removeMenu", data: {menu_id: currentRemoveItem.menuId}}});
        let copymenuItems = [...menuItems];
        copymenuItems.splice(currentRemoveItem.indx, 1);
        setMenuItems(copymenuItems);
        setRemovePageDialog(false);
    }

    const createPage = () => {
        setpageTabtype(1);
        setKey("newpage");
    }

    const handleEditPage = (v: PageType) => {
        setEditPageName(v.name);
        setpageTabtype(2);
        setKey("newpage");
    }

    // getting all menu items and all pages
    useEffect(()=>{
        request({method: "post", data: {action: "getMenuItems"}}).then((response)=>{
            const {data} = response;
            setMenuItems(data.menus);
            setAllPages(data.pages);
        });
    }, [update]);

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMenuName((event.currentTarget.value) ? event.currentTarget.value:"");
    }

    const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMenuTitle((event.currentTarget.value) ? event.currentTarget.value:"");
    }

    const handleRemovePage = (v: PageType) => {
        currentRemoveItem = v;
        removeMethod = removePage;
        setRemovePageDialog(true);
    }

    const handleRemoveTopMenu = (v: any, indx: number) => {
        currentRemoveItem = {indx: indx, menuId: v};
        removeMethod = removeMenu;
        setRemovePageDialog(true);
    }

    const handleRemoveMenuItem = (v: any, i: number) => {
        currentRemoveItem = {pageId: v, menu_pages_index: i};
        removeMethod = removeMenuItem;
        setRemovePageDialog(true);
    }

    return (
        <div className="block-wrapper">
            <DeleteDialog show={showRemovePageDialog} setShow={setRemovePageDialog} removeMethod={removeMethod}/>
            <div className="col-30">
                <div className="col-title">Элементы верхнего меню <Button onClick={handleShow} variant="outline-success">+ Создать</Button></div>
                <ListGroup>
                    {
                        menuItems.map((value:any, i: number) => {
                                return <ListGroup.Item action id={value.id} onClick={(e)=>selectItem(value.id)} eventKey={value.id}>{value.title}<div className="right-panel"><span><i onClick={()=>handleRemoveTopMenu(value.id, i)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item> 
                        })
                   
                           
                    }
                </ListGroup>
            </div>
            <div className="col-30">
                <div className="col-title">Страницы меню</div>
                <ListGroup>
                   {
                    menuPages.map((v:PageItem, i: number)=>(
                        <ListGroup.Item eventKey={v.id}><div>{v.title}<div className="right-panel"><span><i onClick={()=>handleRemoveMenuItem(v.id, i)} className="bi bi-trash3-fill"></i></span></div></div></ListGroup.Item>
                    ))
                   }
                </ListGroup>
            </div>
            <div className="middle-column">
                <i onClick={addPageToMenu} className={"bi bi-arrow-left "+((selectedPage!==undefined || selectedMenuId!==undefined)?"":"hide")}></i>    
            </div>
            <div className="col-30">
                <div className="col-title">Все страницы <Button onClick={createPage} variant="outline-success">+ Создать</Button></div>
                <ListGroup>
                    {
                        allPages.map((v:PageType)=>(
                            <ListGroup.Item action onClick={(e)=>selectPage(v)} eventKey={v.name}>{v.title}<div className="right-panel"><span><i onClick={()=>handleEditPage(v)} className="bi bi-pencil-fill"></i><i onClick={()=>handleRemovePage(v)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item> 
                        ))
                    }
                </ListGroup>
            </div>
            <Modal show={showModal} onHide={handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Новое меню</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form validated={validated} onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Введите имя нового меню</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          onChange={handleChangeName}
                          placeholder=""
                          autoFocus
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Введите видимый заголовок меню</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          onChange={handleChangeTitle}
                          placeholder=""
                        />
                      </Form.Group>
                      <Button type="submit" variant="primary">
                      Сохранить
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                      Отмена
                    </Button>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                  </Modal.Footer>
                </Modal>
        </div>
    )
}