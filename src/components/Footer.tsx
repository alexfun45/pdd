import React, {useState, useEffect} from "react";
import request from '../utils/request'
import $ from 'jquery'
import SummerEditor from './SummerEditor';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import {AppContext} from '../app'

var formData = new FormData(),
    imageNames: Array<string> = [];

formData.append("action", "saveFooter");
export default () => {

    const context = React.useContext(AppContext);
    const [FooterContent, setFooterContent] = useState(""),
          [saving, setSaving] = useState(false),
          [editMode, setEditMode] = useState(false),
          [model, setModel] = useState("");

    useEffect(()=>{
    request({method: "post", data: {action: "getFooter"}}).then((response)=>{
        const {data} = response;
        setFooterContent(data);
        setModel(data);
        });
    }, []);

    const setEdit = () => {
        setEditMode(true);
    }

    const saveFooter = (event: any) => {
        setSaving(true);
        let content = $(model),
            i = 0;
        content.wrap("<div class='wrapContent'></div>");
        content.find('img').each(function(){
          if(imageNames[i]){
            if($(this).attr('src')?.indexOf("./img/")==-1){
              $(this).attr('src', "./img/"+imageNames[i]);
              i++;
            }
          }
        });
        formData.delete('content');
        var html = $("<div />").append(content.clone()).html();
        formData.append('content', html);
        setFooterContent(html);
        request({method: "post", headers: {"Content-Type": "multipart/form-data"}, data: formData});
        setTimeout(()=>{
            setSaving(false);
          }, 2000);
    }

    const closeEditor = () => {
        setEditMode(false);
    }

    return (
        <div id="footer" className={editMode?"footer extended_footer":"footer"}>
            <span className={(context.userRole==1 && !editMode)?'footer-edit-btn':'hide'} onClick={setEdit}>редактировать</span>
            <div className={editMode?"hide":""} id="footer_content" dangerouslySetInnerHTML={{__html:FooterContent || ""}}></div>
            <div className={editMode?"":"hide"}>
                <SummerEditor model={model} setModel={setModel} formData={formData} imageNames={imageNames} />
            </div>
            <div className={editMode?"editor-btn":"hide"}>
                <Button onClick={saveFooter} className="btn-dialog btn-success" disabled={saving} type="submit">
                <Spinner
                    className={(!saving)?"hide":""}
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />Сохранить</Button>
                <i onClick={closeEditor} style={{fontSize: "32px", cursor: "pointer", verticalAlign: "middle"}} className="bi bi-x-square"></i>
              </div>
        </div>
    )
}