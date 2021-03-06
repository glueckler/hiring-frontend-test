import React, { useState, useEffect } from 'react';
import Chart from './Chart.js';
import './App.css';

function App() {
  const [inputs, setInputs] = useState({
    daysSinceToday: 7,
    todaysDateObject: new Date(),
    units: 'metric',
    evapoCoeff: '0.51',
  });
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  const dates = createArrayOfDates(inputs.daysSinceToday);

  useEffect(() => {
    getDataForDatesSinceToday(
      {
        dates,
        evapoCoeff: inputs.evapoCoeff,
      },
      setChartData,
      setError
    );
  }, [inputs]);

  return (
    <div className="App">
      <Chart
        chartData={{ dates, weatherData: chartData }}
        daysSinceToday={inputs.daysSinceToday}
        todaysDateObject={cloneDateObject(inputs.todaysDateObject.getTime())}
        units={inputs.units}
      />
      <form>
        <div>
          <span style={{ paddingRight: '5px' }}>Select days to display:</span>
          <select
            value={inputs.daysSinceToday}
            onChange={(event) =>
              setInputs({
                ...inputs,
                daysSinceToday: parseInt(event.target.value),
              })
            }
          >
            <option value="3">3</option>
            <option value="7">7</option>
            <option value="14">14</option>
            <option value="30">30</option>
          </select>
        </div>
        <div>
          <span style={{ paddingRight: '5px' }}>Select Units to display:</span>
          <select
            value={inputs.units}
            onChange={(event) =>
              setInputs({
                ...inputs,
                units: event.target.value,
              })
            }
          >
            <option value="standard">Standard</option>
            <option value="metric">Metric</option>
          </select>
        </div>
        <div>
          <span style={{ paddingRight: '5px' }}>
            Evapotranspiration coefficient (decimal between 0 and 1)
          </span>
          <input
            type="text"
            value={inputs.evapoCoeff}
            onChange={(event) =>
              setInputs({ ...inputs, evapoCoeff: event.target.value })
            }
          />
        </div>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

function createArrayOfDates(daysSinceToday) {
  const todaysDate = new Date();
  const earliestDate = cloneDateObject(todaysDate).setDate(
    todaysDate.getDate() - daysSinceToday
  );
  for (
    var arr = [], dateIndex = cloneDateObject(earliestDate);
    dateIndex < todaysDate;
    dateIndex.setDate(dateIndex.getDate() + 1)
  ) {
    arr.push(new Date(dateIndex));
  }
  return arr;
}

function cloneDateObject(dateObj) {
  return new Date(dateObj);
}

function getDataForDatesSinceToday({ dates, evapoCoeff }, setData, setError) {
  const dataPromises = dates.map((date) => {
    return getDataPromise({
      date,
      evapoCoeff,
    });
  });

  setError(null);

  return Promise.all(dataPromises)
    .then((data) => {
      setData(data);
    })
    .catch(() =>
      setError('Something went wrong gathering data.  Check the inputs.')
    );
}

function getDataPromise({ date, evapoCoeff }) {
  const baseUrl = `https://stage.altrac-api.com/evapo/address/26002e000c51343334363138`;
  const queryString = `?date=${buildDateString(
    date
  )}&tzOffset=-7&elevation=160.9&latitude=43.2624613&Kc=${evapoCoeff}`;
  const url = `${baseUrl}${queryString}`;

  return fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error('Something went wrong.');
    }
    return res.json();
  });
}

function buildDateString(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default App;
