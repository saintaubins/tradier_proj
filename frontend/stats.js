const backEndUrl = "http://127.0.0.1:5001/"

const viewButton = document.getElementById('viewButton');
const tableBody = document.getElementById('statsData');

  // Event listener for the "View" button
  viewButton.addEventListener('click', async () => {
    try {

      fetchDataAndPopulateTable();
      
    } catch (error) {
      console.error('Error occurred:', error);
    }
  });

  async function fetchDataAndPopulateTable() {
    try {
      const response = await fetch(`${backEndUrl}gainloss`);
      const data = await response.json();

      const gainLossData = data.message.gainloss.closed_position;

      // Clear existing table rows
      tableBody.innerHTML = '';

      // Populate the table with the received data
      gainLossData.forEach((entry) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${entry.close_date}</td>
          <td>${entry.cost}</td>
          <td>${entry.gain_loss}</td>
          <td>${entry.gain_loss_percent}</td>
          <td>${entry.open_date}</td>
          <td>${entry.proceeds}</td>
          <td>${entry.quantity}</td>
          <td>${entry.symbol}</td>
          <td>${entry.term}</td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error occurred while fetching gainloss data:', error);
    }
  }

  
