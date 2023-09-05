import React, {useState, useEffect} from "react";
import { HashRouter, BrowserRouter } from "react-router-dom" 
import { createContext} from "react";
//import "@fontsource/montserrat-alternates"
import "@/css/docs18.css"
import { Routes, Route, Navigate, useNavigate  } from "react-router-dom";
import routes from './routers'
import Header from "./components/Header"
import MobileHeader from './components/MobileHeader'
import Footer from './components/Footer'
import request from './utils/request'
import * as actions from "./store/userActions";
import AdminRoute from './PrivateRoutes'
import store from './store/store'
import GoogleAuth from "./components/GoogleAuth";
import { connect } from "react-redux";

const mapStateToProps = (state:any) => ({
  isAuthenticated: state.isAuthenticated,
  role: state.role
});

let defaultUser = {
      id: 0,
      login: "",
      name: "",
      email: "",
      confirmed: 0,
      role: 3,
      isMobile: false,
      settings: {},
      reg_date: 0,
      last_auth: 0
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
    'show_exam_title': '1',
    'image_title_exam': '',
    'background-image-tickets-mobile': '',
    'image_title_exam_mobile': '',
    'shuffle_tickets': '0',
    'load': false
  },
  pageTitle: "",
  setPageTitle: null
});

type userType = {
  id: number;
  login: string;
  name: string;
  email: string;
  confirmed: number;
  role: number;
  reg_date: number;
  last_auth: number;
  isMobile: boolean;
  settings: object;
};

function getRandomUserId(){
  return (new Date()).getTime();
}

window.onload = function theme(){
  document.body.style.backgroundColor = window.localStorage.getItem('bgcolor');
}

let params: any = {};

function ParseUrl(){
  var fragmentString = location.hash.substring(1);

  // Parse query string to see if page request is coming from OAuth 2.0 server
  var regex = /([^&=]+)=([^&]*)/g, m;
  while (m = regex.exec(fragmentString)) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  //console.log("params", params);
  if (Object.keys(params).length > 0) {
      //console.log('oauth2-test-params', JSON.stringify(params));
      //console.log("state", params['state']);
      //localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
      if (params['state'] && params['state'] == 'try_sample_request') {
        return params;
      //trySampleRequest();
      }
      return false;
  }
}

const App = (props: any) => {
  
  const [isLogin, setLogin] = useState(false),
        [pageTitle, setPageTitle] = useState(""),
        [user, setUser] = useState<userType>(defaultUser),
        [role, setRole] = useState(3),
        [settings, setSettings] = useState({showLogo: '1', start_page: {name: ""}, exam_title: "", 'background-color':'', 'background-image':'', 'background-color-tickets': '', 'background-image-tickets':'', 'image_title_exam':'', 'background-image-tickets-mobile':'', 'image_title_exam_mobile': '', 'show_exam_title': '1', 'shuffle_tickets': '0', 'load': false}),
        [displayWidth, setDisplayWidth] = useState(window.innerWidth);

  const getRoutes = (allRoutes: Array<{route:string, key: string, component: object, auth?: string}>) =>
        allRoutes.map((route) => {
          if (route.route) {
              let userRole = (window.localStorage.getItem('user')!==undefined) ? JSON.parse(window.localStorage.getItem('user')).role:0;
              if((route.auth=="admin" && (userRole!=1 && userRole!=2)) || (route.auth=="user" && (userRole!=1 && userRole!=3))){
                return <Route path={route.route} element={<Navigate to="/auth" replace />} />;
              }
              else
                return <Route path={route.route} element={route.component} key={route.key} />;
              //return (route.auth && userRole!=1)?<Route path={route.route} element={<Navigate to="/auth" replace />} />:<Route path={route.route} element={route.component} key={route.key} />;
          }
    
          return null;
        });
  
  const saveUser = (newUserProfile: userType) => {
    setUser(newUserProfile);
    window.localStorage.setItem("user", JSON.stringify(newUserProfile));
  }

  useEffect(()=>{
    store.dispatch(actions.fetchUser());
    ParseUrl();
    if(window.localStorage.getItem('backgroundImage')!=null)
      document.body.style.backgroundImage = window.localStorage.getItem('backgroundImage');
      request({method: "post", data: {action: "getSettings"}}).then(response=>{
      const {data} = response;
      setSettings({...data, 'load': true});
      if(data['background-color']){
        if(window.localStorage.getItem('bgcolor')!=data['background-color']){
          window.localStorage.setItem('bgcolor', data['background-color']);
          document.body.style.backgroundColor = data['background-color'];
        }
      }
      if(data['background-image']){
        let src = "./img/" + data['background-image'];
        if(window.localStorage.getItem('backgroundImage')!=`url(${src})`){
          window.localStorage.setItem('backgroundImage', `url(${src})`);
          document.body.style.backgroundImage = `url(${src})`;
        }
        }
      });
      window.addEventListener('resize', handleWindowSizeChange);
    }, []);

    const handleWindowSizeChange = () => {
      setDisplayWidth(window.innerWidth);
    }

    const width = displayWidth; 
    const isMobile = width <= 1000;

    return (  
      <AppContext.Provider value={{user: user, logged: isLogin, userRole: role, isMobile: isMobile, settings: settings, pageTitle, setPageTitle}}>
          
          <HashRouter>
            { (isMobile) ?  
                <MobileHeader />
              :
                <Header showLogo={settings.showLogo} />
            }
              <div key={props.isAuthenticated} id="maincontainer" className={(isMobile)?"containerWrapper mobileWrapper":"containerWrapper"}>
                <Routes>
                    {
                    routes.map((route) => {
                      if (route.route) {
                        if(route.auth=="admin")
                          return <Route path={route.route} key={route.key} element={<AdminRoute component={route.component}></AdminRoute>} />
                        else 
                          return <Route path={route.route} element={route.component} key={route.key} />
                      } 
                    })
                  }
                  <Route path="*" element={<GoogleAuth params={params} />} />
                </Routes>
              </div>
          
            <Footer />
          </HashRouter>
          
        </AppContext.Provider>
    )
}
export default connect(
  mapStateToProps,
)(App);

export {AppContext};