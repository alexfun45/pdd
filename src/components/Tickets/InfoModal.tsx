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
                        <Modal.Title>Номера вопросов с неправильными ответами</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                        {(questions!=undefined) && (
                            <span>
                                {
                                    questions.map((v: any)=>(
                                        <span className="qItem">{v}</span>
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