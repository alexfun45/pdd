
import {useState, useEffect, useRef} from "react";
import Pagination from 'react-bootstrap/Pagination';
import request from "../utils/request";
import CreateTicket from "./Tickets/createTicketDialog"

const MAX_TICKET_LENGTH = 64;
const screenHeight = window.screen.height*0.6;
type pagesType = Array<any>;
let page_num = 0;

export default () => {
    const [tickets, setTickets] = useState([]),
          [currentPage, setPage] = useState(1),
          [isEdit, setEditMode] = useState(false),
          [pages, setPages] = useState<any>(),
          [show, setShow] = useState(false),
          defaultTicket = {text: "", id: 1, image: "", correct_id: 0, variants: [{answer: '', comment: ''}]};   
    let currentTicket = useRef(defaultTicket);
    var items: pagesType = [];

    const renderPages = () => {
        items = [];
        for(let number = 1; number <= page_num; number++) {
            items.push(
                <Pagination.Item onClick={()=>gotToPage(number)} key={number} active={number === currentPage}>
                  {number}
                </Pagination.Item>
            )
        }
        setPages(items);
    }

    const getTickets = () => {
        request({method: 'post', data:{action: 'getTickets', data: {page: currentPage}}}).then( response => {
            const {data} = response;
            page_num = data.page_num;
            renderPages();
            setTickets(data.data);
            currentTicket.current = defaultTicket;
            setEditMode(false);
        });
    }

    const gotToPage = (selectedPage: number) => {
        setPage(selectedPage);
        request({method: 'post', data:{action: 'getTickets', data: {page: selectedPage}}}).then( response => {
            const {data} = response;
            setTickets(data.data);
        });
    }

    useEffect(()=>{
        if(show==false){
            currentTicket.current = defaultTicket;
            setEditMode(false);
        }
        else{
            return;
        }
        getTickets();
    }, []);

    useEffect(()=>{
        renderPages();
    }, [currentPage]);

    const editTicket = (id: number) => {
        request({method: 'post', data:{action: 'getTicket', data: {ticket_id: id}}}).then( response => {
            const {data} = response;
            let Ticket = {...data.ticket, variants: data.variants};
            //setCurrentTicket(Ticket);
            currentTicket.current = Ticket;
            setEditMode(true);
            setShow(true);
        });
    }

    const removeTicket = () => {
        request({method: "post", data: {action: "removeTicket", data: {ticket_id: currentTicket.current.id}}}).then(()=>{
            getTickets();
        });
    }

    return (
        <div style={{height: screenHeight+"px"}} className='block-wrapper'>
            <CreateTicket ticket={currentTicket.current} setShow={setShow} editMode={isEdit} show={show} removeTicket={removeTicket} getTickets={getTickets}/>
            <div id='ticket-list'>
                {
                    tickets.map((v: {text: string, id: number},i: number)=>{
                        var text = (v.text.length>64) ? v.text.substr(0, MAX_TICKET_LENGTH) + "...":v.text;
                        return (
                            <div onClick={(e)=>editTicket(v.id)} className="ticket-wrapper extisted-ticket"><span>{text}</span></div>
                        )
                    })
                }
                <div onClick={() => setShow(true)} className="add-ticket" id="addTicket"><i className="addIcon">+</i></div>
            </div>
            <div className="page-wrapper">
                <Pagination>{pages}</Pagination>
            </div>
        </div>
        )
}