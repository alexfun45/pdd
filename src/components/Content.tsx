import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import request from '../utils/request'
import {AppContext} from '../app'
import { useNavigate } from "react-router-dom";
import { connect } from 'react-redux';

interface ContentProps {
    id: string
} 

const mapStateToProps = (state:any) => {
    return {
      isAuth: state.isAuthenticated
    }
  }

function Content(props: any){
    const context = React.useContext(AppContext);
    const {id = ''} = useParams(),
          [__content, setContent] = useState("");
    let navigate = useNavigate();
    
    useEffect(()=>{
        if(context.settings.hasOwnProperty("start_page") && context.settings.start_page.name!="" && id=="")
            navigate("/"+context.settings.start_page.name);
    }, [context]);

    useEffect(()=>{
        if(props.isAuth==null || id=="") return;
        request({method: "post", data:{action: "getPage", data: {page_id: id}}}).then( response =>{
            const {data} = response;
            if(data.private==1 && !props.isAuth) navigate("/auth");
            let regexp = /(font\-)?size[=\:][\'\"]?\s?([^\'\";]*)[\'\"]?/sg,
                content = data.content,
                result = "";
            context.setPageTitle(data.title);
            if(content){
                result = content.replace(regexp, (match: string, fullform: string, fontsize: string)=>{ 
                let fontStyleName = (fullform!==undefined) ? "font-size:":"size=";
                if(parseInt(fontsize)<14)
                    return fontStyleName+"2vh";
                else if(parseInt(fontsize)<=18)
                    return fontStyleName+"2.5vh";
                else
                    return fontStyleName+"3vh";
             });
            }
            setContent(result);
        });
    }, [props.isAuth, id]);

    return (
        <div className="container">
            <div className="row">
                <div className="pageWrapper" dangerouslySetInnerHTML={{__html:__content || ""}}></div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(Content);