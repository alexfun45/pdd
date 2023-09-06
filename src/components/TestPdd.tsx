
import React, {useState, useEffect, useRef} from "react";
import {useForm} from 'react-hook-form'
import $ from 'jquery'
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {AppContext} from '../app'
import request from "../utils/request";
import StarRatings from 'react-star-ratings';
import { connect } from 'react-redux';

const mapStateToProps = (state:any) => {
    return {
      user: state
    }
  }

type answersType = {
    answer: string;
    comment: string;
}

type ErrorType = {
    ticket: string;
    comment: string;
    title: string;
}

type QuestionType = {
    q_id: number;
    success: number;
}

type InputSettings = {
    surname: string;
    name: string;
    name2: string;
}

type SubjectType = {
    id: number;
    name: string;
}

type TicketPdd = {
    id: number;
    title: string;
    image: string;
    success: string;
    variants: answersType[];
    isSuccess: number;
}

type testOptionsType = {
    num: number;
    max_error: number;
    recommended: boolean;
    random: boolean;
    max: number;
    settings: boolean;
    dblclick: boolean;
    selectedTicket: string;
}

type statisticType = {
    ticket_id: number;
    user_id: string;
    elapsed_time: number;
    correct: number;
    testSession: number;
}

interface statisticArray {
    [key: number]: statisticType;
};

var  pdd_questions: TicketPdd[] = [],
     Timer:any = null,
     nextTicket = 1,
     selectedAnswer: number,
     selected: any = [],
     errors = 0,
     question_answered = 0,
     timer = 0,
     page = 0;



let settings = {};
const BtnQuestion = (props: any)  => {

    function getBtnpageClass(i: number){
        let classname = "btn btn-page btn-default";
        if(props.currentQuestionIndex==i && props.results[i]!=0 && props.results[i]!=1)
            classname += " current-button";
        else if(props.currentQuestionIndex==i)
            classname += " current-finished-button";
        if(props.results[i]==1)
            classname += " btn-danger";
        else if(props.results[i]==0)   
             classname+= " btn-success";
        return classname;        
    }
    return props.qpages.map((v:any, i: number)=>{
        //return <BtnQuestion key={selectedTicket+"_"+qpages.length} i={i} qpages={qpages} goToPage={goToPage} getBtnpageClass={getBtnpageClass(i, res)}/>
        return <button key={"btn_"+props.qpages.length+"_"+i} onClick={()=>props.goToPage(i)} id={"btn_"+i} className={getBtnpageClass(i)} type="button">{i+1}</button>
    })
    //return <button key={"btn_"+props.qpages.length+"_"+props.i} onClick={()=>props.goToPage(props.i)} id={"btn_"+props.i} className={props.getBtnpageClass(props.i)} type="button">{props.i+1}</button>
}

function getTimeString(__seconds: number){
    let minutes = Math.floor(__seconds/60),
            seconds = __seconds%60,
            __time = (__seconds<10)?("0"+seconds):seconds.toString();
    return minutes+":"+__time;
}

const Watch = ({start, setEndTest, endTest, pause, _continue, iterator=1, startTime=0, btnView='icon'}: {start: boolean, setEndTest: Function, endTest: boolean, pause: Function, _continue: Function, iterator: number, startTime: number, btnView: string}) => {

    const [time, setTime] = useState("0:00"),
          [isPause, setPause] = useState(false);

    function startTimer(){
        timer+=iterator;
        if(timer==0){
            Pause();
            setEndTest(true);
        }
        let timeString = getTimeString(timer);
        setTime(timeString);
    }

    function Pause(){
        clearInterval(Timer);
        Timer = 0;
        pause();
        setPause(true);
    }

    function Continue(){
        setPause(false);
        _continue();
    }

    useEffect(()=>{
        if(startTime!=0){
            timer = startTime;
            setTime(getTimeString(startTime));
        }
    }, [startTime])
    
    useEffect(()=>{
        if(start===true && endTest===false && Timer==0){
            setTime("0:00");
            Timer = setInterval(startTimer, 1000);
            }
        if(endTest===true){
            clearInterval(Timer);
            Timer = 0;
            }
        if(start===false && endTest===false && isPause!==true)
            setTime("0:00");
    }, [start, endTest]);    

    return (
        <>
            {(btnView=="icon") ? (
                <span id="labelTimer" className="label-info lead label" title="таймер" style={{cursor: "pointer"}}><span id="time">{time}</span>
                    { (start) ? 
                        <i onClick={()=>Pause()} className="bi bi-pause pause-btn"></i>
                    :
                        <i onClick={()=>Continue()} className="bi bi-play-fill pause-btn"></i>               
                    }
                </span>
                ) : (
                    <>
                       <span id="labelTimer" className="label-info lead label" title="таймер" style={{cursor: "pointer"}}><span id="time">{time}</span></span>
                        { (start) ?
                            <input onClick={()=>Pause()} type="submit" className="label lead label-info" value="пауза" />
                        :
                            <input onClick={()=>Continue()} type="submit" className="label lead label-info" value="Начать" />

                        }
                    </>
                )
            }
        </>
    )
}

