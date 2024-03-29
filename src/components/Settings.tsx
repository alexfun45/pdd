import {useState, useEffect} from 'react'
import { SketchPicker } from 'react-color';
import reactCSS from 'reactcss'
import {Button} from 'react-bootstrap';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Spinner from 'react-bootstrap/Spinner';
import request from '../utils/request'

let formData = new FormData(),
    Data: any = {};

export default ({allPages = []} : any) => {
    const
        [settings, setSettings] = useState({
            'background-color': '#FFF',
            'background-image': '',
            'background-color-tickets': '#FFF',
            'background-image-tickets': '',
            'background-image-tickets-mobile': '',
            'image_title_exam_mobile': '',
            'showLogo': '1',
            'start_page': {id: 1, name: 'OOO', title: 'Общие правила'},
            'exam_title': '',
            'show_exam_title': '0',
            'shuffle_tickets': '0'
        }),
        [loading, setLoading] = useState(false),
        [start_page, setStartPage] = useState(null),
        [showTicketTitle, setShowTitle] = useState(false),
        [titleExam, setExamTitle] = useState(),
        [state, setState] = useState<any>({
            displayColorPicker: false,
            color: '#FFF',
        }),
        [stateBackground, setStateBackground] = useState<any>({
            displayColorPicker: false,
            color: '#FFF',
      });
        
        useEffect(()=>{
            request({method: 'post', data: {action: 'getSettings'}}).then(response => {
                const {data} = response;
                setSettings(data);
                setStateBackground({ ...stateBackground, color: data['background-color-tickets'] });
                setStartPage(data.start_page);
                setExamTitle(data.exam_title);
            });
        }, []);

       const handleChangeTitle = (e: any) => {
        setExamTitle(e.target.value);
        formData.delete('exam_title');
        formData.append('exam_title', e.target.value);
       }

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
          const styles2 = reactCSS({
            'default': {
              color: {
                width: '36px',
                height: '14px',
                borderRadius: '2px',
                background: `rgba(${ stateBackground.color.r }, ${ stateBackground.color.g }, ${ stateBackground.color.b }, ${ stateBackground.color.a })`,
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

        const handleClick2 = () => {
          setStateBackground({...stateBackground, 'displayColorPicker': !stateBackground.displayColorPicker })
          };
        
        const handleClose = () => {
            setState({ ...state, displayColorPicker: false });
          };

        const handleClose2 = () => {
          setStateBackground({ ...stateBackground, displayColorPicker: false });
          };
        
        const handleChange = (color: any) => {
            setState({ ...state, color: color.rgb });
            let bgcolor = `rgba(${ state.color.r }, ${ state.color.g }, ${ state.color.b }, ${ state.color.a })`;
            setSettings({...settings, 'background-color': bgcolor});
            formData.delete('bgcolor');
            formData.append('bgcolor', bgcolor);
            document.body.style.backgroundColor = bgcolor;
            console.log("background-color", bgcolor);
            
          };

        const handleChange2 = (color: any) => {
            setStateBackground({ ...stateBackground, color: color.rgb });
            let bgcolor = `rgba(${ stateBackground.color.r }, ${ stateBackground.color.g }, ${ stateBackground.color.b }, ${ stateBackground.color.a })`;
            setSettings({...settings, 'background-color-tickets': bgcolor});
            formData.delete('bgcolor_tickets');
            formData.append('bgcolor_tickets', bgcolor);
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

        const uploadImage2 = (e: React.ChangeEvent<HTMLInputElement>) => {
          let file = (e.target.files) ? e.target.files[0]:'';
          var reader = new FileReader();
          if(e.target.files!=null)
            reader.readAsDataURL(e.target.files[0]);
          formData.delete('file_tickets');
          formData.append('file_tickets', file);
      }

      const uploadImageTitleExam =(e: React.ChangeEvent<HTMLInputElement>) => {
        let file = (e.target.files) ? e.target.files[0]:'';
        var reader = new FileReader();
        if(e.target.files!=null)
          reader.readAsDataURL(e.target.files[0]);
        formData.delete('file_titleimg');
        formData.append('file_titleimg', file);
    } 

    const uploadImageTitleExamMobile = (e: React.ChangeEvent<HTMLInputElement>) => {
      let file = (e.target.files) ? e.target.files[0]:'';
      var reader = new FileReader();
      if(e.target.files!=null)
        reader.readAsDataURL(e.target.files[0]);
      formData.delete('file_titleimg_mobile');
      formData.append('file_titleimg_mobile', file);
  } 

    const uploadImageMobile = (e: React.ChangeEvent<HTMLInputElement>) => {
      let file = (e.target.files) ? e.target.files[0]:'';
      var reader = new FileReader();
      if(e.target.files!=null)
        reader.readAsDataURL(e.target.files[0]);
      formData.delete('file_tickets_mobile');
      formData.append('file_tickets_mobile', file);
    }

    const removeBgImageMobile = () => {
      request({method: "post", data: {action: "removeBgImageMobile"}});
      document.body.style.backgroundImage = "";
    }

    const removeBgImage = () => {
          request({method: "post", data: {action: "removeBgImage"}});
          document.body.style.backgroundImage = "";
        }

    const removeBgImage2  = () => {
          request({method: "post", data: {action: "removeBgTicketsImage"}});
        }

      const removeImageTitleExam = () => {
        request({method: "post", data: {action: "removeImageTitleExam"}});
      }

      const removeImageTitleExamMobile = () => {
        request({method: "post", data: {action: "removeImageTitleExamMobile"}});
      }

        const saveSettings = () => {
          setLoading(true);
          formData.delete('action');
          formData.append('action', 'save_settings');
          request({method: "post", headers: {"Content-Type": "multipart/form-data"}, data: formData});
          setTimeout(()=>{
            setLoading(false);
          }, 2000);
        }

        const setShowLogo = (e: any) => {
          let checked = (e.target.checked)?'1':'0';
          formData.append('showLogo', checked);
          setSettings({...settings, 'showLogo':checked});
        }

        const setShuffleTickets = (e: any) => {
          let checked = (e.target.checked)?'1':'0';
          formData.append('shuffle_tickets', checked);
          setSettings({...settings, 'shuffle_tickets':checked});
        }

        const handleChangeStartPage = (e:any, value: any) => {
          if(value){
            setStartPage(value);
            formData.delete('start_page');
            formData.append('start_page', value.id);
          }
        }

      const handleShowTitle = (e: any) => {
        let checked = (e.target.checked)?'1':'0';
        setSettings({...settings, 'show_exam_title':checked});
        formData.append('show_exam_title', checked);
      }

      const Update = () =>{
        request({method: "post", data: {action: "update"}});
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
                <input name="bgimg" onChange={uploadImage} accept="image/png, image/gif, image/jpeg" type='file' />
                <Button onClick={removeBgImage} variant="warning">Удалить</Button>
              </td>
            </tr>
            <tr>
              <td>Цвет фона раздела Билеты</td>
            <td>
                <div style={ styles2.swatch } onClick={ handleClick2 }>
                <div style={ styles2.color } />
                </div>
                { stateBackground.displayColorPicker ? <div style={ {position: 'absolute', zIndex: '2'} }>
                    <div style={{position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px'}} onClick={ handleClose2 }/>
                    <SketchPicker color={ settings['background-color-tickets'] } onChange={handleChange2} />
                    </div> : null }
                </td>
            </tr>
            <tr>
              <td>Фоновое изображение раздела Билеты(desktop)</td>
              <td>
                <input name="bgimg_tickets" onChange={uploadImage2} accept="image/png, image/gif, image/jpeg" type='file' />
                <Button onClick={removeBgImage2} variant="warning">Удалить</Button>
              </td>
            </tr>
            <tr>
              <td>Начальное изображение раздела Внутреннего экзамена(desktop)</td>
              <td>
                <input name="bgimg_tickets" onChange={uploadImageTitleExam} accept="image/png, image/gif, image/jpeg" type='file' />
                <Button onClick={removeImageTitleExam} variant="warning">Удалить</Button>
              </td>
            </tr>
            <tr>
              <td>Фоновое изображение раздела Билеты(mobile)</td>
              <td>
                <input name="bgimg_tickets" onChange={uploadImageMobile} accept="image/png, image/gif, image/jpeg" type='file' />
                <Button onClick={removeBgImageMobile} variant="warning">Удалить</Button>
              </td>
            </tr>
            <tr>
              <td>Начальное изображение раздела Внутреннего экзамена(mobile)</td>
              <td>
                <input name="bgimg_tickets" onChange={uploadImageTitleExamMobile} accept="image/png, image/gif, image/jpeg" type='file' />
                <Button onClick={removeImageTitleExamMobile} variant="warning">Удалить</Button>
              </td>
            </tr>
            <tr>
              <td>Показывать лого</td>
              <td>
                <input onChange={setShowLogo} type="checkbox" checked={(settings['showLogo']=='1')} />
              </td>
            </tr>
            <tr>
              <td>Начальная страница</td>
              <td>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={allPages}
                getOptionLabel={(option: any) => (option!=null) ? option.title: ""}
                sx={{ width: '100%' }}
                value={(start_page)?start_page:""}
                onChange={handleChangeStartPage}
                renderInput={(params) => <TextField sx={{width: '100%', backgroundColor: '#FFF'}} {...params} label="Имя страницы" />}
              />
              </td>
            </tr>
            <tr>
              <td>Заголовок выбора билета</td>
              <td><TextField style={{width: '100%', backgroundColor: '#FFF'}} onChange={handleChangeTitle} value={titleExam} /></td>
            </tr>
            <tr>
              <td>Показывать заголовок</td>
              <td><input onChange={handleShowTitle} type="checkbox" checked={(settings['show_exam_title']=='1')} /></td>
            </tr>
            <tr>
              <td>Перемешивать билеты</td>
              <td><input onChange={setShuffleTickets} type="checkbox" checked={(settings['shuffle_tickets']=='1')} /></td>
            </tr>
          </table>
            <div><Button variant="success" onClick={saveSettings}>
              <Spinner
                className={(!loading)?"hide":""}
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />Сохранить</Button>
              {/*<Button variant="success" onClick={Update}>Обновить</Button>*/}
            </div>
        </div> 
       
    )
}