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
            setContent(data);
        });
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="pageWrapper" dangerouslySetInnerHTML={{__html:__content || ""}}></div>
            </div>
        </div>
    )
}

export default Content;