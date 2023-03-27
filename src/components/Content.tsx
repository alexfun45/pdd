import {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import request from '../utils/request'

interface ContentProps {
    id: string
} 

function Content(){
    const {id = 'pdd1'} = useParams(),
          [__content, setContent] = useState("");

    useEffect(()=>{
        request({method: "post", data:{action: "getPage", data: {page_id: id}}}).then( response =>{
            const {data} = response;
            let regexp = /(font\-)?size[=\:][\'\"]?\s?([^\'\";]*)[\'\"]?/sg;
            let result = "";
            if(data){
                result = data.replace(regexp, (match: string, fullform: string, fontsize: string)=>{ 
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
    }, [id]);

    return (
        <div className="container">
            <div className="row">
                <div className="pageWrapper" dangerouslySetInnerHTML={{__html:__content || ""}}></div>
            </div>
        </div>
    )
}

export default Content;