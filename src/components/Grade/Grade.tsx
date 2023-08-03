import React, {useEffect, useState} from 'react'
import request from '../../utils/request'
import Table1 from 'react-bootstrap/Table'
import InfoModal from '../Tickets/InfoModal'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import UserGradeTable from './userGradeTable'

const tickets:number[] = [];

for(let i=1;i<=40;i++){
    tickets[i-1] = i;
}

type userStatType = {
    time: string;
    failed: number;
    user_id: number;
    session: string;
}

interface statsInterface {
    [key: string]: userStatType;
};

export default () => {

    const [gradeData, setGradeData] = useState<statsInterface>({"admin": {time: "22-45-2023", failed: 1, user_id:1, session:'123123123'}});
    const [open, setOpen] = useState(false),
          [fQuestions, setfQuestions] = useState([]),
          closeModal = () => setOpen(false),
          [order, setOrder] = useState("DESC"),
          [selectedUser, setUser] = useState(0);
   
    useEffect(()=>{
        request({method: 'post', data: {action: "getGrade", data: {order: order}}}).then(response => {
            const {data} = response;
            setGradeData(data);
        });
    }, [order]);

    const handleClickItem = (user_id: number, session: string) => {
        request({method: 'post', data: {action: "getFailedQuestions", data: { user_id: user_id, testSession: session}}}).then(response => {
            const {data} = response;
            setfQuestions(data);
        });
        setOpen(true);
    }

    const handleUserClick = (userData: any) => {
        let user:any = (Object.entries(userData))[0];
        user = user[1].user_id;
        setUser(user);
    }

    const handleOrder = () => {
        let __order = (order=="ASC")?"DESC":"ASC";
        setOrder(__order);
    }

    const regNumber = /[^\d]*?(\d+)/;

    const getFailedForTicket = (userData:statsInterface, ticketIndx: number) => {
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
            return <TableCell><span onClick={()=>handleClickItem(user_id, session.toString())} className='btnItem'>{failed}</span></TableCell>
        else
            return <TableCell></TableCell>
    }

    return (
        <div>
            <InfoModal showDialog={open} setOpen={setOpen} fQuestions={fQuestions}/>
            <TableContainer className={(selectedUser==0)?"":"hide"} sx={{ maxHeight: 640 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell rowSpan={2}>логин/id</TableCell>
                            {/*<TableCell colSpan={41}>Билеты</TableCell>*/}
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{"cursor":"pointer"}} onClick={(e)=>handleOrder()} style={{fontSize: '12px'}}>дата <i className={(order=='ASC')?"bi bi-arrow-down":"bi bi-arrow-up"}></i></TableCell>
                            {
                                tickets.map((v, i)=>(
                                    <TableCell style={{padding: '6px 8px'}}>{v}</TableCell>
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                        Object.entries(gradeData).map((userData:any, indx)=>(
                            <TableRow>
                                <TableCell style={{fontSize: '12px'}}><span onClick={(e)=>handleUserClick(userData[1])} className='btn-link'>{userData[0]}</span></TableCell>
                                <TableCell style={{fontSize: '12px', padding: '6px 8px'}}>{
                                    Object.entries(userData[1]).map((d: any, i: number)=>{
                                        if(i>0) return;
                                        return d[1].time;
                                    })
                                    }
                                </TableCell>
                                {
                                tickets.map((v, i)=>{
                                    return getFailedForTicket(userData[1], i) 
                                })
                                /*Object.entries(userData[1]).map((ticketData: any)=>(
                                    <TableCell><span onClick={()=>handleClickItem(userData[1].user_id, ticketData[1].session)} className='btnItem'>{ticketData[1].failed}</span></TableCell>
                                ))*/
                                }
                            </TableRow>
                        ))
                        }
                    </TableBody>
                    </Table>
                </TableContainer>
                <div className={(selectedUser==0)?"hide":""}>
                    { (selectedUser!=0) && (
                        <UserGradeTable user_id={selectedUser} setUser={setUser} handleClickItem={handleClickItem} />
                    )
                    }
                </div>
            <div>
            </div>
        </div>
    )
}