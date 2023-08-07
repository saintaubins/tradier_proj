const backEndUrl = 'http://127.0.0.1:5001/';

document.getElementById("viewPositionsButton").addEventListener("click", function() {
  console.log('Button clicked')
  fetchPositions();
  //placeAlgoOrder();
});

function fetchPositions() {
  const positionsUrl = `${backEndUrl}getpositions`

  fetch(positionsUrl)
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

const ema = document.getElementById('emaChart');

const labelsX = [
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
  'December'
];

const dataY = {
  labels: labelsX,
  datasets: [{
    label: 'Current price',
    data: [65, 59, 80, 81, 56, 55, 40, 11, 80, 34, 34, 76],
    fill: false,
    borderColor: 'rgb(123,104,238)',
    borderJoinStyle: 'round',
    pointRadius: 0,
    tension: 0.25
  },{
    label: 'EMA Short',
    data: [15, 40, 78, 30, 67, 95, 54, 45, 87, 21, 34, 56],
    fill: false,
    borderColor: 'rgb(255, 255, 0)',
    borderJoinStyle: 'round',
    pointRadius: 0,
    tension: 0.25
  },{
    label: 'EMA Long',
    data: [78, 56, 34, 45, 23, 87, 90, 34, 44, 22, 67, 23],
    fill: false,
    borderColor: 'rgb(23, 192, 2)',
    borderJoinStyle: 'round',
    pointRadius: 0,
    tension: 0.25
  }]
};

new Chart(ema, {
  type: 'line',
  data: dataY,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Function to get the date of the next Friday from today
function getNextFriday() {
  let today = new Date();
  let dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  let daysUntilFriday = 5 - dayOfWeek; // Number of days until Friday (Friday is the 6th day of the week)

  let nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);

  return nextFriday;
}

// Function to format the date as 'YYYY-MM-DD'
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

// Get the next Friday date
let nextFriday = getNextFriday();

// Format the date as 'YYYY-MM-DD'
let formattedDate = formatDate(nextFriday);


// Add an event listener to the button when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {

  const viewButton = document.getElementById("viewButton");

  viewButton.addEventListener("click", function() {
  
  let selectedOption = document.getElementById('optionTypeSelect').value;

  let symbol = document.getElementById('symbolInput').value;
  if (symbol === '') {
    symbol = 'TSLA';
  }
  let expDate = document.getElementById('expDateInput').value;
  if (expDate === '') {
    expDate = formattedDate;
  }

  const url = `${backEndUrl}optionschain?symbol=${symbol}&exp_dt=${expDate}&optionType=${selectedOption}`;

  console.log("url -> ",url)
    // Making the GET request using fetch
    fetch(url)
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

  // Loop through the option objects and create table rows
  data.forEach((option) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${option.ask}</td>
      <td>${option.bid}</td>
      <td>${option.strike}</td>
      <td>${option.description}</td>
      <td>${option.symbol}</td>
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







