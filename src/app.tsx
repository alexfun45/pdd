import React from "react";
import { ReactDOM } from "react";
import { HashRouter } from "react-router-dom" 
import "@/css/docs18.css"
import { Routes, Route } from "react-router-dom";
import routes from './routers'
import Header from "./components/Header"

const getRoutes = (allRoutes: Array<{route:string, key: string, component: object}>) =>
    allRoutes.map((route) => {
      if (route.route) {
          return <Route path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });


export default function App(){
    return (
        <>  
          <HashRouter>
            <Header />
            <Routes>
                {
                  getRoutes(routes)  
                }
            </Routes>
          </HashRouter>
        </>
    )
}