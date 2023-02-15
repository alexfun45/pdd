import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from "react-bootstrap/Button"

function TopMenu() {

  const topLevelMenu = [{title: "ПДД 2023", submenu:[{title: "Общие положения", href: "pdd1"}, {title: "Общие обязанности водителей", href:"pdd2"}]}, 
    {title: "Знаки и разметка", submenu: [{title: "Предупреждающие знаки", href: "znak1"}, {title:"Знаки приоритета", href: "znak2"}]},
    {title: "Изменения", submenu:[{title: "1 января 2022", href:""}]}, {title: "Экзамен", href: "pdd-online"}];
  
  return (
    <div className="top-level-menu">
      {topLevelMenu.map(
        (item, i) => {
          return ( item.submenu ? (
          <DropdownButton
            as={ButtonGroup}
            className="group-menu-btn"
            key={i}
            id={`dropdown-variants-${i}`}
            variant={item.title.toLowerCase()}
            title={item.title}>
            {
                item.submenu.map((submenuItem, j)=>(
                  <Dropdown.Item  href={(submenuItem.hasOwnProperty('href'))?("#/"+submenuItem.href):'#'} eventKey={`${j}`}>{submenuItem.title}</Dropdown.Item>
                ))
            }
          </DropdownButton>
          ) :
          (
            <Button className="menubtn" key={i} href={(item.hasOwnProperty('href'))?("#/"+item.href):''}>{item.title}</Button>
          )
          )
          }
      )}
    </div>
  );
}

export default TopMenu;