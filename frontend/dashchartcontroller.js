//const backEndUrl = 'http://127.0.0.1:5001/';
const backEndUrl = 'https://tradier-app-b7ceb132d0e1.herokuapp.com/';

const popIvChart = document.getElementById('popIvChart').getContext('2d');
const bidAskChart = document.getElementById('bidAskChart').getContext('2d');
const highLowChart = document.getElementById('highLowChart').getContext('2d');

document.getElementById("viewPositionsButton").addEventListener("click", function() {
  //console.log('Button clicked')
  fetchPositions();
  //placeAlgoOrder();
});

function fetchPositions() {
  const positionsUrl = `${backEndUrl}getpositions`

  fetch(positionsUrl, {
    mode: 'cors'
  })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        console.log(data.message)
        // Process the data returned by the server, if needed
        if (data.message.errors) {
          showErrorMessage(data.message.errors.error);
          setTimeout(hideErrorMessage, 15000);
  
        } else if (data.message.exception) {
          showErrorMessage(data.message.exception);
          setTimeout(hideErrorMessage, 15000);
  
        } else if (data.message.success) {
          showPositionsMessage(data.message.success);
          setTimeout(hidePositionsMessage, 15000);

        } else if (data.message.positions == 'null') {
          showPositionsMessage(['Positions are null']);
          setTimeout(hidePositionsMessage, 15000);

        } else if (data.message.positions.position) {
          showPositionsMessage(['You have some positions']);
          populatePositionsTable(data.message.positions.position)
          setTimeout(hidePositionsMessage, 15000);
        }
      })
      .catch((error) => {
        console.error("Error occurred while making the request:", error);
      });
}

function getNextFridays(count) {
  let today = new Date();
  let dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  let daysUntilFriday = 5 - dayOfWeek; // Number of days until Friday (Friday is the 6th day of the week)

  let fridays = [];
  
  for (let i = 0; i < count; i++) {
    let nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday + i * 7); // Add a week for each iteration
    fridays.push(nextFriday);
  }

  return fridays;
}

// Function to update the <select> element with upcoming Fridays
function updateFridaysSelect() {
  let count = 4; // Number of upcoming Fridays to display
  let upcomingFridays = getNextFridays(count);
  let fridaysSelect = document.getElementById("fridaysSelect");
  //console.log('upcomingFridays ', upcomingFridays)
  // Clear previous options
  fridaysSelect.innerHTML = "";

  // Loop through the array of dates and create <option> elements for each date
  upcomingFridays.forEach(function (friday) {
      let option = document.createElement("option");
      option.textContent = formatDateToYYYYMMDD(friday);
      fridaysSelect.appendChild(option);
  });
}

// Initial update of the <select> element
updateFridaysSelect();

// Function to format the date as 'YYYY-MM-DD'
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateToYYYYMMDD(inputDate) {
  const date = new Date(inputDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// Add an event listener to the button when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {

  const viewButton = document.getElementById("viewButton");

  viewButton.addEventListener("click", function() {
  
  let selectedOption = document.getElementById('optionTypeSelect').value;

  let symbol = document.getElementById('symbolInput').value;
  if (symbol === '') {
    symbol = 'TSLA';
  }
  let expDate = document.getElementById('fridaysSelect').value;


  const url = `${backEndUrl}optionschain?symbol=${symbol}&exp_dt=${expDate}&optionType=${selectedOption}`;

  console.log("url -> ",url)
    // Making the GET request using fetch
    fetch(url, {
      mode: 'cors'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Work with the data here
        console.log(data);
        populateTable(data.message.options.option);
        showSuccessMessage([data.message.options.option[0].expiration_date, "Underlying:", data.message.options.option[0].underlying])
      })
      .catch((error) => {
        showSuccessMessage(["Error occurred while making the request:", `${error}`])
        console.error("Error occurred while making the request:", error);
      });
  });
});

// Function to clear the table data
function clearTableData() {
  const optionsDataContainer = document.getElementById("optionsData");

  // Remove existing rows from the table
  while (optionsDataContainer.firstChild) {
    optionsDataContainer.removeChild(optionsDataContainer.firstChild);
  }
}

