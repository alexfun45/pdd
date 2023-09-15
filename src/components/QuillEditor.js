import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import React, { useState, Suspense, useMemo, useRef } from 'react';
import ImageResize from 'quill-image-resize-module-react';
import ImageUploader from "quill-image-uploader";
import 'quill-image-uploader/dist/quill.imageUploader.min.css';
import VideoResize from 'quill-video-resize-module-fixed';

const fontSizeArr  = ['10px', '11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px', '21px', '22px', '23px', '24px', '25px', '26px', '27px', '28px', '29px', '30px'];
const fontNames =  [ 'Sans', 'Arial',  'Courier', 'Times New Roman', 'Verdana', 'Comic', 'Helvetica', 'Impact', 'Lucida', 'Sacramento']
export default ({model, setModel, formData, imageNames}) => {
    const editorRef = useRef();
    const [editorContent, setEditorContent] = useState('');
        let Size  = Quill.import('attributors/style/size');
        Size.whitelist = fontSizeArr;
        Quill.register(Size, true);
        var Font = Quill.import('formats/font');
        Font.whitelist = fontNames;
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        
            ['blockquote', 'code-block'],
        
            [{ 'header': 1 }, { 'header': 2 }],               
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            [{ 'script': 'sub'}, { 'script': 'super' }],      
            [{ 'indent': '-1'}, { 'indent': '+1' }],          
            [{ 'direction': 'rtl' }],                       
        
            [{ 'size':  Size.whitelist}],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
            [{ 'color': [] }, { 'background': [] }],          
            [{ 'font': Font.whitelist }],
            [{ 'align': [] }]
        ];
        
        Quill.register(Font, true);
        Quill.register('modules/imageResize', ImageResize);
        Quill.register("modules/imageUploader", ImageUploader);
        Quill.register('modules/VideoResize', VideoResize);     

    const handleChangeContent = (content, delta, source, editor) => {
        setModel(content);
    }

    const imageHandler = (e) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            var reader = new FileReader();
            reader.onloadend = function() {
                const editor = editorRef.current.getEditor();
                console.log("getSelection", editor.getSelection());
                editor.insertEmbed(editor.getSelection().index, "image", reader.result);
            }
            reader.readAsDataURL(input.files[0]);
            formData.append(file.name, file);
            imageNames.push(file.name);
        }
    }

    const imageUpload = (file) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(
                file
              );
            }, 3500);
        });
    }

    const modules = useMemo(() => ({
        toolbar: { container: toolbarOptions, handlers: {image: imageHandler}},
            imageResize: {
                parchment: Quill.import('parchment'),
                modules: ['Resize', 'DisplaySize', 'Toolbar'],
            },
            videoResize: {
                modules: [ 'Resize', 'DisplaySize', 'Toolbar' ],
                toolbarStyles: {
                    backgroundColor: 'black',
                    border: 'none',
                    color: '#000'
                },
                handleStyles: {
                    backgroundColor: 'black',
                    border: 'none',
                    color: '#000'
                }
            }
        }), [])
      
    return (
            <Suspense fallback={<div>Загрузка...</div>}>
                <ReactQuill 
                    modules={modules}
                    value={model}
                    onChange={handleChangeContent}
                    ref={editorRef}
                />
            </Suspense>
    );
}