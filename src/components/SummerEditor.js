import React, { Component } from 'react';
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css'; // import styles
import 'react-summernote/lang/summernote-ru-RU'; // you can import any other locale

// Import bootstrap(v3 or v4) dependencies
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/tooltip';
//import 'react-summernote/src/summernote-image-attributes'
import '../lib/summernote-image-attributes'
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
      ReactSummernote.insertImage(reader.result, $image=>{
       
        //$image.wrap("<a href='"+$image+"'></a>");
      });
    }
    reader.readAsDataURL(img[0]);
    props.formData.append("opt", "test");
    props.formData.append(img[0].name, img[0]);
    props.imageNames.push(img[0].name);
    console.log("img[0].name", img[0].name);
    console.log("img[0]", img[0]);
  }
    return (
      <ReactSummernote
        value={props.model}
        options={{
          lang: 'ru-RU',
          height: '500px',
          dialogsInBody: true,
          plugins: ["hello"],
          //fontNames: [ 'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 'Courier New', 'Times New Roman', 'Verdana', 'Roboto', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Sacramento'],
          'fontNames': ['Sans-Serif', 'Sans', 'Arial', 'Courier', 'Times New Roman', 'Verdana', 'Roboto', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Sacramento'],
          fontNamesIgnoreCheck: [ 'Sans-Serif', 'Sans', 'Arial',  'Courier', 'Times New Roman','Verdana', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Sacramento'],
          fontSizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
          popover: {
            image: [
                ['custom', ['imageAttributes']],
                ['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
                ['float', ['floatLeft', 'floatRight', 'floatNone']],
                ['remove', ['removeMedia']]
            ],
        },
        imageAttributes:{
          icon:'<i class="note-icon-pencil"/>',
          removeEmpty:false, // true = remove attributes | false = leave empty if present
          disableUpload: false // true = don't display Upload Options | Display Upload Options
      },
          toolbar: [
            ['style', ['style']],
            ['fontname', ['fontname']],
            //['fontNames', ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Sans-serif', 'Helvetica', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana', 'Roboto']],
            ['font', ['fontsize', 'bold', 'underline', 'clear']],
            ['color', ['color']],
            //['fontname', ['fontname']],
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