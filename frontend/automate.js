//const backEndUrl = 'http://127.0.0.1:5001/';
const backEndUrl = 'https://tradier-app-b7ceb132d0e1.herokuapp.com/';

//const socket = io('http://127.0.0.1:5001/');

document.getElementById("algoOrderButton").addEventListener("click", function() {
    console.log('algoOrderButton clicked')
    //isAlgoOrder = true;
    placeAlgoOrder();
});

document.getElementById("modalYesButton").addEventListener("click", function() {
    //console.log(' yes button clicked');
    //const getUrl = placeOrder();
    const getAlgoUrl = placeAlgoOrder();
    sendOrder(getAlgoUrl);
});

document.getElementById("modalNoButton").addEventListener("click", function() {
    console.log(' no button clicked');
});

document.addEventListener('DOMContentLoaded', function () {
    // Function to open the modal with data
    function openModalWithData() {
      const symbol = document.getElementById("symbol0").value;
      const expDate = document.getElementById("expDate0").value;
      const optionSymbol = document.getElementById("optionSymbol0").value;
      const qty = document.getElementById("qty0").value;
      const sideSelect = document.getElementById("sideSelect0").value;
      const typeSelect = document.getElementById("typeSelect0").value;
      const durationSelect = document.getElementById("durationSelect0").value;
      const price = document.getElementById("price0").value;
      const stop = document.getElementById("stop0").value;
  
      // Set the values in the modal
      document.getElementById("modalSymbol").textContent = symbol;
      document.getElementById("modalExpDate").textContent = expDate;
      document.getElementById("modalOptionSymbol").textContent = optionSymbol;
      document.getElementById("modalQty").textContent = qty;
      document.getElementById("modalSide").textContent = sideSelect;
      document.getElementById("modalType").textContent = typeSelect;
      document.getElementById("modalDuration").textContent = durationSelect;
      document.getElementById("modalPrice").textContent = price;
      document.getElementById("modalStop").textContent = stop;
  
      // Open the modal
      $('#myModal').modal('show');
    }
  
    // Add an event listener to the button to trigger the modal with data
    const algoModalButton = document.getElementById('algoOrderButton');
    algoModalButton.addEventListener('click', openModalWithData);
     
});

function placeAlgoOrder() {
  //console.log('isAlgoOrder:', isAlgoOrder)
  const symbol = document.getElementById("symbol0").value.trim();
  const expDate = document.getElementById("expDate0").value.trim();
  const optionSymbol = document.getElementById("optionSymbol0").value.trim();
  const qty = document.getElementById("qty0").value.trim();
  const sideSelect = document.getElementById("sideSelect0").value.trim();
  const typeSelect = document.getElementById("typeSelect0").value.trim();
  const durationSelect = document.getElementById("durationSelect0").value.trim();
  const price = document.getElementById("price0").value.trim();
  const stop = document.getElementById("stop0").value.trim();

  const placeAlgoOrderUrl = `${backEndUrl}placealgoorder?symbol=${symbol}&expDate=${expDate}&optionSymbol=${optionSymbol}&qty=${qty}&sideSelect=${sideSelect}&typeSelect=${typeSelect}&durationSelect=${durationSelect}&price=${price}&stop=${stop}`;

  console.log(placeAlgoOrderUrl)
  return placeAlgoOrderUrl
}

function sendOrder(Url) {
    // Send the POST request
    fetch(Url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
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
        }
      })
      .catch((error) => {
        console.error("Error occurred while making the request:", error);
      });
}

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

// Function to display the success message box
function showOrderMessage(orderMessages) {
    const orderMessageDiv = document.getElementById('orderMessage');
    const orderText = document.getElementById('orderText');
    orderText.innerHTML = ''; // Clear any previous error messages
  
    orderMessages.forEach((orderMessage) => {
      const orderItem = document.createElement('div');
      orderItem.textContent = orderMessage;
      orderText.appendChild(orderItem);
    });
  
    orderMessageDiv.style.display = 'block';
  }

// Function to hide the order message box
function hideOrderMessage() {
    const orderMessage = document.getElementById("orderMessage");
    orderMessage.style.display = "none";
  }

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('algoTradeContainer');

  // Retrieve query parameter from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const rowDataJson = urlParams.get('data');

  if (rowDataJson) {
    // Parse the JSON and populate the form fields
    const rowData = JSON.parse(decodeURIComponent(rowDataJson));
    console.log('rowData -> ', rowData)
    // Populate form fields using the rowData object
    document.getElementById('optionSymbol0').value = rowData.symbol;
    document.getElementById('price0').value = rowData.mark;
    // ... populate other form fields
  }
});

const algo = document.getElementById('algoChart');

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

new Chart(algo, {
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

///////////////////socket connection code //////////////////////////////

// const eventSource = new EventSource(`${backEndUrl}events`);

// eventSource.onopen = function(event) {
//     console.log('Connection opened');
// };

// eventSource.onmessage = function(event) {
//     console.log('Received data:', event.data);
//     document.getElementById('message').innerHTML = event.data;
// };

// eventSource.onerror = function(event) {
//     console.error('Error occurred:', event);
// };
