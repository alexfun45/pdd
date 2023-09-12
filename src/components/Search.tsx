import {useEffect, useState} from 'react'
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import request from '../utils/request'

type ResultType = {
    name: string;
    fragment: string;
    title: string;
}

export default () => {

    const {state} = useLocation();
    const {search_text} = state;
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    useEffect(()=>{
        if(search_text!=""){
            request({method: "post", data:{action: "search", data: {searchText: search_text}}}).then(response => {
                const {data} = response;
                setResults(data);     
            });
        }
    }, []);

    const goToPage = (pageName: string) => {
        navigate("/"+pageName);
    }

    return (
        <div key="search" className="container-block">
            <div className="search_block">
                <div>Поиск по слову: <span style={{backgroundColor: "#f04c4c", color: '#FFF', fontSize: '18px', padding: "3px 4px"}}>{search_text}</span></div>
                <div className="sresult-block">
                {
                    results.map((v:ResultType, i: number)=>(
                        <div className="result-item">
                            <div className="result-title" onClick={()=>goToPage(v.name)}><i>{i+1}.</i><span>{v.title}</span></div>
                            <div style={{fontSize: '12px'}} dangerouslySetInnerHTML={{__html:v.fragment || ""}}></div>
                        </div>
                    ))
                }
                </div>
            </div>
        </div>
    )
}