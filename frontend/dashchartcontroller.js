

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

  const url = `http://127.0.0.1:5001/optionschain?symbol=${symbol}&exp_dt=${expDate}&optionType=${selectedOption}`;

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







