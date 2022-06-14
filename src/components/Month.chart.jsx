import React, { useState, useEffect } from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import PropTypes from 'prop-types';

const { REACT_APP_APIPATH: APIPath } = process.env;

const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();

function CustomTooltip({ active, payload, dateValues }) {
  const { length } = payload;
  if (active && length) {
    const [first] = payload;
    const { payload: values } = first;
    const weekday = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const { y, m } = dateValues;
    const { x, y: positionY } = values;
    const newDate = new Date(y, m - 1, x);
    const day = weekday[newDate.getDay()];
    const date = `${day}, ${x}-${m}-${y}`;
    return (
      <div className="hint">
        <div>
          <b>Date:</b> {date}
        </div>
        <div>
          <b>New items:</b> {positionY}
        </div>
      </div>
    );
  }
  return null;
}

CustomTooltip.defaultProps = {
  active: false,
  dateValues: {
    m: 0,
    y: 0,
  },
  payload: [],
};
CustomTooltip.propTypes = {
  active: PropTypes.bool,
  dateValues: PropTypes.object,
  payload: PropTypes.array,
};

function Plot() {
  const [data, setData] = useState([]);
  const [ticks, setTicks] = useState(0);
  const [dateValues, setDateValues] = useState({ m: 0, y: 0 });
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  /* const CustomTooltip = useCallback(
    ({ active, payload }) => {
      if (active && payload && payload.length) {
        const values = payload[0].payload;
        const weekday = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const newDate = new Date(dateValues.y, dateValues.m, values.x);
        const day = weekday[newDate.getDay()];
        const date = `${day}, ${values.x}-${dateValues.m + 1}-${dateValues.y}`;
        return (
          <div className="hint">
            <div>
              <b>Date:</b> {date}
            </div>
            <div>
              <b>New items:</b> {values.y}
            </div>
          </div>
        );
      }
      return null;
    },
    [dateValues]
  ); */

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const loadData = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}monthly-stats`,
        crossDomain: true,
        signal: controller.signal,
      })
        .then((response) => {
          const empty = {
            year: '',
            month: '',
            items: [],
          };
          return response.data.data || empty;
        })
        .catch((error) => {
          console.log(error);
        });
      if (!unmounted) {
        // ticks
        const { items = [], month: m = 1, year: y = 2022 } = responseData;
        const monthDays = getDaysInMonth(m, y);
        setDateValues({
          m,
          y,
        });
        const daysData = [];
        const days = [];
        for (let day = 0; day <= monthDays; day += 1) {
          daysData.push({ x: day, y: 0 });
          days.push(day);
        }
        days.splice(0, 1);
        setTicks(days);
        const { length } = items;
        for (let i = 0; i < length; i += 1) {
          const item = items[i];
          const { day, count } = item;
          daysData[day] = { x: day, y: count };
        }
        daysData.splice(0, 1);
        setData(daysData);
        setYear(y);
        setMonth(m - 1);
      }
    };
    loadData();
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, []);

  let content = (
    <div style={{ padding: '40pt', textAlign: 'center' }}>
      <Spinner type="grow" color="info" />
    </div>
  );

  if (data.length > 0) {
    content = (
      <ResponsiveContainer height={300}>
        <LineChart
          height={300}
          data={data}
          margin={{ top: 15, right: 5, bottom: 15, left: 0 }}
        >
          <CartesianGrid />
          <XAxis dataKey="x" ticks={ticks} padding={{ left: 20 }} />
          <YAxis dataKey="y" angle={-45} />
          <Line
            type="monotoneX"
            dataKey="y"
            stroke="red"
            dot={{ stroke: 'blue' }}
            isAnimationActive={false}
            strokeWidth={3}
          />
          <Tooltip content={<CustomTooltip dateValues={dateValues} />} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthText = months[month];
  return (
    <div>
      <h4>
        New items this month{' '}
        <div className="pull-right">
          {monthText} {year}
        </div>
      </h4>
      {content}
    </div>
  );
}

export default Plot;
