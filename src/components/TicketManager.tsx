import React, {useState, useEffect, useRef} from "react";
import {ListGroup, Button} from 'react-bootstrap';
//import CreateTicket from "./Tickets/createTicketDialog"
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import QuestionForm from './QuestionForm'
import DeleteDialog from './Tickets/DeleteDialog'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import request from "../utils/request";

type varType = {
    answer: string;
    comment: string;
}

type TicketQuestionType = {
    ticket_id: number;
    id: number;
    indx: number;
    code_id: string;
    title: string;
    image: string;
    correct: number;
}

type QuestionType = {
    id: number;
    indx: number;
    code_id: string;
    title: string;
    image: string;
    correct: number;
    variants: Array<varType>
} | null;

type TicketType = {
    id: number;
    name: string;
} | null;

type SubjectType = {
    id: number;
    name: string;
} | null;

var removedIndx = 0,
    removeMethod: Function,
    qId = 0,
    options:any[] = [],
    changePostionLock = false;;
export default () => {

    const [tickets, setTickets] = useState<TicketType[]>([]),
          [subjects, setSubjects] = useState<SubjectType[]>([]),
          [selectedTicket, setSelectedTicket] = useState<number|0>(0),
          [selectedSubject, setSelectedSubject] = useState<number|0>(0),
          [Questions, setQuestions] = useState<QuestionType[] | []>([]),
          [ticketQuestions, setTicketQue] = useState<QuestionType[]>([]),
          [subjectQuestions, setSubjectQue] = useState<QuestionType[]>([]),
          [selectedQuestion, setSelectedQue] = useState<QuestionType|null>(null),
          [selectedQuestion2, setSelectedQue2] = useState<QuestionType|null>(null),
          [newTicketName, setTicketName] = useState(""),
          [newSubjectName, setSubjectName] = useState(""),
          [isEdit, setEditMode] = useState(false),
          [showNewTicket, setShowNewTicket] = useState(false),
          [showNewSubject, setShowNewSubject] = useState(false),
          [show, setShow] = useState(false),
          [deleteDialogShow, setDeleteDialog] = useState(false),
          [search, setSearchValue] = useState<string>(""),
          [ticketNum, setTicketNum] = useState(0),
          [subjectNum, setSubjectNum] = useState(0),
          [filtered, setFiltered] = useState<QuestionType[] | []>([]),
          defaultTicket = {text: "", id: 1, image: "", correct_id: 0, variants: [{answer: '', comment: ''}]};  
    let currentTicket = useRef(defaultTicket);

    useEffect(()=>{
        if(show==false){
            currentTicket.current = defaultTicket;
            setEditMode(false);
        }
        else{
            return;
        }
        getTickets();
        getSubjects();
        getQuestions(setQuestions);
        
        }, []);
    
    useEffect(()=>{
        if(Questions.length>0){
            for(let i=0;i<Questions.length;i++){
                options[i] = {label: Questions[i].code_id, id: Questions[i].id}
            }
        }
    }, [Questions]);

    useEffect(()=>{
        if(selectedTicket!=0)
            getQuestions(setTicketQue);
            
    }, [selectedTicket]);

    useEffect(()=>{
        if(selectedSubject!=0)
            getSubjectQuestions(setSubjectQue);
    }, [selectedSubject]);

    useEffect(()=>{
        setTicketNum(ticketQuestions.length);
    }, [ticketQuestions]);

    useEffect(()=>{
        setSubjectNum(subjectQuestions.length);
    }, [subjectQuestions]);

    const getTickets = () => {
            request({method: 'post', data:{action: 'getTickets'}}).then( response => {
                const {data} = response;
                setTickets(data);
                currentTicket.current = defaultTicket;
                setEditMode(false);
            });
        }

    const getSubjects = () => {
            request({method: 'post', data:{action: 'getSubjects'}}).then( response => {
                const {data} = response;
                setSubjects(data);
                setEditMode(false);
            });
        }

    const updateTicketQuestions = () => {
        getQuestions(setTicketQue);
        getQuestions(setQuestions);
        setTicketNum(ticketQuestions.length);
    }

    const updateSubjectQuestions = () => {
        getSubjectQuestions(setSubjectQue);
        getQuestions(setQuestions);
        setSubjectNum(subjectQuestions.length);
    }
    
    // get all questions if ticketId doesn't exist or ticket's questions else
    const getQuestions = (method: Function, ) => {
        request({method: 'post', data:{action: 'getTicketQuestions', data: {ticketId: selectedTicket}}}).then( response => {
            const {data} = response;
            method(data);
        });
    }

    const getSubjectQuestions = (method: Function, ) => {
        request({method: 'post', data:{action: 'getSubjectQuestions', data: {subjectId: selectedSubject}}}).then( response => {
            const {data} = response;
            method(data);
        });
    }


    const selectTicket = (id: number | 0) => {
        setSelectedTicket(id);
        //getQuestions(setTicketQue);
        }
    
    const selectSubject = (id: number | 0) => {
        setSelectedSubject(id);
    }

    const selectQuestion = (q: QuestionType | null)=>{
        setSelectedQue(q);
    }

    const selectQuestion2 = (q: QuestionType | null)=>{
        setSelectedQue2(q);
    }

    const handleChangeTicketName = (event: any) => {
        setTicketName(event.target.value);
    }

    const handleChangeSubjectName = (event: any) => {
        setSubjectName(event.target.value);
    }

    const handleKeyDownTicket = (e: any) => {
        if(e.keyCode==13)
            createTicket();
    }

    const handleKeyDownSubject = (e: any) => {
        if(e.keyCode==13)
            createSubject();
    }

    const createTicket = () => {
        request({method: "post", data: {action: "addTicket", data: {ticket_name: newTicketName}}}).then(response=>{
            const {data} = response;
            setTickets(prev=>([...tickets, {id: data, name: newTicketName}]));
            setTicketName("");
            setShowNewTicket(false);
        });
        
    }

    const createSubject = () => {
        request({method: "post", data: {action: "addSubject", data: {subject_name: newSubjectName}}}).then(response=>{
            const {data} = response;
            setSubjects(prev=>([...subjects, {id: data, name: newSubjectName}]));
            setSubjectName("");
            setShowNewSubject(false);
        });
    }
    
    const removeTicket = () => {
            request({method: "post", data: {action: "removeTicket", data: {ticket_id: qId}}}).then(()=>{
                getTickets();
            });
        }

    const removeSubject = () => {
        request({method: "post", data: {action: "removeSubject", data: {subject_id: qId}}}).then(()=>{
            getSubjects();
        });
    }

    const removeQuestion = () => {
        let copyQuestions = [...Questions];
        copyQuestions.splice(removedIndx, 1);
        setQuestions(copyQuestions);
        let findItem = ticketQuestions.findIndex(item=>(item!==null)?item.id==qId:false);
        if(findItem!==undefined){
            copyQuestions = [...ticketQuestions];
            copyQuestions.splice(findItem, 1);
            setTicketQue(copyQuestions);
        }
        request({method: "post", data: {action: "removeQuestion", data: {qId: qId}}}).then(()=>{
            if(filtered.length>0){
                getQuestions(setQuestions);
                setFiltered([]);
                setSearchValue("");
            }
        });
    }

    const handleEditQuestion = (question: QuestionType) => {
        setSelectedQue(question);
        setEditMode(true);
    }

    const createQuestion = () => {
        setSelectedQue(null);
        setEditMode(true);
    }

    const addQueToTicket = () => {
        if(selectedQuestion!=null && (ticketQuestions.findIndex(item=>item.id==selectedQuestion.id))===-1){
            // determine next indx of ticket question array
            let max_indx = (ticketQuestions.length>0) ? (ticketQuestions[ticketQuestions.length-1].indx + 1) : 1;
            request({method: "post", data: {action: "addQueToTicket", data: {ticketId: selectedTicket, qId: selectedQuestion.id, next_indx: max_indx}}}).then(response=>{
                setTicketQue(prev=>[...prev, {...selectedQuestion, indx: max_indx}]);
            });
        }
    }

    const addQueToSubject = () => {
        if(selectedQuestion2!=null && (ticketQuestions.findIndex(item=>item.id==selectedQuestion.id))===-1){
            // determine next indx of ticket question array
            let max_indx = (ticketQuestions.length>0) ? (ticketQuestions[ticketQuestions.length-1].indx + 1) : 1;
            request({method: "post", data: {action: "addQueToSubject", data: {subjectId: selectedSubject, qId: selectedQuestion2.id, next_indx: max_indx}}}).then(response=>{
                setSubjectQue(prev=>[...prev, {...selectedQuestion2, indx: max_indx}]);
            });
        }
    }

    const removeTicketQuestion = () => {
        let copyQuestions = [...ticketQuestions];
        copyQuestions.splice(removedIndx, 1);
        setTicketQue(copyQuestions);
        request({method: "post", data: {action: "removeQuestionicket", data: {ticketId: selectedTicket, qId: qId}}});
    }

    const handleRemoveTicketQuestion = (queId: number, indx: number) => {
        setDeleteDialog(true);
        removeMethod = removeTicketQuestion;
        removedIndx = indx;
        qId = queId;
    }

    const handleRemoveQuestion = (queId: number = 0, indx: number) => {
        setDeleteDialog(true);
        removeMethod = removeQuestion;
        removedIndx = indx;
        qId = queId;
        
    }

    const handleRemoveTicket = (tId: number) => {
        setDeleteDialog(true);
        qId = tId;
        removeMethod = removeTicket;
    }

    const handleRemoveSubject = (sId: number) => {
        setDeleteDialog(true);
        qId = sId;
        removeMethod = removeSubject;  
    }

    function sortArrayAsc(prev: QuestionType, next: QuestionType){
        if (prev.indx > next.indx) return 1;
        if (prev.indx == next.indx) return 0;
        if (prev.indx < next.indx) return -1;
        return 0;
    }

    const toUpPos = (i: number) => {
        if(i!=0 && !changePostionLock){
            changePostionLock = true;
            let topItemIndx = 0,
                setter,
                copyTicketQuestions = [];
            copyTicketQuestions = [...ticketQuestions];
            topItemIndx = ticketQuestions[i-1].indx;
            
            copyTicketQuestions[i-1].indx = copyTicketQuestions[i].indx;
            copyTicketQuestions[i].indx = topItemIndx;
            copyTicketQuestions.sort(sortArrayAsc);
            setTicketQue(copyTicketQuestions);
            request({method: "post", data: {action: "changeTicketPos", data: {firstItem: copyTicketQuestions[i-1], secondItem: copyTicketQuestions[i]}}}).then(response=>{
                changePostionLock = false;
            });
        }
    }

    const toDownPos = (i: number) => {
        if(i<(ticketQuestions.length-1)){
            changePostionLock = true;
            let nextIndx = 0,
                setter,
                copyTicketQuestions = [];

            copyTicketQuestions = [...ticketQuestions];
            nextIndx = ticketQuestions[i+1].indx;
            
            copyTicketQuestions[i+1].indx = copyTicketQuestions[i].indx;
            copyTicketQuestions[i].indx = nextIndx;
            copyTicketQuestions.sort(sortArrayAsc);
            setTicketQue(copyTicketQuestions);
            request({method: "post", data: {action: "changeTicketPos", data: {firstItem: copyTicketQuestions[i+1], secondItem: copyTicketQuestions[i], ticket_id:copyTicketQuestions[i].id}}}).then(response=>{
                changePostionLock = false;
            });
        }
    }

    return (
        <>
            <div className="block-wrapper">
                <DeleteDialog show={deleteDialogShow} setShow={setDeleteDialog} title="Вы действительно хотите произвести удаление?" removeMethod={removeMethod}/>
                {/*<CreateTicket ticket={currentTicket.current} setShow={setShow} editMode={isEdit} show={show} removeTicket={removeTicket} getTickets={getTickets}/>*/}
                <div className="col-30">
                    <div className="col-title">Билеты <Button onClick={() => setShowNewTicket(true)} variant="outline-success">+ Создать</Button></div>
                    <ListGroup>
                        {
                            tickets.map((value:TicketType, i: number) => {
                                    return <ListGroup.Item action id={(value?.id || '').toString()} onClick={(e)=>selectTicket(value?.id || 0)} eventKey={value?.id}>{value?.name}<div className="right-panel"><span><i onClick={()=>handleRemoveTicket(value?.id || null)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item> 
                            })      
                        }
                    <InputGroup className={(showNewTicket)?"mb-3":"hide"}>
                        <Form.Control
                            onKeyDown={handleKeyDownTicket}
                            onChange={handleChangeTicketName}
                            placeholder="имя нового билета"
                            value={newTicketName}
                            type="text"
                            id="inputPassword5"
                            aria-describedby="passwordHelpBlock"
                        />
                        <InputGroup.Text className="input-right-btn"><i onClick={createTicket} style={{cursor: "pointer", color: "green"}} className="bi bi-check"></i></InputGroup.Text>
                    </InputGroup>
                    </ListGroup>
                </div>
            
                <div className="col-30">
                    <div className="col-title" style={{marginBottom: "28px"}}>Вопросы билета</div>
                    <ListGroup>
                    {
                        ticketQuestions.map((q:QuestionType, i: number)=>{
                            if(q!=null)
                                return <ListGroup.Item action id={(q?.id || '').toString()} onClick={(e)=>selectQuestion(q)} eventKey={q?.id}><span className="pos-element"><i onClick={()=>toUpPos(i)} className="bi bi-arrow-up"></i><i onClick={()=>toDownPos(i)} className="bi bi-arrow-down"></i></span>{q?.code_id}<div className="right-panel"><span><i onClick={()=>handleRemoveTicketQuestion(q.id, i)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item>  
                        })
                    }
                    </ListGroup>
                    <div className={(ticketNum!=0)?"title-num":"hide"}>количество: {ticketNum}</div>
                </div>
                <div className="middle-column">
                    <i onClick={addQueToTicket} className={"bi bi-arrow-left "+((selectedTicket!==0 && selectedQuestion!=null)?"":"hide")}></i>    
                </div>
                <div className="col-50">
                    <div className="col-title">Вопросы<Button onClick={createQuestion} variant="outline-success">Создать</Button></div>
                    <Autocomplete
                        style={{width: '100%'}}
                        value={search}
                        clearOnBlur={false}
                        onChange={(event: any, newValue: string | null) => {
                            setSearchValue(newValue);
                        }}
                        onInputChange={(event, newInputValue) => {
                            let results = Questions.filter((item:QuestionType)=>item.code_id.indexOf(newInputValue)!=-1);
                            setFiltered(results);
                        }}
                        id="controllable-states-demo"
                        options={options}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="поиск" />}
                    />
                    <ListGroup className={isEdit?"hide":""}>
                    {
                        (filtered.length==0 ? 
                            Questions.map((q:QuestionType, i: number)=>{
                                if(q!=null)
                                    return <ListGroup.Item action id={(q?.id || '').toString()} onClick={(e)=>selectQuestion(q)} eventKey={q?.id}>{q?.code_id}<div className="right-panel"><span><i onClick={()=>handleEditQuestion(q)} className="bi bi-pencil-fill"></i><i onClick={()=>handleRemoveQuestion(q.id, i)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item>  
                            })
                            :
                            (
                                filtered.map((q:QuestionType, i: number)=>(
                                    <ListGroup.Item action id={(q?.id || '').toString()} onClick={(e)=>selectQuestion(q)} eventKey={q?.id}>{q?.code_id}<div className="right-panel"><span><i onClick={()=>handleEditQuestion(q)} className="bi bi-pencil-fill"></i><i onClick={()=>handleRemoveQuestion(q.id, i)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item> 
                                ))   
                            )
                        )
                    }
                    </ListGroup>
                    <QuestionForm show={isEdit} setShow={setEditMode} Question={selectedQuestion} setSelectedQue={setSelectedQue} setQuestions={setQuestions} update={updateTicketQuestions} />
                </div>
            </div>
        </>
        )
}