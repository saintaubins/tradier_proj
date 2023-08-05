
const backEndUrl = 'http://127.0.0.1:5001/';

// Handle button click events
document.getElementById("openTradesButton").addEventListener("click", function() {
    fetchDataAndPopulateTable();
  });

document.getElementById("placeOrderButton").addEventListener("click", function() {
  placeOrder();
  });

document.getElementById("modifyOrderButton").addEventListener("click", function() {
    //console.log('button clicked');
    modifyOrder();
  });

document.getElementById("modalYesButton").addEventListener("click", function() {
  const getUrl = placeOrder();
  sendOrder(getUrl);
  });

document.getElementById("modalNoButton").addEventListener("click", function() {
  console.log(' no button clicked');
  });

document.getElementById("modalModifyYesButton").addEventListener("click", function() {
  const getUrl = modifyOrder();
  sendModifyOrder(getUrl);
  });

document.getElementById("modalModifyNoButton").addEventListener("click", function() {
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
    const openModalButton = document.getElementById('placeOrderButton');
    openModalButton.addEventListener('click', openModalWithData);  
});

document.addEventListener('DOMContentLoaded', function () {
  // Function to open the modal with data
  function modifyModalWithData() {
    const orderId = document.getElementById("orderId").value;
    const type = document.getElementById("type").value;
    const duration = document.getElementById("duration").value;
    const modifyPrice = document.getElementById("modifyPrice").value;
    const modifyStop = document.getElementById("modifyStop").value;

    // Set the values in the modal
    document.getElementById("modalOrderId").textContent = orderId;
    document.getElementById("modalModifyType").textContent = type;
    document.getElementById("modalModifyDuration").textContent = duration;
    document.getElementById("modalModifyPrice").textContent = modifyPrice;
    document.getElementById("modalModifyStop").textContent = modifyStop;

    // Open the modal
    $('#modifyModal').modal('show');
  }
  
    // Add an event listener to the button to trigger the modal with data
    const modifyModalButton = document.getElementById('modifyOrderButton');
    modifyModalButton.addEventListener('click', modifyModalWithData);  
});

function placeOrder() {
  const symbol = document.getElementById("symbol").value.trim();
  const expDate = document.getElementById("expDate").value.trim();
  const optionSymbol = document.getElementById("optionSymbol").value.trim();
  const qty = document.getElementById("qty").value.trim();
  const sideSelect = document.getElementById("sideSelect").value.trim();
  const typeSelect = document.getElementById("typeSelect").value.trim();
  const durationSelect = document.getElementById("durationSelect").value.trim();
  const price = document.getElementById("price").value.trim();
  const stop = document.getElementById("stop").value.trim();

  const placeOrderUrl = `${backEndUrl}placeoptionorder?symbol=${symbol}&expDate=${expDate}&optionSymbol=${optionSymbol}&qty=${qty}&sideSelect=${sideSelect}&typeSelect=${typeSelect}&durationSelect=${durationSelect}&price=${price}&stop=${stop}`;

  console.log(placeOrderUrl)
  return placeOrderUrl
}

function modifyOrder() {
  const orderId = document.getElementById("orderId").value.trim();
  const type = document.getElementById("type").value.trim();
  const duration = document.getElementById("duration").value.trim();
  const modifyPrice = document.getElementById("modifyPrice").value.trim();
  const modifyStop = document.getElementById("modifyStop").value.trim();

  const modifyOrderUrl = `${backEndUrl}modifyorder?orderId=${orderId}&type=${type}&duration=${duration}&modifyPrice=${modifyPrice}&modifyStop=${modifyStop}`;

  console.log(modifyOrderUrl)
  return modifyOrderUrl
}

function setCurrentTrade(optionSymbol, qty) {
  let currentTrade = {
    'optionSymbol': optionSymbol,
    'qyt': qty,
    'side': 'sellToClose',
    'type':'market',
    'duration': 'gtc'
  };
  return currentTrade;
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

function sendModifyOrder(Url) {
  // Send the POST request
  fetch(Url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
      console.log('data -> ', data.message)
      // Process the data returned by the server, if needed
      if (data.message == null) {
        showModifyErrorMessage(['response from server is null']);
        setTimeout(hideModifyErrorMessage, 15000);

      } else if (data.message.errors) {
        showModifyErrorMessage(data.message.errors.error);
        setTimeout(hideModifyErrorMessage, 15000);

      } else if (data.message.exception) {
        showModifyErrorMessage(data.message.exception);
        setTimeout(hideModifyErrorMessage, 15000);

      } else if (data.message.success) {
        showModifyOrderMessage(data.message.success);
        setTimeout(hideModifyOrderMessage, 15000);
      }
    })
    .catch((error) => {
      console.error("Error occurred while making the request:", error);
    });
}

