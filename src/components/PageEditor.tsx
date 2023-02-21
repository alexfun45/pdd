import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import {useState, useEffect} from "react";
import request from '../utils/request'
// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min.js';
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
import FroalaEditor from 'react-froala-wysiwyg';


const screenHeight = window.screen.height*0.6;
type typeImagesArrayrray = {
  name: string;
  type: string;
};
var formData = new FormData(),
    Images:typeImagesArrayrray[] = [];

export default function PageEditor(){

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
    const [model, setModel] = useState("");

    const handleModelChange = (data: string) => {
        setModel(data);
    }

    const savePage = () => {
        formData.append('content', model);
        formData.append('action', 'createPage');
        request({method: "post",headers: {"Content-Type": "multipart/form-data"}, data: formData});
    }

    return (
        <div style={{height: screenHeight+"px"}} className="block-wrapper">
            <Button onClick={savePage} className="btn-dialog btn-success editor-btn" type="submit">Сохранить</Button>
            <FroalaEditor
                tag='textarea'
                config={config}
                model={model}
                onModelChange={handleModelChange}
            />
        </div>
    )
}