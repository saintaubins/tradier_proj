//const backEndUrl = 'http://127.0.0.1:5001/';
const backEndUrl = 'https://tradier-app-b7ceb132d0e1.herokuapp.com/';

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



// Function to get the date of the next Friday from today
function getNextFriday() {
  let today = new Date();
  let dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  let daysUntilFriday = 5 - dayOfWeek; // Number of days until Friday (Friday is the 6th day of the week)

  let nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  console.log('nextFriday -> ', nextFriday)
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

  // Example usage
const currentPrice = 100; // Current stock price
const strikePrice = 105; // Option strike price
const impliedVolatility = 0.2; // Implied volatility (as a decimal)
const daysToExpiration = 30; // Days until option expiration

let pop = calculatePOPCall(currentPrice, strikePrice, impliedVolatility, daysToExpiration);
console.log(`Probability of Profit (POP) for the call option: ${pop * 100}%`);

  // Loop through the option objects and create table rows
  data.forEach((option) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${option.bid}</td>
      <td>${option.ask}</td>
      <td>${option.strike}</td>
      <td>${pop * 100}</td>
      <td>${option.description}</td>
      <td>${option.symbol}</td>
      <td>${option.expiration_date}</td>
    `;
    optionsDataContainer.appendChild(row);
  });

}

// Function to calculate Probability of Profit (POP) for a call option
function calculatePOPCall(currentPrice, strikePrice, impliedVolatility, daysToExpiration) {
  // Constants
  const annualTradingDays = 252; // Typical number of trading days in a year

  // Calculate d1 and d2
  const d1 = (Math.log(currentPrice / strikePrice) + ((annualTradingDays / 2) * Math.pow(impliedVolatility, 2)) * (daysToExpiration / annualTradingDays)) / (impliedVolatility * Math.sqrt(daysToExpiration / annualTradingDays));
  const d2 = d1 - (impliedVolatility * Math.sqrt(daysToExpiration / annualTradingDays));

  // Calculate the cumulative distribution function (CDF) using a standard normal distribution table or library
  // Here, we'll use the cumulativeProbability function as a placeholder; you should replace this with a proper implementation.
  const cdf = cumulativeProbability(d1);

  // Calculate and return POP
  const pop = 1 - cdf;

  return pop;
}

function cumulativeProbability(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d1 = 0.319381530 * Math.exp(-z * z / 2);
  const d2 = -0.356563782 * Math.exp(-z * z / 2);
  const d3 = 1.781477937 + 0.356563782 * Math.exp(-z * z / 2);
  const d4 = 1.821255978 + 0.319381530 * Math.exp(-z * z / 2);

  const N = 1 - (1 / Math.sqrt(2 * Math.PI)) * d1 * t -
    (1 / (Math.sqrt(2 * Math.PI))) * d2 * t * t * t -
    (1 / (Math.sqrt(2 * Math.PI))) * d3 * t * t * t * t * t +
    (1 / (Math.sqrt(2 * Math.PI))) * d4 * t * t * t * t * t * t;

  if (z < 0) {
    return 1 - N;
  }
  
  return N;
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
          ask: cells[0].textContent,
          bid: cells[1].textContent,
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