let numPageItems = 10,
    firstRunning = 0,
    availableWidth = 0,
    itemWidth = 45,
    errors_array:ErrorType[] = [],
    requiredWidth = 0,
    variantBackgroundColor = "transparent",
    qNum = 0,
    currentQuestionIndex = 0,
    Statistic:statisticArray = {},
    queTimer: any = null,
    elapsed_time:number = 0,
    testSession = 0,
    Results:QuestionType[] = [];

const TestPdd = (props: any) => {

    const [selectedVariant, setSelectedVar] = useState(-1),
          [startTime, setStartTime] = useState(0),
          [iterator, setIterator] = useState(1),
          [Options, setOptions] = useState({...props.options}),
          [selectedTicket, setTicket] = useState(0),
          [selectedSubject, setSubject] = useState(0),
          //[currentQuestionIndex, setCurrentTicket] = useState<number>(0),
          results = useRef([]),
          [TicketName, setTicketName] = useState(""),
          [subjects, setSubjects] = useState([]),
          [subjectName, setSubjectName] = useState(""),
          [currentQuestion, setCurrentQuestion] = useState<TicketPdd>(),
          [start, setStart] = useState(false),
          [opened, setOpened] = useState<Number[]>([]),
          //[qNum, setqNum] = useState<number>(0),
          [ticketBg, setTicketBg] = useState("transparent"),
          [tickets, setTickets] = useState([]),
          [qpages, setqPages] = useState([]),
          [leftShift, setLeftShift] = useState(0),
          [endTest, setEndTest] = useState(false),
          [estimate, setEstimate] = useState(null),
          [newRating, setNewRating] = useState(0);
    const context = React.useContext(AppContext);
   
    useEffect(()=>{
        availableWidth = $(".testrow").width()*0.7;
        requiredWidth = numPageItems * itemWidth;
        if(props.options.settings===true){
            setStartTime(20*60);
            setIterator(-1);
            setOptions({...props.options});
        }
        else{
            setStartTime(0);
            setIterator(1);
            setOptions({...props.options});
        }
        resetTest();
        if(availableWidth < requiredWidth){
            numPageItems = +((availableWidth / itemWidth).toFixed(0));
            requiredWidth = availableWidth;
        }
        if(!props.options.settings && !props.options.recommended && context.settings.load==true){
            getTickets(); 
        if(!props.options.settings && !props.options.recommended && props.options.subjects)
            getSubjects();
        }
    }, [props.options.settings, props.options.subjects, props.options.recommended, context.settings]);

    useEffect(()=>{
        if(props.options.recommended && props.user.id!=0){
            resetTest();
            startTest();
        }
    }, [props.options.recommended, props.user.id]);

    useEffect(()=>{
        variantBackgroundColor = context.settings['background-color'];
        var rgb = variantBackgroundColor.replace(/^rgba?\(|\s+|\)$/g,'').split(',');
        rgb[0] = (parseInt(rgb[0])+10).toString();
        rgb[1] = (parseInt(rgb[1])+10).toString();
        rgb[2] = (parseInt(rgb[2])+10).toString();
        setTicketBg(`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${rgb[3]})`);
    }, [context])

    useEffect(()=>{
        if(selectedTicket!=0 && (props.options.settings==false) && !props.options.subjects){
            resetTest();
            startTest();
        }
    }, [selectedTicket]);

    useEffect(()=>{
        if(selectedSubject!=0 && (props.options.settings==false)){
            resetTest();
            startTest();
        }
    }, [selectedSubject]);

    useEffect(()=>{
        if(currentQuestion){
            $(document).on('keydown', function(event: any){
                let e = event.originalEvent;
                if(e.which==13 && !Options.settings && (currentQuestionIndex==(question_answered-1))){
                    next();
                    return;
                }
                let selectedAnswer = parseInt(e.key);
                if(currentQuestion && selectedAnswer<=(currentQuestion.variants.length) && e.key>0 && question_answered==currentQuestionIndex){
                    selectAnswer(selectedAnswer-1);  
                }
            });
        }
        return ()=>{
            $(document).off('keydown');
        }
    }, [currentQuestion]);

    const {register, handleSubmit, setError, watch, setValue, formState: {errors: errors2} } = useForm<InputSettings>({mode: 'onBlur'});

    const onSubmit = (data: InputSettings) => {
        handleStartTest();
    };
    let obj = this;
    // getting tickets with questions
    function getTickets(){
        request({method: 'post', data: {action: "getTickets", data: {shuffle: context.settings.shuffle_tickets}}}).then(response => {
            const {data} = response;
            let opts = {...props.options};
            opts['selectedTicket'] = data[0].id;
            setOptions(opts);
            setTickets(data);
            setTicketName(data[0].name);
            if(selectedTicket!=0)
                setTicket(0); 
            setTicket(data[0].id);
        });
    }

    function getSubjects(){
        request({method: 'post', data: {action: "getSubjects"}}).then(response => {
            const {data} = response;
            setSubjects(data);
            setSubject(data[0].id);
            //setSubjectName(data[0].name);
        });
    }

    async function getQuestions(options: any){
        pdd_questions = [];
        return await request({method: 'post', data: {action: "getQuestions", data: {...options}}}).then(response => {
            const {data} = response;
            if(data!=null){
                var questions = data;
                if(data.length==0 || data==null) return false;
                for(var i=0, variants;i<questions.length;i++){
                    variants =  questions[i].variants;
                    pdd_questions[i] = {
                        id: questions[i].id,
                        title: questions[i].title,
                        image: "./img/"+questions[i].image,
                        success: questions[i].correct,
                        variants: variants,
                        isSuccess: -1
                    };
                }
                qNum = Math.min(Options.num, pdd_questions.length);
                //setqNum(Math.min(Options.num, pdd_questions.length));
                setqPages([...new Array(qNum).slice(0)]);
                
                return true;
            }
            
        });
    }

    function setQuestion(){
        if(pdd_questions.length>0 && pdd_questions.length-1>=currentQuestionIndex){
            setCurrentQuestion(pdd_questions[currentQuestionIndex]);
        }
    }

    function startTest(){
        setEndTest(false);
        testSession = (new Date()).getTime() + Math.floor(1000*Math.random());
        if(props.options.settings===false){
            getQuestions({...Options, selectedTicket:selectedTicket, selectedSubject: selectedSubject, recommended: props.options.recommended, user_id:props.user.id,subject: props.options.subjects, settings: false}).then((result)=>{
                if(result!==false){
                    setStart(true);
                    queTimer = setInterval(()=>{
                        elapsed_time+=1000;
                    }, 1000);
                setQuestion();
                }
            })
                
        }
        else{
            getQuestions(Options).then(()=>{
                setStart(true);
                setQuestion();
            });
            
        }
    }

    function handleStartTest(){
        resetTest();
        startTest();
    }

    function testPause(){
        clearInterval(queTimer);
        setStart(false);
    }

    function continueTest(){
        if(endTest==true) return;
        setStart(true);
        queTimer = setInterval(()=>{
            elapsed_time+=1000;
        }, 1000);
    }

    function getRandomUserId(){
        return (new Date()).getTime();
    }

    function selectAnswer(selectedVar: any){
        if(Options.settings && currentQuestionIndex<question_answered) return;
        setSelectedVar(selectedVar);
        selectedAnswer = selectedVar
        selected[currentQuestionIndex] = selectedVar;
       if(results.current[currentQuestionIndex]==1 || results.current[currentQuestionIndex]==0) return;
       if(selectedVar != parseInt(pdd_questions[currentQuestionIndex].success)){
            errors++;
            errors_array.push({ticket: currentQuestionIndex.toString(), title: pdd_questions[currentQuestionIndex].title, comment: currentQuestion.variants[selectedVar].comment});
            results.current[currentQuestionIndex] = 1;
            Statistic[pdd_questions[currentQuestionIndex].id] = {ticket_id: selectedTicket, user_id: (props.user.id)?(props.user.id).toString():getRandomUserId(), elapsed_time: elapsed_time, correct: 1, testSession: testSession};
            if(props.options.settings===false)
                Results.push({q_id: pdd_questions[currentQuestionIndex].id, success: 0});
        }
       else{
            if(props.options.settings===false)
                Results.push({q_id: pdd_questions[currentQuestionIndex].id, success: 1});
            results.current[currentQuestionIndex] = 0;
            Statistic[pdd_questions[currentQuestionIndex].id] = {ticket_id: selectedTicket, user_id: (props.id)?(props.id).toString():getRandomUserId(), elapsed_time: elapsed_time, correct: 0, testSession: testSession};
        }
        elapsed_time = 0;
        question_answered++;
        if(Options.settings && currentQuestionIndex==question_answered-1)
            next();
    }

    // если выбран хотя бы один вариант ответа(selectedVariant!=-1), то вернуть класс, соответствующий тому верен ли ответ
    function showResult(indx: number){
        return (selectedVariant!=-1)? ((parseInt(pdd_questions[currentQuestionIndex].success)==indx) ? "success":"warning"):"";
        //return (opened.indexOf(indx) != -1) ? ( (parseInt(pdd_questions[currentQuestionIndex].success)==indx) ? "success":"warning" ) : "";
    }

    function next(){
        setSelectedVar(-1);
        if(question_answered<pdd_questions.length && question_answered<=Options.num){
            //setCurrentTicket(currentQuestionIndex+1);
            currentQuestionIndex = currentQuestionIndex + 1;
            setQuestion();
            //goToPage(question_answered);
            // сдвинуть окно списка вопросов на 10 вправо, если достигли предела отображения
            if(question_answered%10==0 && question_answered!=0){
                toNextPage();
            }
        }
        else if(question_answered>=props.options.num || question_answered>=pdd_questions.length){
            if(props.options.settings===false){
                request({method: 'post', data: {action: "saveStatistic", data: {"stats": JSON.stringify(Statistic), "user_id":(props.user.id)?props.user.id:getRandomUserId(), "results": JSON.stringify(Results)}}});
                clearInterval(queTimer);
            }
            setEndTest(true);
            testPause();
        }   
    }

    function handleChangeTicket(event: SelectChangeEvent){
        setTicket(parseInt(event.target.value));
        Options.selectedTicket = event.target.value;
    }

    function handleChangeSubject(event: SelectChangeEvent){
        let selSubjectId = event.target.value;
        setSubject(parseInt(selSubjectId));
        let estimate = subjects.find(item=>(selSubjectId==item.id));
        estimate = (estimate.estimate);
        setEstimate(estimate);
        setSubjectName(estimate.name);
        Options.selectedSubject = selSubjectId;
    }

    function goToPage(ticketIndx: any){
        if(ticketIndx<pdd_questions.length && ticketIndx<question_answered){
            currentQuestionIndex = ticketIndx;         
            setSelectedVar(selected[ticketIndx]); 
            setQuestion(); 
        }
        else if(ticketIndx==question_answered){
            currentQuestionIndex = ticketIndx;
            setSelectedVar(-1);
            setQuestion();
        }
    }

    // handle change test options
    const handleChangeOption = (event: any, optionName: any) => {
        setOptions({...Options, [optionName]: event.target.value});
    }

    const resetTest = () => {
        if(props.options.settings===false){
            setOptions({...props.options});
        }
        else
            setTicket(0);
        for (var member in Statistic) delete Statistic[member];
        errors_array = [];
        setOpened([]);
        question_answered = 0;
        setqPages([]);
        currentQuestionIndex = 0;
        setCurrentQuestion(undefined);
        selected = [];
        clearInterval(Timer);
        Timer = 0;
        page = 0;
        qNum = 0;
        results.current = [];
        errors = 0;
        timer = 0;
        toStartPage();
        setStart(false);
        setEndTest(false);
    }

    const toStartPage = () => {
        setLeftShift(0);
    }

    const toNextPage = () => {
        if((qNum-(numPageItems*(page+1)))>0){
            page+=1;
            setLeftShift(-page*requiredWidth);
        }
    }

    const toPrevPage = () => {
        if(page>0){
            page-=1;
            setLeftShift(-page*requiredWidth);
        }
    }

    const Variants = (props:{dblclick: boolean}) => {
       
        return (
            <div id="qlist">
                { (currentQuestion!=undefined) && (
                    currentQuestion.variants.map((v,i)=>(
                        // выводить только выбранный вариант(selectedVariant==i), либо все варианты если ни один еще не выбран(selectedVariant==-1)
                        (selectedVariant==i || selectedVariant==-1) &&
                            <a key={"var_"+i} onDoubleClick={()=>{if(props.dblclick) selectAnswer(i)}} onClick={()=>{if(!props.dblclick) selectAnswer(i)}} id={i.toString()} className={"list-group-item questvariant "+showResult(i)}>{i+1}. {v.answer}</a>
                        )
                    ))
                }
            </div>
         );
}

    const getElapsedTime = (__time:number) => {
        let elapsedTime = __time;
        if(props.options.settings)
            elapsedTime = (20*60 - elapsedTime);
        return getTimeString(elapsedTime);
    }

    const changeRating = (rating: any) => {
        setNewRating(rating);
        request({method: 'post', data: {action: "addRating", data: {subjectId: selectedSubject, rating: rating}}});
    }

    return (
        <div className="container">
            {(props.options.settings===false && !props.options.recommended && !props.options.subjects) && (
                <div style={{marginTop: 0}} className={(props.options.settings===false && !props.options.recommended && !props.options.subjects)?"row testrow":"hide"}>
                    <div className="exam-title">
                        {(context.settings.show_exam_title=='1') && (
                            <label>{context.settings.exam_title}</label>
                        )}
                        {(context.settings.show_exam_title=='0') && (
                            <div className="slide-wrapper" style={{width: (requiredWidth+"px")}}>
                                    <i onClick={toPrevPage} className={start?"bi bi-caret-left arrow-btn arrow-left-btn":"hide"}></i>
                                    <div className="button-slider">
                                        <div key={selectedTicket} id="buttonPanel" style={{left: leftShift+"px"}} className={(!start && props.options.settings)?"hide":"btn-group btn-group-xs"}>
                                            {
                                                <BtnQuestion key={selectedTicket} results={results.current} qpages={qpages} goToPage={goToPage} currentQuestionIndex={currentQuestionIndex}/>
                                            }  
                                        </div>
                                    </div>
                                <i onClick={toNextPage} className={start?"bi bi-caret-right arrow-btn arrow-right-btn":"hide"}></i>
                            </div>
                        )}
                        
                         { (!context.isMobile && currentQuestion!==undefined && !endTest) && (
                                <>
                                    <Watch start={start} setEndTest={setEndTest} endTest={endTest} pause={testPause} _continue={continueTest} iterator={iterator} startTime={startTime} btnView="icon"/>  
                                    <input onClick={startTest} id="buttonSchoolSetName" type="submit" className={(start || props.options.settings===true || context.isMobile)?"hide":"btn btn-start"} value="Начать" />
                                </>
                            )} 
                        <FormControl key={selectedTicket} className="form-ticket" sx={{m: 1, minWidth: 120, verticalAlign: 'middle', '& > .MuiPaper-root':{top: '60px', maxHeight: 'calc(100% - 62px)'}}}>
                            <Select
                                disabled={start?true:false}
                                labelId="demo-simple-select-helper-label"
                                sx={{"& .MuiSelect-select": {padding: "5px 14px", top: '30px'}}}
                                id="demo-simple-select-helper"
                                value={selectedTicket.toString()}
                                onChange={handleChangeTicket}>
                                    {
                                        tickets.map((v, i)=>(
                                            <MenuItem value={v.id}>{v.name}</MenuItem>
                                        ))
                                    }
                            </Select>
                        </FormControl>
                        { (currentQuestion!=undefined && context.isMobile) && (
                            <Watch start={start} setEndTest={setEndTest} endTest={endTest} pause={testPause} _continue={continueTest} iterator={iterator} startTime={startTime} btnView="button" />
                        )}
                    </div>
                </div>
                )}
            <div style={{marginTop: 0}} className={(props.options.settings===false && !props.options.recommended && props.options.subjects)?"row testrow":"hide"}>
                { (props.options.settings===false && !props.options.recommended && props.options.subjects) && (
                    <>
                        <label>Выбор темы:</label>
                        <FormControl key={selectedSubject} className="form-ticket" sx={{m: 1, minWidth: 120, marginTop: '5px', verticalAlign: 'middle', '& > .MuiPaper-root':{top: '60px', maxHeight: 'calc(100% - 62px)'}}}>
                                <Select
                                    disabled={start?true:false}
                                    labelId="demo-simple-select-helper-label"
                                    sx={{"& .MuiSelect-select": {padding: "5px 14px", top: '30px', width: '210px'}}}
                                    id="demo-simple-select-helper"
                                    value={selectedSubject.toString()}
                                    onChange={handleChangeSubject}>
                                        {
                                            subjects.map((v: SubjectType, i: number)=>(
                                                <MenuItem value={v.id}>{v.name}</MenuItem>
                                            ))
                                        }
                                </Select>
                            </FormControl>
                            { (currentQuestion!=undefined && !context.isMobile) && (
                                <Watch start={start} setEndTest={setEndTest} endTest={endTest} pause={testPause} _continue={continueTest} iterator={iterator} startTime={startTime} btnView="icon"/>
                            )}
                            { (currentQuestion!=undefined && context.isMobile) && (
                                <Watch start={start} setEndTest={setEndTest} endTest={endTest} pause={testPause} _continue={continueTest} iterator={iterator} startTime={startTime} btnView="button" />  
                            )}
                        </>
                    )}
                    <div style={{marginBottom: '4px'}}><h3>{subjectName}</h3></div>
                    { ((estimate!=null && estimate!==undefined && estimate!=0)) && (
                        <div className="centered-block"><span style={{marginRight: '3px', paddingTop: '5px'}}>оценка:</span>
                            <StarRatings
                                rating={estimate}
                                numberOfStars={5}
                                starRatedColor="#c7372c"
                                starDimension="18px"
                                starSpacing="5px"
                            /> <span style={{marginLeft: '4px', paddingTop: '5px'}}>{estimate}</span>
                        </div>
                    )}
            </div>
            <div className={(props.options.settings==true)?"row testrow":"hide"}>
                <div className="col-md-12">
                    <form onSubmit={handleSubmit(onSubmit)} className={(!context.logged)?"form-flex":"hide"}>
                        <div className="form-group">
                            <input disabled={start} {...register("surname", {
                                                    required: "Field is required",
                                                    maxLength: 50} 
                                    )}
                                type="text" className="form-control" id="textSchoolName1" placeholder="Фамилия" />
                        </div>
                        <div className="form-group">
                            <input disabled={start} {...register("name", {
                                                    required: "Field is required",
                                                    maxLength: 50} 
                                    )} type="text" className="form-control" id="textSchoolName2" placeholder="Имя" />
                        </div>
                        <div className="form-group">
                            <input disabled={start} {...register("name2", {
                                                    required: "Field is required",
                                                    maxLength: 50} 
                                    )} type="text" className="form-control" id="textSchoolName3" placeholder="Отчество" />
                        </div>
                        {(!context.isMobile) && (
                            <input id="buttonSchoolSetName" type="submit" className={(start || (context.isMobile && !props.options.settings))?"hide":"btn btn-success"} value="Начать" />
                        )}
                </form>
        <form id="collapseConf">
            <div id="examSizePanel" className="form-group">
                <label>Вопросов</label>
                {(context.isMobile) ? (
                    <>
                      <select onChange={(e)=>handleChangeOption(e, 'num')} className="select-mobile" name="examSize">
                        <option selected={Options.num==20} value="20">20</option>
                        <option selected={Options.num==40} value="40">40</option>
                        <option selected={Options.num==60} value="60">60</option>
                        <option selected={Options.num==80} value="80">80</option>
                        <option selected={Options.num==100} value="100">100</option>
                    </select>
                    </>
                ) 
                :
                (
                    <>
                        <label className="radio-inline">
                            <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio" checked={Options.num==20} name="examSize" id="examSize20" value="20"/>20
                        </label>
                        <label className="radio-inline">
                            <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio" checked={Options.num==40} name="examSize" id="examSize40" value="40"/>40
                        </label>
                        <label className="radio-inline">
                            <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={Options.num==60} name="examSize" id="examSize60" value="60"/>60
                        </label>
                        <label className="radio-inline">
                            <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={Options.num==80} name="examSize" id="examSize80" value="80"/>80
                        </label>
                        <label className="radio-inline">
                            <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={Options.num==100} name="examSize" id="examSize100" value="100"/>100
                        </label>
                        &nbsp;&nbsp;&nbsp;
                    </>
                )}
            </div>
            <div className="form-group">
                <label style={{display: "inline-block !important"}}>Ошибок &nbsp; </label>
                <input disabled={start} id="examErrorSize" onChange={(e)=>handleChangeOption(e, 'max_error')} value={Options.max_error} type="number" min={1} max={100} />&nbsp;&nbsp;&nbsp;
            </div>
            {(context.isMobile || context.logged) && (
                <br/>
            )
            }
            <div className="checkbox">
                <label>
                    <input disabled={start} id="btnConfDoubleClick" onChange={(e)=>handleChangeOption(e, 'dblclick')} checked={Options.dblclick} type="checkbox"/> Двойной клик
                </label>&nbsp;&nbsp;&nbsp;
            </div>
            <div className="checkbox">
                <label>
                    <input disabled={start} id="btnConfRandomVariants" onChange={(e)=>handleChangeOption(e, 'random')} checked={Options.random} type="checkbox"/> Перемешивать вопросы
                </label>
                </div>
                {(context.isMobile || context.logged) && (
                    <input id="buttonSchoolSetName" onClick={(e)=>{e.preventDefault(); if(!context.logged) handleSubmit(onSubmit)(); else handleStartTest();}} type="submit" className={(start || (context.isMobile && !props.options.settings))?"hide":"btn btn-success"} value="Начать" />
                )}
            </form>
            </div>
        </div>
            { (props.options.settings && !start && !endTest && currentQuestion===undefined && ( (context.isMobile && context.settings["image_title_exam_mobile"]!="") || (!context.isMobile && context.settings["image_title_exam"]) )) && (
                <div className="titleImage">
                    <img width='auto' height='auto' src={'./img/'+((context.isMobile)?context.settings["image_title_exam_mobile"]:context.settings["image_title_exam"])}/>
                </div>
            )
            }
            <div style={{marginTop: 0}} className={(pdd_questions.length>0 && !props.options.settings && !props.options.recommended && context.settings.show_exam_title=='1')?"row testrow":"hide"}>
            <div className="slide-wrapper" style={{width: (requiredWidth+"px")}}>
                        <i onClick={toPrevPage} className={start?"bi bi-caret-left arrow-btn arrow-left-btn":"hide"}></i>
                        <div className="button-slider">
                            <div key={selectedTicket} id="buttonPanel" style={{left: leftShift+"px"}} className={(!start && props.options.settings)?"hide":"btn-group btn-group-xs"}>
                                {
                                    <BtnQuestion key={selectedTicket} results={results.current} qpages={qpages} goToPage={goToPage} currentQuestionIndex={currentQuestionIndex}/>
                                }  
                            </div>
                        </div>
                    <i onClick={toNextPage} className={start?"bi bi-caret-right arrow-btn arrow-right-btn":"hide"}></i>
                </div>                
            </div>
           
            <div className={(pdd_questions.length>0 && (props.options.recommended || props.options.settings || props.options.subjects))?"row testrow":"hide"}>
            <div key={qpages.length} className="slide-wrapper" style={{width: (requiredWidth+"px")}}>
                        <i onClick={toPrevPage} className={start?"bi bi-caret-left arrow-btn arrow-left-btn":"hide"}></i>
                        <div className="button-slider">
                            <div key={qpages.length} id="buttonPanel" style={{left: leftShift+"px"}} className={(!start && props.options.settings)?"hide":"btn-group btn-group-xs"}>
                                {
                                    <BtnQuestion key={pdd_questions.length} results={results.current} qpages={pdd_questions} goToPage={goToPage} currentQuestionIndex={currentQuestionIndex}/>
                                }  
                            </div>
                        </div>
                    <i onClick={toNextPage} className={start?"bi bi-caret-right arrow-btn arrow-right-btn":"hide"}></i>
                </div>
                { (currentQuestion!=undefined && !context.isMobile && !props.options.subjects) && (
                            <Watch start={start} setEndTest={setEndTest} endTest={endTest} pause={testPause} _continue={continueTest} iterator={iterator} startTime={startTime} btnView="icon"/>
                )}
                { (currentQuestion!=undefined && context.isMobile && !props.options.subjects) && (
                            <Watch start={start} setEndTest={setEndTest} endTest={endTest} pause={testPause} _continue={continueTest} iterator={iterator} startTime={startTime} btnView="button" />  
                )}
            </div>
            <div style={{marginTop: 0}} className="row testrow">
                    <div className={(endTest===true)?"row":"hide row"}>
                                <div className="col-md-12">
                                    <div className="panel panel-primary">
                                            <div className="panel-heading lead">
                                            ошибок <span id="resultErrors" className="label label-danger">{errors}</span> из <span id="resultCount" className="label label-default">{pdd_questions.length}</span>
                                        </div>

                                        <div className="panel-body">
                                       
                                            <p id="resultText" className="lead">
                                                {(Options.max_error<errors) ?
                                                    (<><i style={{color: "#222", fontSize: "18px"}} className="bi bi-x-lg"></i> Экзамен не сдан. У вас более {Options.max_error} ошибок</>)
                                                    :
                                                    (<><i style={{color: "green"}} className="bi bi-check-lg"></i> Экзамен сдан</>)
                                                }
                                            </p>
                                            {(endTest===true) && (
                                                <>
                                                <p>
                                                    Затрачено времени на <span style={{fontWeight: 'bold'}}>{(TicketName!="")?TicketName:"экзамен"}: {getElapsedTime(timer)}</span>
                                                </p>
                                                <p>
                                                    <span>оцените сложность: </span>
                                                    <StarRatings
                                                        rating={newRating}
                                                        numberOfStars={5}
                                                        starDimension="18px"
                                                        starRatedColor="#c7372c"
                                                        changeRating={changeRating}
                                                        starSpacing="5px"
                                                    />
                                                </p>
                                                </>
                                            )}
                                        </div>
                                        </div>
                                        <div className="panel-result">
                                        {(!props.options.settings) && (
                                            <div>
                                                <table className="result_table">
                                                    <tbody>
                                                        <tr><th>№</th><th>Вопрос</th><th>Комментарий</th></tr>
                                                        { errors_array.map((v, i)=>(
                                                            <tr><td>{parseInt(v.ticket)+1}</td><td>{v.title}</td><td>{v.comment}</td></tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div> 
                                </div>
                            </div>
                <div className="col-lg-8 col-md-9 col-sm-12 mini-wrapper">
                    <div className="block-ticket">
                        <div className="col-md-12">
                            <div id="questPanel">
                                {(props.options.recommended && pdd_questions.length==0) && (
                                    <h3>Для вас пока нет рекомендуемых вопросов</h3>
                                )}
                                <img id="questImage" className={(start && pdd_questions.length>0)?"img-responsive":"hide"} width="100%" style={{maxWidth: "100%"}}
                                        src={(currentQuestion!==undefined)?currentQuestion.image:""}
                                        onError={(e)=>{if (e.currentTarget.src != './img/no_picture.png') e.currentTarget.src = './img/default_bilet_images.png';}}
                                        />
                                <div id="questText" className={(start)?"questtext":"hide"}>{(currentQuestion!==undefined)?currentQuestion.title:""}</div>
                                <div className={(start)?"list-group":"hide"}>
                                    <Variants dblclick={Options.dblclick} key={currentQuestionIndex} />
                                    <div id="commentPanel" className={(!start)?"hide":((selectedVariant!=-1)?"":"hide")}>
                                        <div id="questComment" className="">{(currentQuestion!==undefined && currentQuestion.variants.length>selectedVariant)?currentQuestion.variants[(selectedVariant==-1)?0:selectedVariant].comment:""}</div>
                                        <button onClick={next} id="questNext" type="button" className="list-group-item active">Далее</button>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(TestPdd);