// Function to clear the table data
function clearTableData() {
    const ordersDataContainer = document.getElementById("ordersData");
  
    // Remove existing rows from the table
    while (ordersDataContainer.firstChild) {
      ordersDataContainer.removeChild(ordersDataContainer.firstChild);
    }
  }
  
  // Function to populate the table with new orders data
  function populateTable(data) {
    const ordersDataContainer = document.getElementById("ordersData");
  
    // Call the function to clear the table before populating it with new data
    clearTableData();
  
    // Loop through the order objects and create table rows
    console.log('data -> ', data)
    if (Array.isArray(data)) {
      data.forEach((order) => {
        const row = document.createElement("tr");

        // Format the transaction_date
        const date = new Date(order.transaction_date);
        const formattedDate = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
        row.innerHTML = `
        <td>${order.option_symbol}</td>
        <td>${formattedDate}</td>
        <td>${order.quantity}</td>
        <td>${order.type}</td>
        <td>${order.price}</td>
        <td>${order.last_fill_price}</td>
        <td>${order.id}</td>
        <td>${order.side}</td>
        <td>${order.status}</td>
        <td>${order.reason_description}</td>
      `;

      // Create a button to close the order
      if (order.status === "filled" || order.status === "pending") {
        const closeButtonCell = document.createElement("td");
        const closeButton = document.createElement("button");
        closeButton.textContent = "X";
        closeButton.classList.add("closeOrderButton"); // Add a class to the button
        closeButton.addEventListener("click", () => {
          closeOrder(order.id); // Call the closeOrder function with the order ID when the button is clicked
        });
        closeButtonCell.appendChild(closeButton);
        row.appendChild(closeButtonCell);
      }

      ordersDataContainer.appendChild(row);
      });
    } else if (typeof data === "object") {

      const row = document.createElement("tr");

      const symbolCell = document.createElement("td");
      symbolCell.textContent = data.symbol;
      row.appendChild(symbolCell);

      const optionSymbolCell = document.createElement("td");
      optionSymbolCell.textContent = data.option_symbol;
      row.appendChild(optionSymbolCell);

      const transactionDateCell = document.createElement("td");
      transactionDateCell.textContent = data.transaction_date;
      row.appendChild(transactionDateCell);

      const idCell = document.createElement("td");
      idCell.textContent = data.id;
      row.appendChild(idCell);

      const sideCell = document.createElement("td");
      sideCell.textContent = data.side;
      row.appendChild(sideCell);

      const statusCell = document.createElement("td");
      statusCell.textContent = data.status;
      row.appendChild(statusCell);

    }
  }

  // Function to close a filled order
  function closeOrder(orderId) {
    //fetch(`http://127.0.0.1:5000/cancelorder?order_id=${orderId}`, {
    fetch(`${backEndUrl}cancelorder?order_id=${orderId}`, {
      //method: 'DELETE',
      headers: {
        'Content-Type': 'application/json', // Add any other headers if needed
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('data.message -> ', data.message.response_text)
        if (data.message && data.message.response_text === "order already in finalized state: filled") {
          // Show a message to the user that the order is already filled and cannot be closed
          alert("This order is already filled and cannot be closed.");
        } else {
          // Refresh the table after successfully closing the order
          alert('Order successfully closed.');
          fetchDataAndPopulateTable();
        }
      })
      .catch((error) => {
        console.error("Error occurred while closing the order:", error);
      });
  }

  // Function to fetch data from the '/getorders' endpoint and populate the table
  function fetchDataAndPopulateTable() {
    fetch(`${backEndUrl}getorders`) // Replace with your actual server endpoint
      .then(response => response.json())
      .then(data => {
        //console.log('data.message.orders -> ', data.message.orders)
        if (data.message.orders == 'null') {
          showSuccessMessage();
          setTimeout(hideSuccessMessage, 5000);
        } else {
        // If data is successfully fetched, populate the table with it
        populateTable(data.message.orders.order);
        }
      })
      .catch(error => {
        console.error('Error occurred while fetching data:', error);
      });
  }
  
  // Function to display the success message box
  function showSuccessMessage() {
    const successMessage = document.getElementById("successMessage");
    successMessage.style.display = "block";
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

  // Function to display the success message box
  function showModifyOrderMessage(orderMessages) {
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

  // Function to display the error message box
  function showModifyErrorMessage(errorMessages) {
    const errorMessageDiv = document.getElementById('modifyErrorMessage');
    const errorText = document.getElementById('modifyErrorText');
    errorText.innerHTML = ''; // Clear any previous error messages
  
    errorMessages.forEach((errorMessage) => {
      const errorItem = document.createElement('div');
      errorItem.textContent = errorMessage;
      errorText.appendChild(errorItem);
    });
  
    errorMessageDiv.style.display = 'block';
  }

  // Function to hide the error message box
  function hideModifyErrorMessage() {
    const successMessage = document.getElementById("modifyErrorMessage");
    successMessage.style.display = "none";
  }

  // Function to hide the success message box
  function hideSuccessMessage() {
    const successMessage = document.getElementById("successMessage");
    successMessage.style.display = "none";
  }

  // Function to hide the order message box
  function hideOrderMessage() {
    const orderMessage = document.getElementById("orderMessage");
    orderMessage.style.display = "none";
  }

  // Function to hide the order message box
  function hideModifyOrderMessage() {
    const orderMessage = document.getElementById("modifyOrderMessage");
    orderMessage.style.display = "none";
  }
  