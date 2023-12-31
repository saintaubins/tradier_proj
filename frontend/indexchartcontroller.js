//const backEndUrl = 'http://127.0.0.1:5001/';
const backEndUrl = 'https://tradier-app-b7ceb132d0e1.herokuapp.com/';

const emaChart = document.getElementById('emaChart').getContext('2d');
const emaChart2 = document.getElementById('emaChart2').getContext('2d');
const emaChart3 = document.getElementById('emaChart3').getContext('2d');

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0, so we add 1 and pad with 0 if needed
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

const todayDate = getTodayDate();
//console.log(todayDate); // Output: "2023-07-28"
//let isValidTimeSalesRes = '';
function getTimeSales(symbol, intervalSelect,startDate, endDate) {
  let newDataArray = []
  // Send the POST request
  //console.log('backendUrl', backEndUrl)
  fetch(`${backEndUrl}timesales?symbol=${symbol}&intervalSelect=${intervalSelect}&startDate=${startDate}&endDate=${endDate}`,{
    mode: 'cors'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
      //console.log('data.message -> ',data.message)
      //showErrorMessage(data.message.exception);
      //newDataArray = data.message.series.data;
      // Process the data returned by the server, if needed
      if (data.message === null || data.message.status_code == 400) {
        showErrorMessage([` 😔 Sorry, there are invalid parameters.`, 'Refresh the screen and try your search again.']);
        setTimeout(hideErrorMessage, 15000);
      }else if (data.message.series === null) {
        showErrorMessage([` 😔 Sorry, there seems to be no data for this set...`]);
        setTimeout(hideErrorMessage, 15000);
      }else if (data.message.errors) {
        showErrorMessage(data.message.errors);
        setTimeout(hideErrorMessage, 15000);

      } else if (data.message.exception) {
        //console.log(data.message.exception, 'was called')
        showErrorMessage(data.message.exception);
        setTimeout(hideErrorMessage, 15000);

      } else if (data.message.success) {
        showOrderMessage(data.message.success);
        setTimeout(hideOrderMessage, 15000);
      } else {
        //console.log('series-> ', data.message)
        //isValidTimeSalesRes = true;
        //console.log('isValidTimeSalesRes-> ', isValidTimeSalesRes)
        newDataArray = data.message.series.data;

        // Extracting close prices from the data
        const closePrices = data.message.series.data.map(item => item.close);


      //***************/ Calculate EMA 1 and EMA 7 for close prices*******************
      const calcEma1 = calculateEMA(closePrices, 1);
      const calcEma2 = calculateEMA(closePrices, 2);
      const calcEma3 = calculateEMA(closePrices, 3);
      const calcEma7 = calculateEMA(closePrices, 7);


      updateChartWithData(newDataArray, calcEma1, calcEma2, calcEma3, calcEma7);
      newData = newDataArray
      return newData
    }
  })
  .catch((error) => {
      showErrorMessage([`${error}`])
      setTimeout(hideErrorMessage, 15000);
    console.error("Error occurred while making the request:", error);
  });
    
};

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

let tickerSymbol = ''
document.getElementById("searchLoad").addEventListener("click", function(event) {
  // Store the current scroll position
  //const scrollY = window.scrollY;
  //event.preventDefault();

  tickerSymbol = document.getElementById("tickerSymbol").value;
  const intervalSelect = document.getElementById("intervalSelect").value;
  if(tickerSymbol == '') {
    showErrorMessage(['This needs a ticker symbol please.'])
    setTimeout(hideErrorMessage, 15000);
  } else {
    //event.preventDefault();
    getTimeSales(tickerSymbol, intervalSelect, startDate, todayDate);
    
    if(tickerSymbol && intervalSelect && startDate){
      setInterval(() => {
        event.stopPropagation();
        getTimeSales(tickerSymbol, intervalSelect, startDate, todayDate);
        event.preventDefault();
      }, 10000); // 10000 milliseconds = 10 seconds
    }
  }
});
//console.log('myChart ->', myChart)

//getTimeSales();
let dataY = []

let myChart = new Chart(emaChart, {
  type: 'line',
  data: dataY,
  options: {
    // animation: {
    //   easing: 'linear', // Use your preferred easing function
    //   duration: 200, // Set an appropriate duration
    // },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: dataY.length // Display all ticks
        }
      },
      y: {
        beginAtZero: false
      }
    }
  }
});

