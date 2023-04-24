import React, {useState, useEffect} from 'react';
import IconButton from '@mui/material/IconButton';
import { useLocation, useNavigate } from 'react-router-dom'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import DraftsIcon from '@mui/icons-material/Drafts';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { makeStyles } from '@mui/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Admin from "./Admin"
import request from "../utils/request";
import {AppContext} from '../app'

const useStyles = makeStyles({
    drawerPaper: {
      marginTop: "8vh",
      width: "80vw"
    }
  });

var formData = new FormData();


export default () => {

    const location = useLocation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [anchorLeft, setAnchorLeft] = useState(false),
          [homeIcon, setHomeIcon] = useState("./img/default_home.png"),
          [TopMenu, setTopMenu] = useState<any>({});
    const open = Boolean(anchorEl);
    const context = React.useContext(AppContext);
    const [openSubmenu, setOpen] = useState<any>({});

    const handleSubmenuClick = (name: string) => {
        let arr = {...openSubmenu, [name]: !openSubmenu[name]};
        setOpen(arr);
    };

    useEffect(()=>{
        request({method: 'post', data:{action: 'getHomeIcon'}}).then( response => {
            const {data} = response;
            setHomeIcon(data);
        });
        
        request({method: 'post', data:{action: 'getMenu'}}).then( response => {
          const {data} = response;
          setTopMenu(data);
        });

    }, []);

    useEffect(()=>{
        if(location.pathname=="/pdd-online" || location.pathname=="/pdd_for_school"){
          if(context.settings['background-color-tickets'])
            document.body.style.backgroundColor = context.settings['background-color-tickets'];
          if(context.settings['background-image-tickets']){
            let src = "./img/" + context.settings['background-image-tickets'];
            document.body.style.backgroundImage = `url(${src})`;
          }
        }
        else{
          if(context.settings['background-color'])
            document.body.style.backgroundColor = context.settings['background-color'];
          if(context.settings['background-image-tickets']){
            let src = "./img/" + context.settings['background-image'];
            document.body.style.backgroundImage = `url(${src})`;
          }
        }
      }, [window.location.href])

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorLeft(true);
    };
    const handleClose = () => {
        setAnchorLeft(false);
    };

    const classes = useStyles();

    const toggleDrawer =
        (open: boolean) =>
        (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setAnchorLeft(open);
        };

    const list = () => (
        <Box
          role="presentation"
          onKeyDown={toggleDrawer(false)}
          sx={{"& .MuiList-root":{width: "100%"}}}
        >
          <List sx={{"& .MuiTypography-root":{fontSize: "2.5vh", color: "#333", fontWeight: "500"}, "& .MuiButtonBase-root":{width: "100%", paddingLeft: "3vw", paddingRight: "15px", paddingTop: "2vh", paddingBottom: "2vh"}}}>
            {Object.entries(TopMenu).map(
                (item: any, i: number) => {
                    if(item[1].submenu && !openSubmenu[item[1].name])
                        openSubmenu[item[1].name] = false;
                    return ( item[1].submenu ? (
                        <>
                            <ListItemButton  onClick={()=>handleSubmenuClick(item[1].name)} divider={true}>
                                <ListItemText primary={item[1].title} />
                                {openSubmenu[item[1].name] ? <ExpandLess onClick={()=>handleSubmenuClick(item[1].name)} sx={{fontSize: "5vh"}} /> : <ExpandMore  onClick={()=>handleSubmenuClick(item[1].name)} sx={{fontSize: "5vh"}} />}
                            </ListItemButton>  
                            <Collapse in={openSubmenu[item[1].name]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {
                                        
                                        item[1].submenu.map((submenuItem: any, j: number)=>(
                                            <ListItemButton component="a" href={"#/"+submenuItem.page_name} divider={true} sx={{ pl: 4}}>
                                                <ListItemText primary={submenuItem.title} />
                                            </ListItemButton> 
                                        ))                                
                                    }
                                </List>
                            </Collapse>
                        </>
                    )
                    :
                    (
                      <ListItemButton component="a" href={"#/"+item[1].name} divider={true}>
                            <ListItemText primary={item[1].title} />
                      </ListItemButton>   
                    )
                    )
                }
            )}
                </List>
          </Box>
    );

    const Logout = (e: React.MouseEvent) => {
        request({method: 'post', data:{ action: 'Logout'}});
        document.location.href = "./";
      }

    const changeHomeIcon = (event: any) => {
        let file = event.target.files[0];
        var reader = new FileReader();
        reader.onloadend = function() {
          if(reader.result)
            setHomeIcon(reader.result.toString());
        }
      reader.readAsDataURL(file);
      formData.append("file", file);
      formData.append("action", "setHomeIcon");
      request({method: "post", headers: {"Content-Type": "multipart/form-data"}, data: formData});
    }

    const triggerUpload = (event:any) => {
        if(context.userRole!=1)
          event.preventDefault();
      }
    
    const handleHomeLink = (e: any) => {
        if(context.userRole!=1){
          document.location.href = "./";
        }
      }

    return (
        <div className="mobileHeader">
            <div style={{position: 'relative', width: '100%',  whiteSpace: 'nowrap', lineHeight: '100%'}}>
             <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            >
                <MenuIcon sx={{fontSize: '6vh'}} />
            </IconButton>
            <Drawer
                classes={{
                    paper: classes.drawerPaper
                  }}
                sx={{marginTop: "70px"}}
                anchor='left'
                open={anchorLeft}
                onClose={toggleDrawer(false)}
            >
                {list()}
              <div style={{width:'100%', textAlign: 'center'}}><Admin Logout={Logout} isLogin={context.logged} role={context.userRole} isMobile={true}/></div>
            </Drawer>
            <span className="page-title">{context.pageTitle}</span>
            {/*<div className="homeIcon" onClick={handleHomeLink}><a href="./"></a><input onClick={triggerUpload} id="homeIcon" onChange={changeHomeIcon} type="file" /><img src={homeIcon}></img></div>
            */}
            </div>
        </div>
    )
}