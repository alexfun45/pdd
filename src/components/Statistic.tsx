import React, {useState, useEffect, PureComponent} from 'react';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import dayjs, { Dayjs } from 'dayjs';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRange } from '@mui/x-date-pickers-pro';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import request from '../utils/request'


export default () => {
    const end = dayjs(), start = end.subtract(2, 'day');
    const [tickets, setTickets] = useState([]),
          [selectedTicketId, setTicketId] = useState(0),
          [correctChartData, setCorrectChart] = useState([]),
          [incorrectChartData, setInCorrectChart] = useState([]),
          [manTime, setManTime] = useState([]),
          [currentDateRange, setDateRange] = React.useState<DateRange<Dayjs>>([
            start,
            end,
          ]);;

    useEffect(()=>{
        request({method: 'post', data: {action: "getTickets"}}).then(response => {
            const {data} = response;
            setTickets(data);
        });
    }, []);

    useEffect(()=>{
        if(selectedTicketId==0) return;
        request({method: "post", data: {action: "getStatistic", data: {ticketId: selectedTicketId, start_date: currentDateRange[0].unix(), end_date: currentDateRange[1].endOf('day').unix()}}}).then((response)=>{
            const {data} = response;
            if(data.correct!=null)
                setCorrectChart(data.correct);
            if(data.incorrect!=null)
                setInCorrectChart(data.incorrect);
            if(data.stat!=null)
                setManTime(data.stat);
        });
    }, [selectedTicketId, currentDateRange])
  
    const handleChangeTicket = (event: SelectChangeEvent) => {
        setTicketId((event.target)?parseInt(event.target.value):0);
    }

    const CustomTooltip = ({ active, payload, label }:any) => {
        if (active && payload && payload.length) {
          return (
            <div className="custom-tooltip">
              <p className="label">{`минут ${label} : ${payload[0].value} человек`}</p>
            </div>
          );
        }      
        return null;
      };     

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ minWidth: 320 }}>
            <h3>Статистика</h3>
            <FormControl sx={{minWidth: 200}}>
                <Select onChange={handleChangeTicket} label="Выберите билет">
                    <option>Выберите билет</option>
                    {
                        tickets.map((v)=>(
                            <MenuItem  value={v.id}>{v.name}</MenuItem >
                            ))
                        }
                </Select>
            </FormControl><br />
            <div style={{display:'inline-block', marginTop: '20px'}}>
                <DateRangePicker
                    value={currentDateRange}
                    onChange={(newValue) => setDateRange(newValue)}
                />
            </div>
            <div id="chartWrapper" className={(correctChartData.length>0)?"chart-wrapper":"hide"}>
                  <h3>Статистика успешно пройденных вопросов</h3>
                  <BarChart
                      maxBarSize={50}
                      width={document.body.clientWidth*0.8}
                      height={400}
                      data={correctChartData}
                      margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                      >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" >
                        <Label value="Вопросы" offset={0} position="insideBottomRight" />
                      </XAxis>
                      <YAxis label={{ value: 'среднее время(сек.)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip/>
                      <Legend />
                      <Bar dataKey="среднее время" stackId="a" fill="#8884d8" />
                      <Bar dataKey="человек прошло" stackId="a" fill="#82ca9d" />
                    </BarChart>
                </div>
                <div id="chartWrapper" className={(correctChartData.length>0)?"chart-wrapper":"hide"}>
                    <h3>Статистика неупешно пройденных вопросов</h3>
                    <BarChart
                        maxBarSize={50}
                        width={document.body.clientWidth*0.8}
                        height={400}
                        data={incorrectChartData}
                        margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" >
                            <Label value="Вопросы" offset={0} position="insideBottomRight" />
                        </XAxis>
                        <YAxis label={{ value: 'среднее время(сек.)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip/>
                        <Legend />
                        <Bar dataKey="среднее время" stackId="a" fill="#8884d8" />
                        <Bar dataKey="человек прошло" stackId="a" fill="#82ca9d" />
                    </BarChart>
                </div>  
                <div id="chartWrapper" className={(correctChartData.length>0)?"chart-wrapper":"hide"}>
                    <h3>Статистика количества человек/времени прохождения</h3>
                    <BarChart
                        maxBarSize={50}
                        width={document.body.clientWidth*0.8}
                        height={400}
                        data={manTime}
                        margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis  dataKey="name" >
                            <Label value="Минут" offset={0} position="insideBottomRight" />
                        </XAxis>
                        <YAxis label={{ value: 'человек', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<CustomTooltip />}/>
                        <Legend />
                        <Bar dataKey="человек" stackId="a" fill="#82ca9d" />
                    </BarChart>
                </div>  
        </Box>
        </LocalizationProvider>
    )
}