let myChart2 = new Chart(emaChart2, {
  type: 'line',
  data: dataY,
  options: {
    // animation: {
    //   easing: 'linear', // Use your preferred easing function
    //   duration: 200, // Set an appropriate duration
    // },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: dataY.length // Display all ticks
        }
      },
      y: {
        beginAtZero: false
      }
    }
  }
});

let myChart3 = new Chart(emaChart3, {
  type: 'line',
  data: dataY,
  options: {
    // animation: {
    //   easing: 'linear', // Use your preferred easing function
    //   duration: 200, // Set an appropriate duration
    // },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: dataY.length // Display all ticks
        }
      },
      y: {
        beginAtZero: false
      }
    }
  }
});

function updateChartWithData(newDataArray, ema1, ema2, ema3, ema7) {

  const labelsX = newDataArray.map((dataObj) => dataObj.time); // Use 'time' field from newDataArray as labels

  //const dataY = {
  dataY = {
    labels: labelsX,
    datasets: [{
      label: 'Current price',
      data: [],
      fill: false,
      borderColor: 'rgb(140, 140, 140)',
      pointRadius: 0,
      tension: 0.25
    },{
      label: 'EMA1 (fastest) Short',
      data: [],
      fill: false,
      borderColor: 'rgb(255, 99, 71)',
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

  dataY2 = {
    labels: labelsX,
    datasets: [{
      label: 'Current price',
      data: [],
      fill: false,
      borderColor: 'rgb(150, 150, 150)',
      pointRadius: 0,
      tension: 0.25
    },{
      label: 'EMA2 (medium) Short',
      data: [],
      fill: false,
      borderColor: 'rgb(255, 50, 40)',
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

  dataY3 = {
    labels: labelsX,
    datasets: [{
      label: 'Current price',
      data: [],
      fill: false,
      borderColor: 'rgb(155, 155, 155)',
      pointRadius: 0,
      tension: 0.25
    },{
      label: 'EMA3 (slowest) Short',
      data: [],
      fill: false,
      borderColor: 'rgb(255, 5, 4)',
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


  var pos = $(document).scrollTop();
  if (myChart != undefined)
  myChart.destroy();

  // var pos1 = $(document).scrollTop();
  // if (myChart1 != undefined)
  // myChart1.destroy();

  // var pos2 = $(document).scrollTop();
  // if (myChart2 != undefined)
  // myChart2.destroy();

  myChart = new Chart(emaChart, {
    type: 'line',
    data: dataY,
    options: {
      // animation: {
      //   easing: 'linear', // Use your preferred easing function
      //   duration: 200, // Set an appropriate duration
      // },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: labelsX.length // Display all ticks
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
  $(document).scrollTop(pos);

  var pos2 = $(document).scrollTop();
  if (myChart2 != undefined)
  myChart2.destroy();

  myChart2 = new Chart(emaChart2, {
    type: 'line',
    data: dataY2,
    options: {
      // animation: {
      //   easing: 'linear', // Use your preferred easing function
      //   duration: 200, // Set an appropriate duration
      // },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: labelsX.length // Display all ticks
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
  $(document).scrollTop(pos2);

  var pos3 = $(document).scrollTop();
  if (myChart3 != undefined)
  myChart3.destroy();

  myChart3 = new Chart(emaChart3, {
    type: 'line',
    data: dataY3,
    options: {
      // animation: {
      //   easing: 'linear', // Use your preferred easing function
      //   duration: 200, // Set an appropriate duration
      // },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: labelsX.length // Display all ticks
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
  $(document).scrollTop(pos3);


  // Update labels in the chart data
  myChart.data.labels = labelsX;
  myChart2.data.labels = labelsX;
  myChart3.data.labels = labelsX;

  // Update 'Current price' dataset data
  const currentPriceData = newDataArray.map((dataObj) => dataObj.price);
  myChart.data.datasets[0].data = currentPriceData;
  myChart2.data.datasets[0].data = currentPriceData;
  myChart3.data.datasets[0].data = currentPriceData;

  // Update 'EMA Short' dataset data
  myChart.data.datasets[1].data = ema1;
  myChart2.data.datasets[1].data = ema2;
  myChart3.data.datasets[1].data = ema3;

  const ema1Dataset = myChart.data.datasets[1];
  const ema2Dataset = myChart2.data.datasets[1];
  const ema3Dataset = myChart3.data.datasets[1];
  let mostRecentPrice = 0
  let mostRecentEma1 = 0
  let mostRecentEma2 = 0
  let mostRecentEma3 = 0
  let mostRecentEma7 = 0
  if (ema1Dataset.data.length > 0) {
    mostRecentEma1 = ema1Dataset.data[ema1Dataset.data.length - 1];
    //console.log('Most recent EMA1 value:', mostRecentEma1);
  } if (ema2Dataset.data.length > 0) {
    mostRecentEma2 = ema2Dataset.data[ema2Dataset.data.length - 1];
    //console.log('Most recent EMA1 value:', mostRecentEma1);
  } if (ema3Dataset.data.length > 0) {
    mostRecentEma3 = ema3Dataset.data[ema3Dataset.data.length - 1];
    //console.log('Most recent EMA1 value:', mostRecentEma1);
  } else {
    console.log('EMA"s dataset"s are empty.');
    showErrorMessage(['EMA"s dataset"s are empty.'])
    setTimeout(hideErrorMessage, 15000);
  }

  // Update 'EMA Long' dataset data
  myChart.data.datasets[2].data = ema7;
  myChart2.data.datasets[2].data = ema7;
  myChart3.data.datasets[2].data = ema7;
  
  const ema7Dataset = myChart.data.datasets[2];

  if (ema7Dataset.data.length > 0) {
    mostRecentEma7 = ema7Dataset.data[ema7Dataset.data.length - 1];
    //console.log('Most recent EMA7 value:', mostRecentEma7);
  } else {
    console.log('EMA7 dataset is empty.');
    showErrorMessage(['EMA7 dataset is empty.'])
    setTimeout(hideErrorMessage, 15000);
  }

  // Update 'Price' dataset data
  const priceDataset = myChart.data.datasets[0];

  if (priceDataset.data.length > 0) {
    mostRecentPrice = priceDataset.data[priceDataset.data.length - 1];
    //console.log('Most recent Price value:', mostRecentPrice);
  } else {
    console.log('Price dataset is empty.');
    showErrorMessage(['Price dataset is empty.'])
    setTimeout(hideErrorMessage, 15000);
  }

  checkEMAValues(mostRecentEma1, mostRecentEma2, mostRecentEma3, mostRecentEma7, mostRecentPrice);

  myChart.update();
  myChart2.update();
  myChart3.update();
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

function showErrorMessage1(errorMessages) {
  const errorMessageDiv = document.getElementById('errorMessage1');
  const errorText = document.getElementById('errorText1');
  errorText.innerHTML = ''; // Clear any previous error messages

  errorMessages.forEach((errorMessage) => {
    const errorItem = document.createElement('div');
    errorItem.textContent = errorMessage;
    errorText.appendChild(errorItem);
  });

  errorMessageDiv.style.display = 'block';
}

function showErrorMessage2(errorMessages) {
  const errorMessageDiv = document.getElementById('errorMessage2');
  const errorText = document.getElementById('errorText2');
  errorText.innerHTML = ''; // Clear any previous error messages

  errorMessages.forEach((errorMessage) => {
    const errorItem = document.createElement('div');
    errorItem.textContent = errorMessage;
    errorText.appendChild(errorItem);
  });

  errorMessageDiv.style.display = 'block';
}

function showErrorMessage3(errorMessages) {
  const errorMessageDiv = document.getElementById('errorMessage3');
  const errorText = document.getElementById('errorText3');
  errorText.innerHTML = ''; // Clear any previous error messages

  errorMessages.forEach((errorMessage) => {
    const errorItem = document.createElement('div');
    errorItem.textContent = errorMessage;
    errorText.appendChild(errorItem);
  });

  errorMessageDiv.style.display = 'block';
}

function showSuccessMessage(message) {
  const successMessageDiv = document.getElementById('successMessage');
  const successText = document.getElementById('successText');
  successText.textContent = message;
  successMessageDiv.style.display = 'block';
}

function showSuccessMessage1(message) {
  const successMessageDiv = document.getElementById('successMessage1');
  const successText = document.getElementById('successText1');
  successText.textContent = message;
  successMessageDiv.style.display = 'block';
}

function showSuccessMessage2(message) {
  const successMessageDiv = document.getElementById('successMessage2');
  const successText = document.getElementById('successText2');
  successText.textContent = message;
  successMessageDiv.style.display = 'block';
}

function showSuccessMessage3(message) {
  const successMessageDiv = document.getElementById('successMessage3');
  const successText = document.getElementById('successText3');
  successText.textContent = message;
  successMessageDiv.style.display = 'block';
}

// Function to hide the error message box
function hideErrorMessage() {
  const successMessage = document.getElementById("errorMessage");
  successMessage.style.display = "none";
}

// Function to clear the alert divs
function clearAlerts() {
  const successMessageDiv = document.getElementById('successMessage');
  const successMessageDiv1 = document.getElementById('successMessage1');
  const successMessageDiv2 = document.getElementById('successMessage2');
  const successMessageDiv3 = document.getElementById('successMessage3');
  const errorMessageDiv = document.getElementById('errorMessage');
  const errorMessageDiv1 = document.getElementById('errorMessage1');
  const errorMessageDiv2 = document.getElementById('errorMessage2');
  const errorMessageDiv3 = document.getElementById('errorMessage3');
  successMessageDiv.style.display = 'none';
  successMessageDiv1.style.display = 'none';
  successMessageDiv2.style.display = 'none';
  successMessageDiv3.style.display = 'none';
  errorMessageDiv.style.display = 'none';
  errorMessageDiv1.style.display = 'none';
  errorMessageDiv2.style.display = 'none';
  errorMessageDiv3.style.display = 'none';
}

function checkEMAValues(ema1, ema2, ema3, ema7, currPrice) {
  clearAlerts();

  const rawNumber = currPrice;
  const roundedNumber = rawNumber.toFixed(2); // Round to 2 decimal places
  const formattedNumber = parseFloat(roundedNumber).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });

  if  (ema1 > ema7) {
    // Go ema1 long
    showSuccessMessage1(` 😃 EMA1 (fastest) says, "Go Long", Underlying: ${tickerSymbol.toUpperCase()}, Current Price: ${formattedNumber}`);
  } if (ema2 > ema7) {
    // Go ema2 long
    showSuccessMessage2(` 😃 Ema2 (medium) says, "Go Long", Underlying: ${tickerSymbol.toUpperCase()}, Current Price: ${formattedNumber}`);
  } if (ema3 > ema7) {
    // Go ema3 long
    showSuccessMessage3(` 😃 Ema3 (slowest) says, "Go Long", Underlying: ${tickerSymbol.toUpperCase()}, Current Price: ${formattedNumber}`);
  } if (ema1 < ema7) {
    // Go ema1 short
    showErrorMessage1([` 😃 EMA1 (fastest) says, "Go short", Underlying: ${tickerSymbol.toUpperCase()}, Current Price: ${formattedNumber}`]);
  } if (ema2 < ema7) {
    // Go ema2 short
    showErrorMessage2([` 😃 EMA2 (medium) says, "Go short", Underlying: ${tickerSymbol.toUpperCase()}, Current Price: ${formattedNumber}`]);
  } if (ema3 < ema7) {
    // Go ema3 short
    showErrorMessage3([` 😃 EMA3 (slowest) says, "Go short", Underlying: ${tickerSymbol.toUpperCase()}, Current Price: ${formattedNumber}`]);
  }
}
let startDate = ''
$(document).ready(function () {
  $('#datepicker').datepicker({
    format: 'yyyy-mm-dd', // Format of the selected date
    autoclose: true, // Automatically close the datepicker when a date is selected
    todayHighlight: true, // Highlight today's date
  }).on('changeDate', function (e) {
    // This function will be triggered when the date is selected
    startDate = e.date; // The selected date object
    //console.log('startDate -> ', startDate); // You can use or process the selected date here
    const formattedDate = formatDate(startDate);
    startDate = formattedDate;
    //console.log('startDate -> ', startDate); // Output: "2023-08-14"
  });
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get a reference to the refresh button
const refreshButton = document.getElementById('refreshButton');

// Add a click event listener to the button
refreshButton.addEventListener('click', function () {
    // Reload the current page
    location.reload();
});



