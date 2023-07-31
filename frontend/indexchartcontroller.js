//import { backEndUrl } from 'openTrades';

const ema = document.getElementById('homeChart').getContext('2d');

function getTimeSales(symbol) {
  let newDataArray = []
  // Send the POST request
  fetch(`http://127.0.0.1:5000/timesales?symbol=${symbol}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
      //console.log('data -> ',data.message.series.data)
      newDataArray = data.message.series.data;
      // Process the data returned by the server, if needed
      if (data.message.errors) {
        showErrorMessage(data.message.errors.error);
        setTimeout(hideErrorMessage, 15000);

      } else if (data.message.exception) {
        showErrorMessage(data.message.exception);
        setTimeout(hideErrorMessage, 15000);

      } else if (data.message.success) {
        showOrderMessage(data.message.success);
        setTimeout(hideOrderMessage, 15000);
      } else {
        // Extracting close prices from the data
        const closePrices = data.message.series.data.map(item => item.close);

        // Function to calculate EMA
        function calculateEMA(data, period) {
          const emaArray = [];
          const smoothingFactor = 2 / (period + 1);

          // Calculate the EMA 1 (no need for looping)
          emaArray.push(data[0]);

          // Calculate the EMA 7
          for (let i = 1; i < data.length; i++) {
            const ema = (data[i] * smoothingFactor) + (emaArray[i - 1] * (1 - smoothingFactor));
            emaArray.push(ema);
          }

          return emaArray;
        }

        // Calculate EMA 1 and EMA 7 for close prices
        const ema1 = calculateEMA(closePrices, 1);
        const ema7 = calculateEMA(closePrices, 7);

        //console.log('newDataArray:', newDataArray);
        //console.log('EMA 1:', ema1);
        //console.log('EMA 7:', ema7);

        updateChartWithData(newDataArray, ema1, ema7);
        newData = newDataArray
        return newData
      }
    })
    .catch((error) => {
      console.error("Error occurred while making the request:", error);
    });
    
};

document.getElementById("searchLoad").addEventListener("click", function() {
  const tickerSymbol = document.getElementById("tickerSymbol").value;
  if(tickerSymbol == '') {
    showErrorMessage(['Needs a ticker symbol'])
    setTimeout(hideErrorMessage, 15000);
  } else {
    getTimeSales(tickerSymbol);
  }
});
//console.log('myChart ->', myChart)

//getTimeSales();
let dataY = []

let myChart = new Chart(ema, {
  type: 'line',
  data: dataY,
  options: {
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }
});

function updateChartWithData(newDataArray, ema1, ema7) {

  const labelsX = newDataArray.map((dataObj) => dataObj.time); // Use 'time' field from newDataArray as labels

  //const dataY = {
  dataY = {
    labels: labelsX,
    datasets: [{
      label: 'Current price',
      data: [],
      fill: false,
      borderColor: 'rgb(255, 141, 0)',
      pointRadius: 0,
      tension: 0.25
    },{
      label: 'EMA Short',
      data: [],
      fill: false,
      borderColor: 'rgb(54, 162, 235)',
      pointRadius: 0,
      tension: 0.25
    },{
      label: 'EMA Long',
      data: [],
      fill: false,
      borderColor: 'rgb(23, 192, 2)',
      pointRadius: 0,
      tension: 0.25
    }]
  };

  myChart.destroy()
  myChart = new Chart(ema, {
    type: 'line',
    data: dataY,
    options: {
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });

  // Update labels in the chart data
  myChart.data.labels = labelsX;

  // Update 'Current price' dataset data
  const currentPriceData = newDataArray.map((dataObj) => dataObj.price);
  myChart.data.datasets[0].data = currentPriceData;

  // Update 'EMA Short' dataset data
  myChart.data.datasets[1].data = ema1;

  // Update 'EMA Long' dataset data
  myChart.data.datasets[2].data = ema7;

  myChart.update();
}

// Function to show the error message box
function showErrorMessage(errorMessages) {
  const errorMessageDiv = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  errorText.innerHTML = ''; // Clear any previous error messages

  errorMessages.forEach((errorMessage) => {
    const errorItem = document.createElement('div');
    errorItem.textContent = errorMessage;
    errorText.appendChild(errorItem);
  });

  errorMessageDiv.style.display = 'block';
}

// Function to hide the error message box
function hideErrorMessage() {
  const successMessage = document.getElementById("errorMessage");
  successMessage.style.display = "none";
}