// Function to clear the table data
function clearPositionsTableData() {
  const optionsDataContainer = document.getElementById("positionsData");

  // Remove existing rows from the table
  while (optionsDataContainer.firstChild) {
    optionsDataContainer.removeChild(optionsDataContainer.firstChild);
  }
}

// Function to populate the table with options data
function populateTable(data) {
  const optionsDataContainer = document.getElementById("optionsData");

  // Call the function to clear the table before populating it with new data
  clearTableData();
  updateChartWithData(data)


  // Loop through the option objects and create table rows
  data.forEach((option) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${option.bid}</td>
      <td>${option.ask}</td>
      <td>${option.strike}</td>
      <td>
      ${typeof option.pop === 'number' ? option.pop * 100 : option.pop}
      </td>
      <td>
      ${typeof option.iv === 'number' ? option.iv * 100 : option.iv}
      </td>
      <td>${option.symbol}</td>
      <td>${option.description}</td>
      <td>${option.expiration_date}</td>
    `;
    optionsDataContainer.appendChild(row);
  });

}

// Function to populate the table with options data
function populatePositionsTable(data) {
  const positionsDataContainer = document.getElementById("positionsData");

  // Call the function to clear the table before populating it with new data
  clearPositionsTableData();

  // Loop through the option objects and create table rows
  if (Array.isArray(data)) {
    data.forEach((position) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${position.cost_basis}</td>
        <td>${position.date_acquired}</td>
        <td>${position.id}</td>
        <td>${position.quantity}</td>
        <td>${position.symbol}</td>
      `;
      positionsDataContainer.appendChild(row);
    });

} else if (typeof data === "object") {
  const row = document.createElement("tr");

  // Format the transaction_date
  const date = new Date(data.date_acquired);
  const formattedDate = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
  
  row.innerHTML = `
        <td>${data.cost_basis}</td>
        <td>${formattedDate}</td>
        <td>${data.id}</td>
        <td>${data.quantity}</td>
        <td>${data.symbol}</td>
      `;
      positionsDataContainer.appendChild(row);
  }
}

let dataY = []

