import {useState, useEffect} from 'react'
import { SketchPicker } from 'react-color';
import reactCSS from 'reactcss'
import {Button} from 'react-bootstrap';
import request from '../utils/request'

let formData = new FormData(),
    Data: any = {};

export default () => {
    const
        [settings, setSettings] = useState({
            'background-color': '#FFF',
            'background-image': '',
            'showLogo': '1'
        }),    
        [state, setState] = useState<any>({
            displayColorPicker: false,
            color: '#FFF',
        });

        useEffect(()=>{
            request({method: 'post', data: {action: 'getSettings'}}).then(response => {
                const {data} = response;
                setSettings(data);
            });
        }, []);

       

        const styles = reactCSS({
            'default': {
              color: {
                width: '36px',
                height: '14px',
                borderRadius: '2px',
                background: `rgba(${ state.color.r }, ${ state.color.g }, ${ state.color.b }, ${ state.color.a })`,
              },
              swatch: {
                padding: '5px',
                background: '#fff',
                borderRadius: '1px',
                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                display: 'inline-block',
                cursor: 'pointer',
              },
              popover: {
                position: 'absolute',
                zIndex: '2',
              },
              cover: {
                position: 'fixed',
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
              },
            },
          });
        const handleClick = () => {
            setState({...state, 'displayColorPicker': !state.displayColorPicker })
          };
        
        const handleClose = () => {
            setState({ ...state, displayColorPicker: false });
          };
        
        const handleChange = (color: any) => {
            setState({ ...state, color: color.rgb });
            let bgcolor = `rgba(${ state.color.r }, ${ state.color.g }, ${ state.color.b }, ${ state.color.a })`;
            setSettings({...settings, 'background-color': bgcolor});
            formData.delete('bgcolor');
            formData.append('bgcolor', bgcolor);
            document.body.style.backgroundColor = bgcolor;
          };
        
        const uploadImage =(e: React.ChangeEvent<HTMLInputElement>) => {
            let file = (e.target.files) ? e.target.files[0]:'';
            var reader = new FileReader();
            reader.onload = function(e){
              if(e.target)
                if(reader.result){
                  document.body.style.backgroundImage = `url(${reader.result})`;
                }
            }
            if(e.target.files!=null)
              reader.readAsDataURL(e.target.files[0]);
            formData.delete('file');
            formData.append('file', file);
        }

        const removeBgImage = () => {
          request({method: "post", data: {action: "removeBgImage"}});
          document.body.style.backgroundImage = "";
        }

        const saveSettings = () => {
          formData.delete('action');
          formData.append('action', 'save_settings');
          request({method: "post", headers: {"Content-Type": "multipart/form-data"}, data: formData});
        }

        const setShowLogo = (e: any) => {
          let checked = (e.target.checked)?'1':'0';
          formData.append('showLogo', checked);
          setSettings({...settings, 'showLogo':checked});
        }
   
    return (
        <div className="block-wrapper">
          <table className="configTable">
            <tr>
              <td>Цвет фона</td>
            <td>
                <div style={ styles.swatch } onClick={ handleClick }>
                <div style={ styles.color } />
                </div>
                { state.displayColorPicker ? <div style={ {position: 'absolute', zIndex: '2'} }>
                    <div style={{position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px'}} onClick={ handleClose }/>
                <SketchPicker color={ settings['background-color'] } onChange={ handleChange } />
                </div> : null }
                </td>
            </tr>
            <tr>
              <td>Фоновое изображение</td>
              <td>
                <input onChange={uploadImage} accept="image/png, image/gif, image/jpeg" type='file' />
                <Button onClick={removeBgImage} variant="warning">Удалить</Button>
              </td>
            </tr>
            <tr>
              <td>Показывать лого</td>
              <td>
                <input onChange={setShowLogo} type="checkbox" checked={(settings['showLogo']=='1')} />
              </td>
            </tr>
          </table>
            <div><Button variant="success" onClick={saveSettings}>Сохранить</Button></div>
        </div> 
       
    )
}