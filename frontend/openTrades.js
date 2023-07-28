
const backEndUrl = 'http://127.0.0.1:5000/'

// Handle button click events
document.getElementById("openTradesButton").addEventListener("click", function() {
    fetchDataAndPopulateTable();
  });

document.getElementById("placeOrderButton").addEventListener("click", function() {
  placeOrder();
  });

document.getElementById("modalYesButton").addEventListener("click", function() {
  console.log(' yes button clicked');
  });

document.getElementById("modalNoButton").addEventListener("click", function() {
  console.log(' no button clicked');
  });

// // Add an event listener to the button to trigger the modal with data
// const openModalButton = document.querySelector('.btn-primary');
// openModalButton.addEventListener('click', openModalWithData);

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
  const openModalButton = document.querySelector('.btn-primary');
  openModalButton.addEventListener('click', openModalWithData);
});





function placeOrder() {
  const symbol = document.getElementById("symbol").value;
  const expDate = document.getElementById("expDate").value;
  const optionSymbol = document.getElementById("optionSymbol").value;
  const qty = document.getElementById("qty").value;
  const sideSelect = document.getElementById("sideSelect").value;
  const typeSelect = document.getElementById("typeSelect").value;
  const durationSelect = document.getElementById("durationSelect").value;
  const price = document.getElementById("price").value;
  const stop = document.getElementById("stop").value;

  const placeOrderUrl = `${backEndUrl}placeoptionorder?symbol=${symbol}&
                        expDate=${expDate}&optionSymbol=${optionSymbol}&
                        qty=${qty}&sideSelect=${sideSelect}&typeSelect=${typeSelect}&
                        durationSelect=${durationSelect}&price=${price}&stop=${stop}`;

  console.log(placeOrderUrl)
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
  
    // const orders = Object.values(data);
    // Loop through the order objects and create table rows
    console.log('data -> ', data)
    if (Array.isArray(data)) {
      data.forEach((order) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${order.symbol}</td>
        <td>${order.option_symbol}</td>
        <td>${order.transaction_date}</td>
        <td>${order.id}</td>
        <td>${order.side}</td>
        <td>${order.status}</td>
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
    fetch(`http://127.0.0.1:5000/cancelorder?order_id=${orderId}`, {
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
    // Make a fetch API call to the '/getorders' endpoint
    fetch('http://127.0.0.1:5000/getorders') // Replace with your actual server endpoint
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

  // Function to hide the success message box
  function hideSuccessMessage() {
    const successMessage = document.getElementById("successMessage");
    successMessage.style.display = "none";
  }
  