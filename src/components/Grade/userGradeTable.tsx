import React, {useEffect, useState} from 'react'
import request from '../../utils/request'
//import Table from 'react-bootstrap/Table'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

type userStatType = {
    time: string;
    failed: number;
    user_id: number;
    session: string;
}

interface statsInterface {
    [key: string]: userStatType;
};

const tickets:number[] = [];

for(let i=1;i<=40;i++){
    tickets[i-1] = i;
}

export default ({user_id, setUser, handleClickItem}: {user_id: number, setUser: Function,  handleClickItem: Function}) => {

    const [user, setuser] = useState(user_id),
          [gradeData, setGradeData] = useState([]),
          [order, setOrder] = useState("DESC");

    useEffect(()=>{
        request({method: 'post', data: {action: "getUserGrade", data: {user_id: user_id, order: order}}}).then(response => {
            const {data} = response;
            setGradeData(data);
        });
        setuser(user_id);
    }, [user_id, order])

    const resetUserSelected = () => {
        setUser(0);
    }

    const regNumber = /[^\d]*?(\d+)/;

    const getFailedForTicket = (userData:any, ticketIndx: number) => {
        let data:any =  Object.entries(userData),
                        failed = 0,
                        session = 0,
                        user_id = 0,
                        isExist = false;
                                    
        for(let j=0, ticketNumber;j<data.length;j++){
            if(data[j]==undefined) continue;
            ticketNumber = data[j][0].match(regNumber);
            if(ticketNumber!=null){
                if(parseInt(ticketNumber[1])==(ticketIndx+1)){
                    isExist = true;
                    failed = data[j][1].failed;
                    session = data[j][1].session;
                    user_id = data[j][1].user_id;
                    }
                }  
            }
        if(isExist)
            return <td><span onClick={()=>handleClickItem(user_id, session.toString())} className='btnItem'>{failed}</span></td>
        else
            return <td> </td>
    }

    const getFailed = (ticketData: any, ticketIndx: number) => {
        let ticketNumber = ticketData.ticket_name.match(regNumber);
        if(ticketNumber!=null){
            if(parseInt(ticketNumber[1])==(ticketIndx+1)){
                return <TableCell style={{padding: '6px 8px'}} key={ticketData.session+ticketIndx}><span onClick={()=>handleClickItem(user_id, ticketData.session.toString())} className='btnItem'>{ticketData.failed}</span></TableCell>
                }
            else
                return <TableCell style={{padding: '6px 8px'}} key={ticketData.session+ticketIndx}> </TableCell>  
        }
    }

    const handleOrder = () => {
        let __order = (order=="ASC")?"DESC":"ASC";
        setOrder(__order);
    }

    return (
        <div>
            { (gradeData) && (
           
            <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <TableCell onClick={(e)=>handleOrder()} style={{fontSize: "12px", cursor: "pointer"}} rowSpan={1}>дата <i className={(order=='ASC')?"bi bi-arrow-down":"bi bi-arrow-up"}></i></TableCell><TableCell style={{textAlign: 'center'}} colSpan={41}><span onClick={resetUserSelected} className='btn-link' style={{float: 'left', color: '#FFF'}}>&#60; назад</span>Билеты</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                                {
                                    tickets.map((v, i)=>(
                                        <TableCell style={{padding: '6px 8px'}}>{v}</TableCell>
                                    ))
                                }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                       gradeData.map((ticket: any, i)=>(
                            <TableRow>
                                <TableCell className='v-title'>{ticket.time}</TableCell>
                                {
                                 tickets.map((v, i)=>(
                                    getFailed(ticket, i)
                                 ))   
                                }
                            </TableRow>
                       ))
                    }
                    {/*<tr>
                        <th className='v-title' style={{fontSize: '12px', verticalAlign: 'middle'}}>дата</th>
                            {
                                Object.entries(gradeData).map((v: any, i)=>(
                                    <th key={v[1].session} className='v-title'>{v[1].time}</th>
                                ))
                            }
                            {
                                [...Array(40-Object.entries(gradeData).length)].map((v)=>(
                                    <td style={{fontSize: '11px'}} className='v-title' key={v}></td>
                                ))
                            }
                    </tr>
                
                    <tr>
                        <td></td>
                        {
                            tickets.map((v, i)=>{
                                return getFailedForTicket(gradeData, i) 
                            })
                          
                        }
                    </tr>*/}
                    </TableBody>
            </Table>
            </TableContainer>
            )}
        </div>
    )
}