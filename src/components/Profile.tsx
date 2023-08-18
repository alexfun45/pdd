import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EditorProfile from './EditorProfile';
import UserGradeTable from './Grade/userGradeTable';
import InfoModal from './Tickets/InfoModal'
import {AppContext} from '../app'
import request from "../utils/request";
import { connect } from 'react-redux';

const mapStateToProps = (state:any) => {
  return {
    user: state
  }
}

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
  }



function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  function a11yProps(index: number) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

type userType = {
    id: number;
    login: string;
    name: string;
    email: string;
    confirmed: number;
    role: number;
    isMobile: boolean;
    reg_date: number;
    last_auth: number;
    settings: object;
  };

let defaultUser = {
  id: 0,
  login: "",
  name: "",
  email: "",
  confirmed: 0,
  reg_date: 0,
  last_auth: 0,
  role: 3,
  isMobile: false,
  settings: {}
  };

const Profile = (props: any) => {
    const theme = useTheme();
    const [value, setValue] = React.useState(0),
          [gradeData, setGradeData] = useState(),
          [open, setOpen] = useState(false),
          [fQuestions, setfQuestions] = useState([]),
          [user, setUser] = useState<userType>(defaultUser);

    const context = React.useContext(AppContext);

    useEffect(()=>{
      request({method: 'post', data: {action: "getUser"}}).then(response=>{
        setUser(response.data);
      })
      
    }, []);
    
    
    useEffect(()=>{
      if(user.id==0) return;
        request({method: 'post', data: {action: "getGrade", data: {user_id: user.id}}}).then(response => {
            const {data} = response;
            setGradeData(data[user.login]);
        });
    }, [user])

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index: number) => {
        setValue(index);
    };

    const handleClickItem = (user_id: number, session: string) => {
        request({method: 'post', data: {action: "getFailedQuestions", data: { user_id: user_id, testSession: session}}}).then(response => {
            const {data} = response;
            setfQuestions(data);
        });
        setOpen(true);
    }

    return (
        <div className="profileWrapper">
            <InfoModal showDialog={open} setOpen={setOpen} fQuestions={fQuestions}/>
            <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
            <AppBar position="static">
                <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                aria-label="full width tabs example"
                >
                <Tab label="Редактор профиля" {...a11yProps(0)} />
                <Tab label="Успеваемость" {...a11yProps(1)} />
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <EditorProfile user={user} setUser={setUser} />
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <UserGradeTable user_id={user.id} setUser={Function()} handleClickItem={handleClickItem}/>
                </TabPanel>
            </SwipeableViews>
            </Box>
        </div>
    )
}

export default connect(mapStateToProps)(Profile);