import React, {useState, useEffect} from "react";
import { HashRouter } from "react-router-dom" 
import { createContext} from "react";
import "@/css/docs18.css"
import { Routes, Route } from "react-router-dom";
import routes from './routers'
import Header from "./components/Header"
import MobileHeader from './components/MobileHeader'
import request from './utils/request'

const getRoutes = (allRoutes: Array<{route:string, key: string, component: object}>) =>
    allRoutes.map((route) => {
      if (route.route) {
          return <Route path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

let defaultUser = {
      login: "",
      name: "",
      email: "",
      role: 3,
      isMobile: false
    }

const AppContext = createContext({
  user: defaultUser,
  userRole: 3,
  logged: false,
  isMobile: false
});

type userType = {
  login: string;
  name: string;
  email: string;
  role: number;
  isMobile: boolean;
};



export default function App(){
  
  const [isLogin, setLogin] = useState(false),
        [user, setUser] = useState<userType>(defaultUser),
        [role, setRole] = useState(3),
        [displayWidth, setDisplayWidth] = useState(window.innerWidth);

  useEffect(()=>{
    request({method: "post", data: {action: "getSettings"}}).then(response=>{
      const {data} = response;
      if(data['background-color'])
        document.body.style.backgroundColor = data['background-color'];
      if(data['background-image']){
        let src = "./img/" + data['background-image'];
        document.body.style.backgroundImage = `url(${src})`;
        }
      });

      request({method: 'post', data:{action: 'getUserRole'}}).then( response => {
        const {data} = response;
        setRole(data.role);
        setLogin(data.logged);
        setUser(data);
      });
      window.addEventListener('resize', handleWindowSizeChange);
    }, []);

    const handleWindowSizeChange = () => {
      setDisplayWidth(window.innerWidth);
    }

    const width = displayWidth;
    const isMobile = width <= 1000;

    return (  
      
      // the rest is the same...
      <AppContext.Provider value={{user: user, logged: isLogin, userRole: role, isMobile: isMobile}}>
          <HashRouter>
            { (isMobile) ?  
                <MobileHeader />
              :
                <Header />
            }
            <div id="maincontainer" className={(isMobile)?"containerWrapper mobileWrapper":"containerWrapper"}>
              <Routes>
                  {
                    getRoutes(routes)  
                  }
              </Routes>
            </div>
          </HashRouter>
        </AppContext.Provider>
    )
}

export {AppContext};