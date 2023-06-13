import {useState, useEffect, PureComponent} from 'react';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import request from '../utils/request'

export default () => {

    const [tickets, setTickets] = useState([]),
          [correctChartData, setCorrectChart] = useState([]),
          [incorrectChartData, setInCorrectChart] = useState([]);

    useEffect(()=>{
        request({method: 'post', data: {action: "getTickets"}}).then(response => {
            const {data} = response;
            setTickets(data);
        });
    }, []);

    const getTicketStat = (event: SelectChangeEvent) => {
        request({method: "post", data: {action: "getStatistic", data: {ticketId: event.target.value}}}).then((response)=>{
            const {data} = response;
            setCorrectChart(data.correct);
            setInCorrectChart(data.incorrect);
        });
    }

    return (
        <Box sx={{ minWidth: 320 }}>
            <h3>Статистика</h3>
            <FormControl sx={{minWidth: 200}}>
                <Select  onChange={getTicketStat} label="Выберите билет">
                    <option>Выберите билет</option>
                    {
                        tickets.map((v)=>(
                            <MenuItem  value={v.id}>{v.name}</MenuItem >
                            ))
                        }
                </Select>
            </FormControl>
            <div id="chartWrapper" className="chart-wrapper">
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
                        <Label value="Билеты" offset={-10} position="insideRight" />
                      </XAxis>
                      <YAxis label={{ value: 'среднее время', angle: -90, position: 'insideLeft' }} />
                      <Tooltip/>
                      <Legend />
                      <Bar dataKey="среднее время" stackId="a" fill="#8884d8" />
                      <Bar dataKey="человек прошло" stackId="a" fill="#82ca9d" />
                    </BarChart>
                </div>
                <div id="chartWrapper" className="chart-wrapper">
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
                        <Label value="Билеты" offset={-10} position="insideRight" />
                      </XAxis>
                      <YAxis label={{ value: 'среднее время', angle: -90, position: 'insideLeft' }} />
                      <Tooltip/>
                      <Legend />
                      <Bar dataKey="среднее время" stackId="a" fill="#8884d8" />
                      <Bar dataKey="человек прошло" stackId="a" fill="#82ca9d" />
                    </BarChart>
                </div>  
        </Box>
    )
}