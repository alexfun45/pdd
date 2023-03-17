import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import {useState, useEffect} from "react";
import request from '../utils/request'
// Require Editor JS files.
/*import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/js/plugins/align.min.js';
import 'froala-editor/js/plugins/fullscreen.min.js';       
import 'froala-editor/js/plugins/code_beautifier.min.js';
import 'froala-editor/js/plugins/font_family.min.js';     
import 'froala-editor/js/plugins/link.min.js';  
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/font_size.min.js';
import 'froala-editor/js/plugins/colors.min.js';
import 'froala-editor/js/plugins/paragraph_format.min.js';
import 'froala-editor/js/plugins/paragraph_style.min.js';
import 'froala-editor/js/plugins/lists.min.js';

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
  
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';
import FroalaEditor from 'react-froala-wysiwyg';*/
import $ from 'jquery'

import SummerEditor from './SummerEditor'


const screenHeight = window.screen.height*0.6;
type typeImagesArrayrray = {
  name: string;
  type: string;
};
var formData = new FormData(),
Images:typeImagesArrayrray[] = [];

var imageNames: Array<string> = [];
export default function PageEditor({editPageName, setEditPageName, mode}: {editPageName:string, setEditPageName: React.Dispatch<React.SetStateAction<string>>, mode: number}){

    const [show, setShow] = useState(false),
          [pageName, setPageName] = useState(""),
          [saving, setSaving] = useState(false);
    const [model, setModel] = useState("");             // content of Froala editor
    const [validated, setValidated] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const changePageName = (e: any) => {
        let value = e.target.value;
       if(value.length<128)
          setPageName((e.target.value) ? e.target.value:''); 
      }
    
      useEffect(()=>{
        if(mode==2){
          request({method: "post", data:{action: "getPage", data: {page_id: editPageName}}}).then(response => {
            const {data} = response;
            setModel(data);
          });
        }
        else
          setModel("");
      }, [mode]);

    let config = {
        placeholder: "Edit Me",
        height: screenHeight,
        fontFamilySelection: true,
        fontSizeSelection: true,
        paragraphFormatSelection: true,
        htmlExecuteScripts: true,
        events:{
          'image.beforeUpload': function (images:any) {
            formData.append(images[0].name, images[0]);
            imageNames.push(images[0].name);
          }
        },
        pluginsEnabled: [
            'fullscreen',
            'codeBeautifier',
            'fontFamily',
            'align',
            'link',
            'image',
            'fontSize',
            'colors',
            'paragraphFormat',
            'paragraphStyle',
            'lists'
          ],
        toolbarButtons: {

            'moreText': {
          
              'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'textColor','backgroundColor', 'subscript', 'superscript', 'fontFamily', 'inlineClass', 'inlineStyle', 'clearFormatting'],
              'buttonsVisible': 8
            },
          
            'moreParagraph': {
          
              'buttons': ['alignLeft', 'alignCenter', 'alignRight', 'formatOLSimple', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote'],
              'buttonsVisible': 7
            },
          
            'moreRich': {
          
              'buttons': ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR']
          
            },
          
            'moreMisc': {
          
              'buttons': ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
          
              'align': 'right',
          
              'buttonsVisible': 3
          
            }
          
          }}
    

    const handleModelChange = (data: string) => {
        setModel(data);
    }

    const savePage = (event: any) => {
        if(editPageName=="")
          handleShow();
        else
          save();
    }

    const handleSubmit = (event: any) => {
      const form = event.currentTarget;
      event.preventDefault();
      if (form.checkValidity() === false) {
        event.stopPropagation();
        return;
      } 
      else{
        save();
      } 
      setValidated(true);
    }

    const save = () => {
      setSaving(true);
      handleClose();
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
        formData.delete('action');
        formData.delete('pagename');
        var html = $("<div />").append(content.clone()).html();
        formData.append('content', html);
        if(mode==1)
          createPage();
        else
          editPage();
        setTimeout(()=>{
          setSaving(false);
        }, 2000);
    }

    const editPage = () => {
      formData.append('action', 'editPage');
      formData.append('page', editPageName);
      request({method: "post", headers: {"Content-Type": "multipart/form-data"}, data: formData});
    }

    const createPage = () => {
      setEditPageName(pageName);
      formData.append('action', 'createPage');
      formData.append('page', pageName);
      request({method: "post", headers: {"Content-Type": "multipart/form-data"}, data: formData});
    }

    return (
        <div style={{height: screenHeight+"px"}} className="block-wrapper">
            <Modal show={show} onHide={handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Имя страницы</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form validated={validated} onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Введите имя новой страницы</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          placeholder=""
                          onChange={changePageName}
                          autoFocus
                        />
                      </Form.Group>
                      <Button type="submit" variant="primary">
                      Сохранить
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                      Отмена
                    </Button>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                  </Modal.Footer>
                </Modal>
            <Button onClick={savePage} className="btn-dialog btn-success editor-btn" disabled={saving} type="submit">
              <Spinner
                className={(!saving)?"hide":""}
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />Сохранить</Button>
              <div className="editorWrapper">
                <SummerEditor model={model} setModel={setModel} formData={formData} imageNames={imageNames} />
              </div>
            {/*<FroalaEditor
                tag='textarea'
                config={config}
                model={model}
                onModelChange={handleModelChange}
            />*/}
        </div>
    )
}