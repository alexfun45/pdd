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
            let regexp = /(font\-)?size[=\:][\'\"]?\s?(.*?)[\'\"]?/sg;
            //let regexp = /size=[\'\"]?\s?(\d{1,2})[\'\"]?/sg;
            let result = data.replace(regexp, (match: string, fullform: string, fontsize: string)=>{ 
                console.log("fontsize", fontsize);
                if(parseInt(fontsize)<14)
                    return "font-size: 3vh";
                else if(parseInt(fontsize)<18)
                    return "font-size: 4vh";
                else
                    return "font-size: 4.5vh";
             });
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