const backEndUrl = 'http://127.0.0.1:5001/';

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
      const symbol = document.getElementById("symbol").value;
      const expDate = document.getElementById("expDate").value;
      const optionSymbol = document.getElementById("optionSymbol").value;
      const qty = document.getElementById("qty").value;
      const sideSelect = document.getElementById("sideSelect").value;
      const typeSelect = document.getElementById("typeSelect").value;
      const durationSelect = document.getElementById("durationSelect").value;
      const price = document.getElementById("price").value;
      const stop = document.getElementById("stop").value;
  
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
  const symbol = document.getElementById("symbol").value.trim();
  const expDate = document.getElementById("expDate").value.trim();
  const optionSymbol = document.getElementById("optionSymbol").value.trim();
  const qty = document.getElementById("qty").value.trim();
  const sideSelect = document.getElementById("sideSelect").value.trim();
  const typeSelect = document.getElementById("typeSelect").value.trim();
  const durationSelect = document.getElementById("durationSelect").value.trim();
  const price = document.getElementById("price").value.trim();
  const stop = document.getElementById("stop").value.trim();

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
    document.getElementById('optionSymbol').value = rowData.symbol;
    document.getElementById('price').value = rowData.mark;
    // ... populate other form fields
  }
});