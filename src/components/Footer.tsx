import React, {useState, useEffect} from "react";
import request from '../utils/request'
import $ from 'jquery'
import SummerEditor from './SummerEditor'

export default () => {

    const [FooterContent, setFooterContent] = useState(""),
          [editMode, setEditMode] = useState(false);

    request({method: "post", data: {action: "getFooter"}}).then((response)=>{
        const {data} = response;
        setFooterContent(data);
    });

    return (
        <div id="footer" className="footer">
            <div id="footer_content" dangerouslySetInnerHTML={{__html:FooterContent || ""}}></div>

        </div>
    )
}