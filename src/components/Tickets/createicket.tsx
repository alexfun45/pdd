import {useState, useEffect} from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default (props: {show: boolean, setShow: Function}) => {

    //const [show, setShow] = useState(props._show);
    const handleClose = () => {
        props.setShow(false);
    }
    
    return (
        <Modal
                show={props.show}
                animation={false}
                onHide={() => handleClose()}
                dialogClassName="modal-90w"
                aria-labelledby="example-custom-modal-styling-title"
            >
                <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                    Custom Modal Styling
                </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                </Modal.Body>
            </Modal>
    )
}