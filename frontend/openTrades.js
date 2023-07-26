
// Handle button click event
document.getElementById("openTradesButton").addEventListener("click", function() {
    fetchDataAndPopulateTable();
  });



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
    data.forEach((order) => {
      const row = document.createElement("tr");
  
      row.innerHTML = `
      <td>${order.symbol}</td>
      <td>${order.option_symbol}</td>
      <td>${order.transaction_date}</td>
      <td>${order.side}</td>
      <td>${order.status}</td>
    `;
  
      ordersDataContainer.appendChild(row);
    });
  }
  
  // Function to fetch data from the '/getorders' endpoint and populate the table
  function fetchDataAndPopulateTable() {
    // Make a fetch API call to the '/getorders' endpoint
    fetch('http://127.0.0.1:5000/getorders') // Replace with your actual server endpoint
      .then(response => response.json())
      .then(data => {
        // If data is successfully fetched, populate the table with it
        populateTable(data.message.orders.order);
      })
      .catch(error => {
        console.error('Error occurred while fetching data:', error);
      });
  }
  
  // Call the function to fetch and populate the table with data from the '/getorders' endpoint
  //fetchDataAndPopulateTable();
  