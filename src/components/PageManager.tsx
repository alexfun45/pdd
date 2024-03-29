import {useState, useEffect, ChangeEventHandler} from "react";
import request from '../utils/request'
import {ListGroup, Button} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import DeleteDialog from './Tickets/DeleteDialog'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

type PageItem = {
    title: string;
    id: number;
    name: string;
}

type PageType = {
    id: number;
    name: string;
    title: string;
    indx: number;
    private: number;
};

var currentRemoveItem:any,
    removeMethod: Function,
    changePostionLock = false;

var options:any[] = [],
    menuNewName = "",
    pageNewName = "";

export default function PageManager({setpageTabtype, setKey, setEditPageName, __menuItems = [], __allPages = []}: any){

    const [menuItems, setMenuItems] = useState<any>(__menuItems),
          [menuItemRename, setMenuItemRename] = useState(0),
          [menuPages, setMenuPages] = useState<any>([]),
          [allPages, setAllPages] = useState<any>(__allPages),
          [pageItemRename, setPageItemRename] = useState(0),
          [showRemovePageDialog, setRemovePageDialog] = useState(false),
          [selectedMenuId, setSelectedMenuId] = useState<any>(),
          [selectedPage, setSelectedPage]= useState<PageType>(),
          [showModal, setShowModal] = useState(false),
          [validated, setValidated] = useState(false),
          [menuName, setMenuName] = useState(""),
          [menuTitle, setMenuTitle] = useState(""),
          [search, setSearchValue] = useState<string>(""),
          [showOpenedPages, setShowOpenedPages] = useState(false),
          [filtered, setFiltered] = useState<PageType[] | []>([]);

    const selectItem = (menu_id: number) => {
        setSelectedMenuId(menu_id);
        request({method: "post", data: {action: "getMenuPages", data: {menu_id: menu_id}}}).then(response=>{
            const {data} = response;
            setMenuPages(data);
        });
    }

    useEffect(()=>{
        setMenuItems(__menuItems);
        setAllPages(__allPages);
        for(let i=0;i<__allPages.length;i++){
            options[i] = {label: __allPages[i].title, value: __allPages[i].name, id: __allPages[i].id}
        }

        },
            [__menuItems, __allPages]);

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
            if(!isPageExists(selectedPage.id)){
                let nextIndx = (menuPages.length>0) ? (menuPages[menuPages.length-1].indx+1):0;
                request({method: "post", data: {action: "addPageMenu", data: {menu_id: selectedMenuId, page_id: selectedPage.id, indx: nextIndx}}}).then((response)=>{
                    setMenuPages(()=>{
                        selectedPage.indx = nextIndx; 
                        return [...menuPages, {...selectedPage}]
                    })
                });
            }
        }
    }

    function sortArrayAsc(prev: PageType, next: PageType){
        if (prev.indx > next.indx) return 1;
        if (prev.indx == next.indx) return 0;
        if (prev.indx < next.indx) return -1;
        return 0;
    }

    const toUpPos = (tabName: string, i: number) => {
        if(i!=0 && !changePostionLock){
            changePostionLock = true;
            let topItemIndx = 0,
                setter,
                copyMenuPages = [];
            if(tabName=="menus"){
                copyMenuPages = [...menuItems];
                topItemIndx = menuItems[i-1].indx;
                setter = setMenuItems;
            }
            else{
                topItemIndx = menuPages[i-1].indx;
                copyMenuPages = [...menuPages];
                setter = setMenuPages;
            }
            copyMenuPages[i-1].indx = copyMenuPages[i].indx;
            copyMenuPages[i].indx = topItemIndx;
            copyMenuPages.sort(sortArrayAsc);
            setter(copyMenuPages);
            setMenuPages(copyMenuPages);
            request({method: "post", data: {action: "changePos", data: {table: tabName, firstItem: copyMenuPages[i-1], secondItem: copyMenuPages[i], menu_id:copyMenuPages[i].menu_id }}}).then(response=>{
                changePostionLock = false;
            });
        }
    }

    const toDownPos = (tabName: string, i: number) => {
        if(i<(menuPages.length-1)){
            changePostionLock = true;
            let nextIndx = 0,
                setter,
                copyMenuPages = [];

            if(tabName=="menus"){
                copyMenuPages = [...menuItems];
                nextIndx = menuItems[i+1].indx;
                setter = setMenuItems;
            }
            else{
                nextIndx = menuPages[i+1].indx;
                copyMenuPages = [...menuPages];
                setter = setMenuPages;
            }
            copyMenuPages[i+1].indx = copyMenuPages[i].indx;
            copyMenuPages[i].indx = nextIndx;
            copyMenuPages.sort(sortArrayAsc);
            setter(copyMenuPages);
            request({method: "post", data: {action: "changePos", data: {table: tabName, firstItem: copyMenuPages[i+1], secondItem: copyMenuPages[i], menu_id: copyMenuPages[i].menu_id}}}).then(response=>{
                changePostionLock = false;
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

    const handleRenameEvent = (ItemId:number) => {
        menuNewName = "";
        setMenuItemRename(ItemId);
    }

    const handleRenameEventPage = (ItemId: number) => {
        pageNewName = "";
        setPageItemRename(ItemId);
    }

    const handleChangeMenuName = (e: React.ChangeEvent<HTMLInputElement>) => {
        menuNewName = e.target.value;
    }

    const handleChangePageName = (e: React.ChangeEvent<HTMLInputElement>) => {
        pageNewName = e.target.value;
    }

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLDivElement>) => {
        if(e.keyCode==27)
            cancelEdit();
        if(e.keyCode==13){
          if(menuItemRename!=0 && menuNewName!=""){
            request({method: "post", data: {action: "renameMenu", data: {id: menuItemRename, newName: menuNewName}}}).then(response=>{
                setMenuItemRename(0);
                let copy = [...menuItems];
                copy[i].title = menuNewName;
                menuNewName = "";
                setMenuItems(copy);
            });
          }
          else if(pageItemRename!=0 && pageNewName!=""){
            request({method: "post", data: {action: "renamePage", data: {id: pageItemRename, newName: pageNewName}}}).then(response=>{
                setPageItemRename(0);
                let copy = [...allPages];
                copy[i].title = pageNewName;
                pageNewName = "";
                setAllPages(copy);
            });
          }
        }
    }

    const lockPage = (v: PageType) => {
        let private_status = (v.private==0)?1:0;
        request({method: "post", data: {action: "privatePage", data: {page_id: v.id, private_status:private_status}}});
        let pages = [...allPages];
        let indx = pages.findIndex(x => x.id === v.id);
        pages[indx].private = private_status;
        setAllPages(pages);
    }

    const cancelEdit = () => {
        pageNewName = "";
        menuNewName = "";
        setMenuItemRename(0);
        setPageItemRename(0);
        setAllPages(allPages);
    }

    const handleCheckOpenPages = (e: any) => {
        setShowOpenedPages((e.target)?e.target.checked:false);
    }

    return (
        <div className="block-wrapper">
            <DeleteDialog show={showRemovePageDialog} setShow={setRemovePageDialog} title="Вы действительно хотите произвести удаление?" removeMethod={removeMethod}/>
            
                <div className="col-30">
                    <div className="col-title">Элементы верхнего меню <Button onClick={handleShow} variant="outline-success">+ Создать</Button></div>
                    <ListGroup>
                        {
                            menuItems.map((value:any, i: number) => {
                                    return <ListGroup.Item action id={value.id} onClick={(e)=>selectItem(value.id)} onDoubleClick={()=>handleRenameEvent(value.id)} eventKey={value.id}><span className="pos-element"><i onClick={(e)=>{e.stopPropagation(); toUpPos("menus", i)}} className="bi bi-arrow-up"></i><i onClick={(e)=>{e.stopPropagation(); toDownPos("menus", i)}} className="bi bi-arrow-down"></i></span><span className={menuItemRename==value.id?"":"hide"}><TextField defaultValue={value.title} onKeyDown={(e)=>handleKeyDown(i, e)} onChange={handleChangeMenuName} style={{width: '70%'}} label="" /></span><span className={menuItemRename==value.id?"hide":""}>{value.title}</span><div className="right-panel"><span><i className={menuItemRename==value.id?"hide":"bi bi-trash3-fill"} onClick={()=>handleRemoveTopMenu(value.id, i)}></i><Button onClick={()=>cancelEdit()} className={menuItemRename==value.id?"":"hide"} style={{fontSize:"11px", marginTop: '7px'}} variant="danger">отмена</Button></span></div></ListGroup.Item> 
                            })
                    
                            
                        }
                    </ListGroup>
                </div>
                <div className="col-30">
                    <div className="col-title">Страницы меню</div>
                    <ListGroup>
                    {
                        menuPages.map((v:PageItem, i: number)=>(
                            <ListGroup.Item eventKey={v.id}><div><span className="pos-element"><i onClick={()=>toUpPos("menu_2_page", i)} className="bi bi-arrow-up"></i><i onClick={()=>toDownPos("menu_2_page", i)} className="bi bi-arrow-down"></i></span>{v.title}<div className="right-panel"><span><i onClick={()=>handleRemoveMenuItem(v.id, i)} className="bi bi-trash3-fill"></i></span></div></div></ListGroup.Item>
                        ))
                    }
                    </ListGroup>
                </div>
                <div className="middle-column">
                    <i onClick={addPageToMenu} className={"bi bi-arrow-left "+((selectedPage!==undefined || selectedMenuId!==undefined)?"":"hide")}></i>    
                </div>
                <div className="col-30">
                    <div className="col-title">Все страницы <Button onClick={createPage} variant="outline-success">+ Создать</Button> 
                        <Form.Check
                            checked={showOpenedPages}
                            onChange={handleCheckOpenPages}
                            type='checkbox'
                            label={`отображать только открытые страницы`}
                            id='check-opened-pages'
                        />
                    </div>
                    <Autocomplete
                        style={{width: '100%'}}
                        value={search}
                        clearOnBlur={false}
                        onChange={(event: any, newValue: string | null) => {
                            setSearchValue(newValue);
                        }}
                        onInputChange={(event, newInputValue) => {
                            let results = allPages.filter((item:PageType)=>item.title.indexOf(newInputValue)!=-1);
                            setFiltered(results);
                        }}
                        id="controllable-states-demo"
                        options={options}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="поиск" />}
                    />
                    <ListGroup>
                        {
                            (filtered.length==0 ? 
                                allPages.map((v:PageType, i: number)=>(
                                    <ListGroup.Item className={(v.private==1 && showOpenedPages===true)?"hide":""} onDoubleClick={()=>handleRenameEventPage(v.id)} action onClick={(e)=>selectPage(v)} eventKey={v.name}><span className={pageItemRename==v.id?"":"hide"}><TextField defaultValue={v.title} onKeyDown={(e)=>handleKeyDown(i, e)} onChange={handleChangePageName} style={{width: '80%'}} label="" /></span><span className={pageItemRename==v.id?"hide":""}>{v.title}</span><div className="right-panel"><span className={pageItemRename==v.id?"hide":""}><i onClick={()=>lockPage(v)} className={(v.private==0)?"bi bi-unlock-fill":"bi bi-lock-fill"}></i><i onClick={()=>handleEditPage(v)} className="bi bi-pencil-fill"></i><i onClick={()=>handleRemovePage(v)} className="bi bi-trash3-fill"></i></span><span><Button onClick={()=>cancelEdit()} className={pageItemRename==v.id?"":"hide"} style={{fontSize:"11px", marginTop: '7px'}} variant="danger">отмена</Button></span></div></ListGroup.Item> 
                                )) 
                            :
                                (
                                filtered.map((v:PageType, i: number)=>(
                                    <ListGroup.Item  className={(v.private==1 && showOpenedPages===true)?"hide":""} onDoubleClick={()=>handleRenameEventPage(v.id)} action onClick={(e)=>selectPage(v)} eventKey={v.name}><span className={pageItemRename==v.id?"":"hide"}><TextField defaultValue={v.title} onKeyDown={(e)=>handleKeyDown(i, e)} onChange={handleChangePageName} style={{width: '80%'}} label="" /></span><span className={pageItemRename==v.id?"hide":""}>{v.title}</span><div className="right-panel"><span className={pageItemRename==v.id?"hide":""}><i onClick={()=>lockPage(v)} className={(v.private==0)?"bi bi-unlock-fill":"bi bi-lock-fill"}></i><i onClick={()=>handleEditPage(v)} className="bi bi-pencil-fill"></i><i onClick={()=>handleRemovePage(v)} className="bi bi-trash3-fill"></i></span><span><Button onClick={()=>cancelEdit()} className={pageItemRename==v.id?"":"hide"} style={{fontSize:"11px", marginTop: '7px'}} variant="danger">отмена</Button></span></div></ListGroup.Item> 
                                ))   
                            )
                            )
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