let myChart = new Chart(popIvChart, {
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

let myChart2 = new Chart(bidAskChart, {
  type: 'bar',
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

let myChart3 = new Chart(highLowChart, {
  type: 'bar',
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

function updateChartWithData(newDataArray) {

  console.log('newDataArray -> ', newDataArray)

  const labelsX = newDataArray.map((dataObj) => dataObj.strike); // Use 'time' field from newDataArray as labels

  
  dataY = {
    labels: labelsX,
    datasets: [{
      label: 'Probability of profit (POP) %',
      data: [],
      fill: false,
      borderColor: 'green',
      pointRadius: 0,
      tension: 0.25
    },{
      label: 'Implied volitility (IV) %',
      data: [],
      fill: false,
      borderColor: 'red',
      pointRadius: 0,
      tension: 0.25
    }]
  };

  dataY2 = {
    labels: labelsX,
    datasets: [{
      label: 'Bid $',
      data: [],
      // fill: false,
      backgroundColor: 'green',
      //borderColor: 'green',
      //borderWidth: 1,
      // borderColor: 'rgb(237,168,57)',
      // pointRadius: 0,
      // tension: 0.25
    },{
      label: 'Ask $',
      data: [],
      // fill: false,
      backgroundColor: 'red',
      //borderColor: 'red',
      //borderWidth: 1,
      // borderColor: 'rgb(254,211,211)',
      // pointRadius: 0,
      // tension: 0.25
    }]
  };

  dataY3 = {
    labels: labelsX,
    datasets: [{
      label: 'Open $',
      data: [],
      backgroundColor: 'black',
    },{
      label: 'High $',
      data: [],
      backgroundColor: 'green',
    },{
      label: 'Low $',
      data: [],
      backgroundColor: 'red',
    },{
      label: 'Close $',
      data: [],
      backgroundColor: 'white',
    }]
  };

  var pos = $(document).scrollTop();
  if (myChart != undefined)
  myChart.destroy();

  myChart = new Chart(popIvChart, {
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

  myChart2 = new Chart(bidAskChart, {
    type: 'bar',
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

  myChart3 = new Chart(highLowChart, {
    type: 'bar',
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

  // Update 'pop' dataset data
  const currentPopData = newDataArray
    .map((dataObj) => dataObj.pop)
    .filter((value) => typeof value === 'number')
    .map((value) => value * 100); // Multiply each value by 100
  myChart.data.datasets[0].data = currentPopData;

  // Update 'iv' dataset data
  const currentIvData = newDataArray
    .map((dataObj) => dataObj.iv)
    .filter((value) => typeof value === 'number')
    .map((value) => value * 100); // Multiply each value by 100
  myChart.data.datasets[1].data = currentIvData;

  // Update Chart 2 Y values
  const currentBidData = newDataArray.map((dataObj) => dataObj.bid);
  myChart2.data.datasets[0].data = currentBidData;

  const currentAskData = newDataArray.map((dataObj) => dataObj.ask);
  myChart2.data.datasets[1].data = currentAskData;

  // Update Chart 3 Y values
  const currentOpenData = newDataArray.map((dataObj) => dataObj.open);
  myChart3.data.datasets[0].data = currentOpenData;

  const currentHighData = newDataArray.map((dataObj) => dataObj.high);
  myChart3.data.datasets[1].data = currentHighData;

  const currentLowData = newDataArray.map((dataObj) => dataObj.low);
  myChart3.data.datasets[2].data = currentLowData;

  const currentCloseData = newDataArray.map((dataObj) => dataObj.close);
  myChart3.data.datasets[3].data = currentCloseData;

  myChart.update();
  myChart2.update();
  myChart3.update();
}

// Function to display the success message box
function showSuccessMessage(successMessages) {
  const successMessageDiv = document.getElementById('successMessage');
  const successText = document.getElementById('successText');
  successText.innerHTML = ''; // Clear any previous success messages

  successMessages.forEach((successMessage) => {
    const successItem = document.createElement('div');
    successItem.textContent = successMessage;
    successText.appendChild(successItem);
  });

  successMessageDiv.style.display = 'block';
}

// Function to display the success message box
function showPositionsMessage(orderMessages) {
  const orderMessageDiv = document.getElementById('positionsSuccessMessage');
  const orderText = document.getElementById('positionsSuccessText');
  orderText.innerHTML = ''; // Clear any previous error messages

  orderMessages.forEach((orderMessage) => {
    const orderItem = document.createElement('div');
    orderItem.textContent = orderMessage;
    orderText.appendChild(orderItem);
  });

  orderMessageDiv.style.display = 'block';
}

// Function to hide the order message box
function hidePositionsMessage() {
  const orderMessage = document.getElementById("positionsSuccessMessage");
  orderMessage.style.display = "none";
}


document.addEventListener('DOMContentLoaded', function () {
  const table = document.getElementById('data-table');
  let lastClickTime = 0;
  let rowDataJson = '';

  table.addEventListener('click', function (event) {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 400) {
      // Double click detected
      const clickedRow = event.target.closest('tr');
      if (clickedRow) {
        const cells = clickedRow.getElementsByTagName('td');
        
        // Create an object to store captured data
        const rowData = {
          bid: cells[0].textContent,
          ask: cells[1].textContent,
          strike: cells[2].textContent,
          description: cells[3].textContent,
          symbol: cells[4].textContent,
          mark: (((parseFloat(cells[0].textContent) + parseFloat(cells[1].textContent)) / 2).toFixed(2)).toString()
        };

        // Convert the object to a JSON string for passing as a query parameter
        rowDataJson = encodeURIComponent(JSON.stringify(rowData));

        // Show the modal
        $('#tradeModal').modal('show');
      }
    }
    lastClickTime = currentTime;
  });
  // Handle button clicks in the modal
  document.getElementById('manualTradeButton').addEventListener('click', function () {
    window.location.href = `Opentrades.html?data=${rowDataJson}`;
  });

  document.getElementById('algoTradeButton').addEventListener('click', function () {
    window.location.href = `Automate.html?data=${rowDataJson}`;
  });
});

// Function to display the error message box
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





