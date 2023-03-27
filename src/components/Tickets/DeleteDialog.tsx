import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default ({show, setShow, removeMethod}: {show: boolean, setShow: React.Dispatch<React.SetStateAction<boolean>>, removeMethod: Function}) => {

    return (
        <Modal
            show={show}
            animation={false}
            onHide={() => setShow(false)}
            >
            <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                    Удаление
                </Modal.Title>
                </Modal.Header>  
                <Modal.Body>
                    <div>Вы действительно хотите удалить билет?</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={()=>removeMethod()} variant="primary" className="btn-danger">Да</Button>
                    <Button onClick={()=>setShow(false)} variant="secondary">Отмена</Button>
                </Modal.Footer>
        </Modal>
        )
}