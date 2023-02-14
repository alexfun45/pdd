import React, {useState, useEffect, MutableRefObject} from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {useForm} from 'react-hook-form'
import request from '../../utils/request'

type InputSignInTypes = { 
    answer: string;
    comment: string;
  };

const Question = ({answer, indx, handleChangeQuestions, setCorrect}: {answer:InputSignInTypes, indx: number, handleChangeQuestions: Function, setCorrect: Function}) => {

    return (
        <div key={indx} className="variant-section">
            <div>
                <input type="radio" onChange={setCorrect(indx)} name="correct[]" value={indx} style={{float: "left", marginRight: "3px", marginTop: "6px"}} />
                <input type="text" onChange={(e)=>handleChangeQuestions(e.target.value, "answer", indx)} name={"answer"+indx} value={answer.answer} className="text var_text required ui-widget-content ui-corner-all" />
                <div className="input-label">текст варианта ответа</div>
            </div>
            <div style={{paddingLeft: "16px"}}>
                <input type="text" name="comment"  onChange={(e)=>handleChangeQuestions(e.target.value, "comment", indx)} id="comment" value={answer.comment} className="text ui-widget-content ui-corner-all" />
                <div className="input-label">комментарий к варианту ответа</div>
            </div>
        </div> 
    )
}

type answerType = {
    answer: string;
    comment: string;
  };

type TicketDialog = {
    text: string;
    correct: number;
    variants: answerType[]
}

export default ({show, ticket, editMode, setShow}: {show: boolean, ticket: MutableRefObject<TicketDialog>, editMode: boolean, setShow: Function}) => {

    let formData = new FormData();
    const [text, setText] = useState(ticket.current.text),
          [correct_id, setCorrect] = useState(ticket.current.correct);
    let [answers, setAnswers] = useState<any[]>(ticket.current.variants);
    
    useEffect(()=>{
        setText(ticket.current.text);
        setAnswers(ticket.current.variants);
    }, [ticket.current]);

    const handleClose = () => {
        setShow(false);
    }

    const uploadImage =(e: React.ChangeEvent<HTMLInputElement>) => {
        let file = (e.target.files) ? e.target.files[0]:'';
        formData.append('file', file);
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        formData.append("text", e.target.value);
        setText(e.target.value);
    }

    const handleChangeQuestions = (v:string, prop: string, indx: number) => {
        let q = [...answers];
        q[indx][prop] = v;
        setAnswers(q);
    }

    const addQuestion = () => {
        let newQ = [...answers, {answer: '', comment: ''}];
        setAnswers(newQ);
    }

    const onSubmit = () => {
        formData.append("action", "addTicket");
        formData.append("text", text);
        formData.append("correct", correct_id.toString());
        formData.append("variants", JSON.stringify(answers));
        request({method: "post", headers: {"Content-Type": "multipart/form-data"},  data: formData}).then(()=>{
            handleClose();
        })
    }

    const { register, handleSubmit, setError, watch, setValue, formState: { errors } } = useForm<InputSignInTypes>({mode: 'onBlur'});
    
    return (
        <Modal
                show={show}
                animation={false}
                dialogClassName="modal-90w"
                onHide={() => handleClose()}
                aria-labelledby="example-custom-modal-styling-title"
            >
                <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                    Создание нового вопроса
                </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <fieldset>
                            <label >Текст вопроса</label>
                            <input onChange={handleInput} value={text} type="text" name="text" id="ticket_text" className="text required ui-widget-content ui-corner-all" />
                            <label>Изображение</label>
                            <img style={{maxWidth: "90%"}} id="t_img" />
                            <input type="file" onChange={uploadImage} name="image" id="ticket_image" className="text ui-widget-content ui-corner-all" />
                            <label>Варианты ответов:</label>
                            <div className="answers_block">
                               {
                                 answers.map((v, i)=>(
                                   <Question answer={answers[i]} handleChangeQuestions={handleChangeQuestions} indx={i} setCorrect={setCorrect} />
                                 ))
                               }
                                <span id="add_var" onClick={addQuestion} style={{position: "absolute", right: "2px", color: "#76cf76", bottom: "10px", top: "auto", cursor: "pointer"}} className="glyphicon glyphicon-plus"></span>
                            </div>   
                        </fieldset> 
                        <div style={{textAlign: "right"}}><Button className="btn-dialog btn-success" type="submit">Сохранить</Button><Button className="btn-dialog btn-cancel" type="submit">Отмена</Button><Button className="btn-dialog btn-danger" type="submit">Удалить</Button></div>
                    </form>
                </Modal.Body>
            </Modal>
    )
}