import React, {useState, useEffect} from "react";
import { HashRouter, useLocation } from "react-router-dom" 
import { createContext} from "react";
import "@/css/docs18.css"
import { Routes, Route, Navigate, useNavigation } from "react-router-dom";
import routes from './routers'
import Header from "./components/Header"
import MobileHeader from './components/MobileHeader'
import Footer from './components/Footer'
import request from './utils/request'

let defaultUser = {
      id: 0,
      login: "",
      name: "",
      email: "",
      role: 3,
      isMobile: false,
      settings: {}
    }

const AppContext = createContext({
  user: defaultUser,
  userRole: 3,
  logged: false,
  isMobile: false,
  settings: {
    start_page:{name:""},
    exam_title: "",
    'background-color':'',
    'background-image':'',
    'background-color-tickets': '',
    'background-image-tickets': '',
    'image_title_exam': '',
    'background-image-tickets-mobile': '',
    'image_title_exam_mobile': ''
  },
  pageTitle: "",
  setPageTitle: null
});

type userType = {
  id: number;
  login: string;
  name: string;
  email: string;
  role: number;
  isMobile: boolean;
  settings: object;
};

function getRandomUserId(){
  return (new Date()).getTime();
}


export default function App(){
  
  const [isLogin, setLogin] = useState(false),
        [pageTitle, setPageTitle] = useState(""),
        [user, setUser] = useState<userType>(defaultUser),
        [role, setRole] = useState(3),
        [settings, setSettings] = useState({showLogo: '1', start_page: {name: ""}, exam_title: "", 'background-color':'', 'background-image':'', 'background-color-tickets': '', 'background-image-tickets':'', 'image_title_exam':'', 'background-image-tickets-mobile':'', 'image_title_exam_mobile': ''}),
        [displayWidth, setDisplayWidth] = useState(window.innerWidth);
  
  const getRoutes = (allRoutes: Array<{route:string, key: string, component: object, auth?: string}>) =>
        allRoutes.map((route) => {
          if (route.route) {
              let userRole = (window.localStorage.getItem('user')!=null) ? JSON.parse(window.localStorage.getItem('user')).role:0;
              if((route.auth=="admin" && userRole!=1) || (route.auth=="user" && (userRole!=1 && userRole!=3))){
                return <Route path={route.route} element={<Navigate to="/auth" replace />} />;
              }
              else
                return <Route path={route.route} element={route.component} key={route.key} />;
              //return (route.auth && userRole!=1)?<Route path={route.route} element={<Navigate to="/auth" replace />} />:<Route path={route.route} element={route.component} key={route.key} />;
          }
    
          return null;
        });

  useEffect(()=>{

    request({method: "post", data: {action: "getSettings"}}).then(response=>{
      const {data} = response;
      setSettings(data);
      if(data['background-color'])
        document.body.style.backgroundColor = data['background-color'];
      if(data['background-image']){
        let src = "./img/" + data['background-image'];
        document.body.style.backgroundImage = `url(${src})`;
        }
      });
      if(window.localStorage.getItem('user')!=null && window.localStorage.getItem('user')!="false"){
        let userData = JSON.parse(window.localStorage.getItem('user'));
        setRole(userData.role);
        setLogin(userData.logged);
        setUser(userData);
      } 
      else{
        request({method: 'post', data:{action: 'getUserRole'}}).then( response => {
          const {data} = response;
          if(data!=false){
            setRole(data.role);
            setLogin(data.logged);
            setUser(data);
            window.localStorage.setItem("user", JSON.stringify(data));
            }
          else{
            setUser({
              id: getRandomUserId(),
              login: "unlogged",
              name: "",
              email: "",
              role: -1,
              isMobile: false,
              settings: {}
            });
          }
          })
      }
      window.addEventListener('resize', handleWindowSizeChange);
    }, []);

   

    const handleWindowSizeChange = () => {
      setDisplayWidth(window.innerWidth);
    }

    const width = displayWidth; 
    const isMobile = width <= 1000;

    return (  
      
      // the rest is the same...
      <AppContext.Provider value={{user: user, logged: isLogin, userRole: role, isMobile: isMobile, settings: settings, pageTitle, setPageTitle}}>
          <HashRouter>
            { (isMobile) ?  
                <MobileHeader />
              :
                <Header showLogo={settings.showLogo} />
            }
            <div id="maincontainer" className={(isMobile)?"containerWrapper mobileWrapper":"containerWrapper"}>
              <Routes>
                  {
                    getRoutes(routes)  
                  }
              </Routes>
            </div>
            <Footer />
          </HashRouter>
        </AppContext.Provider>
    )
}

export {AppContext};