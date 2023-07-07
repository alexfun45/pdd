import {useState, useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {Form} from 'react-bootstrap';
import {Modal, Button} from 'react-bootstrap';

export default ({showDialog, setOpen, fQuestions}:{showDialog: boolean, setOpen: Function, fQuestions: any}) => {
    const [show, setShow] = useState(showDialog),
          [questions, setQue] = useState([]);

    useEffect(()=>{
        setShow(showDialog);
    }, [showDialog]);

    useEffect(()=>{
        setQue(fQuestions);
    }, [fQuestions]);

    const handleClose = () => setOpen(false);

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Неправильные ответы</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>список неправильных ответов:
                        {(questions!=undefined) && (
                            <span>
                                {
                                    questions.map((v: any)=>(
                                        <span style={{color: '#1f82d8', marginLeft: '5px'}}>{v}</span>
                                    ))
                                    
                                }
                            </span>
                        )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={()=>setOpen(false)} variant="secondary">Закрыть</Button>
                    </Modal.Footer>
            </Modal>
        </>
    )
}