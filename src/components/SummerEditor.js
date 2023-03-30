import React, { Component } from 'react';
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css'; // import styles
import 'react-summernote/lang/summernote-ru-RU'; // you can import any other locale

// Import bootstrap(v3 or v4) dependencies
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/tooltip';
//import 'bootstrap-icons/font/bootstrap-icons.css'
//import 'bootstrap/dist/css/bootstrap.css';

var HelloButton = function (context) {
  var ui = $.summernote.ui;

  // create button
  var button = ui.button({
    contents: '<i class="fa fa-child"/> Hello',
    tooltip: 'hello',
    click: function () {
      // invoke insertText method with 'hello' on editor module.
      context.invoke('editor.insertText', 'hello');
    }
  });

  return button.render();   // return button as jquery object
}

export default (props) => {

  const onChange = (content) => {
    props.setModel(content);
  }

  const imageUpload = (img, insertImage, welEditable) => {
    var reader = new FileReader();
    reader.onloadend = function() {
      ReactSummernote.insertImage(reader.result);
    }
    reader.readAsDataURL(img[0]);
    props.formData.append("opt", "test");
    props.formData.append(img[0].name, img[0]);
    props.imageNames.push(img[0].name);
  }
    return (
      <ReactSummernote
        value={props.model}
        options={{
          lang: 'ru-RU',
          height: '500px',
          dialogsInBody: true,
          toolbar: [
            ['style', ['style']],
            ['font', ['fontsize', 'bold', 'underline', 'clear']],
            ['color', ['color']],
            ['fontname', ['fontname']],
            ['para', ['ul', 'ol', 'paragraph', 'height']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview']],
            ['height', ['height']],
            ['misc', ['undo', 'redo']]
            //['mybutton', ['myphoto']]
          ],
          lineHeights:['0.2', '0.3', '0.4', '0.5', '0.6', '0.8', '1.0', '1.2', '1.4', '1.5', '2.0', '3.0']
          //buttons: {
            //myphoto: HelloButton
        //},
        }}
        onImageUpload={imageUpload}
        onChange={onChange}
      />
    );
}