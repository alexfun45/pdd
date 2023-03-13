import React, {useState, useEffect} from "react";
import { HashRouter } from "react-router-dom" 
import { createContext} from "react";
import "@/css/docs18.css"
import { Routes, Route } from "react-router-dom";
import routes from './routers'
import Header from "./components/Header"
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
      role: 3
    }

const AppContext = createContext({
  user: defaultUser,
  userRole: 3,
  logged: false
});

type userType = {
  login: string;
  name: string;
  email: string;
  role: number;
};



export default function App(){
  
  const [isLogin, setLogin] = useState(false),
        [user, setUser] = useState<userType>(defaultUser),
        [role, setRole] = useState(3);

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
    }, []);

    return (
      <AppContext.Provider value={{user: user, logged: isLogin, userRole: role}}>
          <HashRouter>
            <Header />
            <div id="maincontainer" className="containerWrapper">
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