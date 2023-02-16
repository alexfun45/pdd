
import {useState, useEffect, useRef} from "react";
import request from "../utils/request";

type answersType = {
    answer: string;
    comment: string;
}

type TicketPdd = {
    text: string;
    image: string;
    success: string;
    variants: answersType[];
    isSuccess: number;
}

var  pdd_questions: TicketPdd[] = [],
     Timer:any = null,
     results:any = [],
     errors = 0,
     question_answered = 0,
     timer = 0;
     //time = "0:00";
     

function getTickets(options: any, callback: Function){
    request({method: 'post', data: {action: "getAllTickets", data: {...options}}}).then(response => {
        const {data} = response;
        if(data!=null){
            var tickets = data;
            for(var i=0, variants;i<tickets.length;i++){
                variants =  tickets[i].variants;
                pdd_questions[i] = {
                    text: tickets[i].text,
                    image: "./img/"+tickets[i].image,
                    success: tickets[i].correct_id,
                    variants: variants,
                    isSuccess: -1
                };
            }
        }
        if(callback)
            callback();
    });
}



const TestPdd = (props:any) => {
    
    const [time, setTime] = useState("0:00"),
          [currentTicket, setCurrentTicket] = useState(0),
          [currentQuestion, setCurrentQuestion] = useState<TicketPdd>(),
          [start, setStart] = useState(props.start),
          [opened, setOpened] = useState<number[]>([]),
          [endTest, setEndTest] = useState(false);

    function setQuestion(){
        if(pdd_questions.length>0 && pdd_questions.length-1>=currentTicket)
            setCurrentQuestion(pdd_questions[currentTicket]);
    }

    function startTimer(){
        timer++;
        let minutes = Math.floor(timer/60),
            seconds = timer%60,
            __time = (seconds<10)?("0"+seconds):seconds.toString();
        setTime(minutes+":"+__time);
    }

    function startTest(){
		getTickets(props.options, setQuestion);
        Timer = setInterval(startTimer, 1000);
    }

    function testPause(){
        clearInterval(Timer);
        Timer = 0;
        setStart(false);
    }

    function continueTest(){
        if(endTest==true) return;
        Timer = setInterval(startTimer, 1000);
        setStart(true);
    }

    function selectAnswer(selectedAnswer: number){
        let _opened = [...opened];
        _opened.push(selectedAnswer);
        setOpened(_opened);
       if(results[currentTicket]==1 || results[currentTicket]==0) return;
       if(selectedAnswer != parseInt(pdd_questions[currentTicket].success)){
            errors++;
            results[currentTicket] = 1;
       }
       else
            results[currentTicket] = 0;
        question_answered++;
      
    }

    function showResult(indx: number){
        return (opened.indexOf(indx) != -1) ? ( (parseInt(pdd_questions[currentTicket].success)==indx) ? "success":"warning" ) : "";
    }

    function nextTicket(){
        if((currentTicket+1)<pdd_questions.length && (currentTicket+1)<=props.options.num)
            setCurrentTicket(currentTicket+1);
        else if(question_answered>=props.options.num || question_answered>=pdd_questions.length){
            setEndTest(true);
            testPause();
        }
    }

    function getBtnpageClass(i: number){
        let classname = "btn btn-page btn-default";
        if(currentTicket==i && results[i]!=1 && results[i]!=0)
            classname += " current-button";
        if(results[i]==1)
            classname += " btn-danger";
        else if(results[i]==0)   
             classname+= " btn-success";
        return classname;        
    }

    function goToPage(qIndx: number){
        if(qIndx<pdd_questions.length)
            setCurrentTicket(qIndx);
    }

    useEffect(()=>{
        setOpened([]);
        setQuestion();
    }, [currentTicket]);
    
    useEffect(()=>{
        startTest();
    }, []);

    return (
        <>
            <div className="row">
                <div id="buttonPanel" className="btn-group btn-group-xs">
                    {
                        [...new Array(props.options.num)].map((v, i)=>(
                           <button onClick={()=>goToPage(i)} id={"btn_"+i} className={getBtnpageClass(i)} type="button">{i+1}</button>
                        ))
                    }
                </div>
            </div>
            <div className="row">
                <div className="col-lg-8 col-md-8 col-sm-8">    

                    <div className="row">
                        <div className="col-md-12 col-sm-12 myheader">
                            
                                <img className="img-responsive pull-left hidden-xs" style={{width: "75px"}} alt="логотип" src="./img/gibddlogo_pdd24.png" />
                                <h1 id="h1">Билеты ПДД 2023 экзамен ПДД</h1>
                                <p>Экзаменационные билеты пдд соответствуют экзамену ГИБДД
                                </p>

                                <span id="labelQuestNumber" className="label label-primary">Новые правила экзамена пдд 2023</span>
                                <span id="labelCategory" className="hide"> ABM </span>
                                <span id="labelTimer" className="label-info lead label" title="таймер" style={{cursor: "pointer"}}><span id="time">{time}</span>
                                    { (start==true) ? 
                                         <i onClick={testPause} className="bi bi-pause-fill pause-btn"></i>
                                        :
                                         <i onClick={continueTest} className="bi bi-play-fill pause-btn"></i>
                                    
                                    }
                                    </span>
                                <span id="labelBookmark" data-toggle="tooltip" data-placement="left" title="В закладки" style={{fontSize: "20px", color: "#5bc0de", cursor: "pointer"}} className="pull-right glyphicon glyphicon-star-empty"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-8 col-md-9 col-sm-12">
                    <div className="row">
                        <div className="col-md-12">
                            <div id="questPanel"  className={(start)?"":"hide"}>
                                <img id="questImage" className="img-responsive" width="100%" style={{maxWidth: "100%"}}
                                        src={(currentQuestion!==undefined)?currentQuestion.image:""}
                                        alt="картинка вопроса" />
                                <div id="questText" className="questtext"></div>
                                <div className="list-group">
                                    <div id="qlist">
                                        { (currentQuestion!=undefined) && (
                                            currentQuestion.variants.map((v,i)=>{
                                                return <a onClick={()=>selectAnswer(i)} id={i.toString()} className={"list-group-item questvariant "+showResult(i)}>{i+1}. {v.answer}</a>
                                            })
                                        )
                                        }
                                    </div>
                                    <div id="commentPanel" className={(opened.length>0)?"":"hide"}>
                                        <button onClick={nextTicket} id="questNext" type="button" className="list-group-item active">Далее <small className="text-warning small hidden-xs"> - Enter &nbsp;&nbsp;&nbsp; 1,2,3 - выбор &nbsp;&nbsp;&nbsp; &larr; назад &nbsp; вперед &rarr;</small></button>
                                        <div id="questComment" className="list-group-item"></div>
                                    </div>
                                </div>
                            </div>
                            <div className={(endTest==true)?"row":"hide row"}>
                                <div className="col-md-12">
                                    <div className="panel panel-primary">
                                        <div className="panel-heading lead">
                                            ошибок <span id="resultErrors" className="label label-danger">{errors}</span> из <span id="resultCount" className="label label-default">{props.options.num}</span>
                                        </div>
                                        <div className="panel-body">
                                            <p id="resultText" className="lead">
                                                {(props.options.max_error<=errors) ?
                                                    (<><i style={{color: "#222"}} className="bi bi-x-lg"></i> Экзамен не сдан. У вас более {props.options.max_error} ошибок</>)
                                                    :
                                                    (<><i style={{color: "green"}} className="bi bi-check-lg"></i> Экзамен сдан</>)
                                                }
                                            </p>
                                        </div>
                                    </div>      
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
            
        </>
    )
}

export default TestPdd