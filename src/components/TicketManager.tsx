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
    changePostionLock = false,
    ItemNewName = "";

export default () => {

    const [tickets, setTickets] = useState<TicketType[]>([]),
          [selectedTicket, setSelectedTicket] = useState<number|0>(0),
          [Questions, setQuestions] = useState<QuestionType[] | []>([]),
          [ticketQuestions, setTicketQue] = useState<QuestionType[]>([]),
          [selectedQuestion, setSelectedQue] = useState<QuestionType|null>(null),
          [newTicketName, setTicketName] = useState(""),
          [isEdit, setEditMode] = useState(false),
          [showNewTicket, setShowNewTicket] = useState(false),
          [show, setShow] = useState(false),
          [deleteDialogShow, setDeleteDialog] = useState(false),
          [search, setSearchValue] = useState<string>(""),
          [ticketNum, setTicketNum] = useState(0),
          [filtered, setFiltered] = useState<QuestionType[] | []>([]),
          [renameItemId, setRenameId] = useState(0),
          [sortOrder, setSortOrder] = useState("asc"),
          textInput:React.RefObject<HTMLInputElement> = React.useRef(),
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
        setTicketNum(ticketQuestions.length);
    }, [ticketQuestions]);

    const getTickets = () => {
            request({method: 'post', data:{action: 'getTickets'}}).then( response => {
                const {data} = response;
                setTickets(data);
                currentTicket.current = defaultTicket;
                setEditMode(false);
            });
        }

    const updateTicketQuestions = () => {
        getQuestions(setTicketQue);
        getQuestions(setQuestions);
        setTicketNum(ticketQuestions.length);
    }
    
    // get all questions if ticketId doesn't exist or ticket's questions else
    const getQuestions = (method: Function, ) => {
        request({method: 'post', data:{action: 'getTicketQuestions', data: {ticketId: selectedTicket}}}).then( response => {
            const {data} = response;
            method(data);
        });
    }


    const selectTicket = (id: number | 0) => {
        setSelectedTicket(id);
        //getQuestions(setTicketQue);
        }
    
    const selectQuestion = (q: QuestionType | null)=>{
        setSelectedQue(q);
    }

    const handleChangeTicketName = (event: any) => {
        setTicketName(event.target.value);
    }

    const handleKeyDownTicket = (e: any) => {
        if(e.keyCode==13){
            ItemNewName = e.target.value;
            createTicket();
        }
    }

    const createTicket = () => {
        ItemNewName =(ItemNewName=="")? textInput.current.value:ItemNewName;
        request({method: "post", data: {action: "addTicket", data: {ticket_name: ItemNewName}}}).then(response=>{
            const {data} = response;
            setTickets(prev=>([...tickets, {id: data, name: ItemNewName}]));
            ItemNewName = "";
            setShowNewTicket(false);
        });
    }
    
    const removeTicket = () => {
            request({method: "post", data: {action: "removeTicket", data: {ticket_id: qId}}}).then(()=>{
                getTickets();
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

    const handleRenameItem = (ticketId: number) => {
        setRenameId(ticketId);
        ItemNewName = "";
    }

    const handleChangeItemName = (e: React.ChangeEvent<HTMLInputElement>) => {
        ItemNewName = e.target.value;
    }

    const cancelEdit = () => {
        setRenameId(0);
    }

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLDivElement>) => {
        if(e.keyCode==27)
            cancelEdit();
        if(e.keyCode==13){
          if(renameItemId!=0 && ItemNewName!=""){
            request({method: "post", data: {action: "renameTicket", data: {id: renameItemId, newName: ItemNewName}}}).then(response=>{
                setRenameId(0);
                let copy = [...tickets];
                copy[i].name = ItemNewName;
                setTickets(copy);
                ItemNewName = "";
            });
          }
        }
    }

    const getNumber = (__str: string) => {
        return parseInt(__str.replace(/^\D+/g, ''));
    }

    const sortTicket = () => {
        let copyTickets = [...tickets];
        if(sortOrder=='asc'){
            copyTickets.sort((a, b)=>getNumber(a.name)<getNumber(b.name)?1:-1);
            setSortOrder('desc');
        }
        else{
            copyTickets.sort((a, b)=>getNumber(b.name)<getNumber(a.name)?1:-1);
            setSortOrder('asc');
        }
        setTickets(copyTickets);
    }

    const handleCreateButton = () => {
        let list = document.getElementById('listItemsTickets');
        list.scrollTop = list.scrollHeight;
        textInput.current.focus();
        setShowNewTicket(true);
    }
    
    return (
        <>
            <div className="block-wrapper">
                <DeleteDialog show={deleteDialogShow} setShow={setDeleteDialog} title="Вы действительно хотите произвести удаление?" removeMethod={removeMethod}/>
                {/*<CreateTicket ticket={currentTicket.current} setShow={setShow} editMode={isEdit} show={show} removeTicket={removeTicket} getTickets={getTickets}/>*/}
                <div className="col-30">
                    <div className="col-title">Билеты <Button onClick={handleCreateButton} variant="outline-success">+ Создать</Button></div>
                    <div style={{textAlign: 'left'}}><span onClick={sortTicket} style={{fontSize: '12px', color: '#3c96e6', cursor: 'pointer'}}>сортировать<i className={(sortOrder=="asc")?"bi bi-arrow-down":"bi bi-arrow-up"}></i></span></div>
                    <ListGroup id="listItemsTickets">
                        {
                            tickets.map((value:TicketType, i: number) => {
                                    return <ListGroup.Item action id={(value?.id || '').toString()} onClick={(e)=>selectTicket(value?.id || 0)} onDoubleClick={()=>handleRenameItem(value?.id || 0)} eventKey={value?.id}><span className={renameItemId==value.id?"":"hide"}><TextField defaultValue={value?.name} onKeyDown={(e)=>handleKeyDown(i, e)} onChange={handleChangeItemName} style={{width: '70%'}} label="" /></span><span className={renameItemId==value.id?"hide":""}>{value?.name}</span><div className="right-panel"><span><i onClick={()=>handleRenameItem(value?.id || 0)} className={renameItemId!=value.id?"bi bi-pencil-fill":"hide"}></i><i onClick={()=>handleRemoveTicket(value?.id || null)} className={renameItemId!=value.id?"bi bi-trash3-fill":"hide"}></i><Button onClick={()=>cancelEdit()} className={renameItemId==value.id?"":"hide"} style={{fontSize:"11px", marginTop: '7px'}} variant="danger">отмена</Button></span></div></ListGroup.Item> 
                            })      
                        }
                    <InputGroup className={(showNewTicket)?"mb-3":"hide"}>
                        <Form.Control
                            ref={textInput}
                            onKeyDown={handleKeyDownTicket}
                            placeholder="имя нового билета"
                            defaultValue={newTicketName}
                            type="text"
                            id="inputNewItem"
                        />
                        <InputGroup.Text className="input-right-btn"><i onClick={createTicket} style={{cursor: "pointer", color: "green"}} className="bi bi-check"></i></InputGroup.Text>
                    </InputGroup>
                    </ListGroup>
                    <div className={(tickets.length!=0)?"title-num":"hide"}>количество: {tickets.length}</div>
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
                    <ListGroup style={{width: '100%'}} className={isEdit?"hide":""}>
                    {
                        (filtered.length==0 ? 
                            Questions.map((q:QuestionType, i: number)=>{
                                if(q!=null)
                                    return <ListGroup.Item action id={(q?.id || '').toString()} onClick={(e)=>selectQuestion(q)}  onDoubleClick={()=>handleRenameItem(q?.id || 0)} eventKey={q?.id}>{q?.code_id}<div className="right-panel"><span><i onClick={()=>handleEditQuestion(q)} className="bi bi-pencil-fill"></i><i onClick={()=>handleRemoveQuestion(q.id, i)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item>  
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
                    <div className={(Questions.length!=0 && !isEdit)?"title-num":"hide"}>количество: {filtered.length==0?Questions.length:filtered.length}</div>
                    <QuestionForm show={isEdit} setShow={setEditMode} Question={selectedQuestion} setSelectedQue={setSelectedQue} setQuestions={setQuestions} update={updateTicketQuestions} />
                </div>
            </div>
        </>
        )
}