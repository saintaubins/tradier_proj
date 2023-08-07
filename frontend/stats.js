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

        const openDate = new Date(entry.open_date);
        //const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric' };
        const formattedOpenDate = openDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
        
        const closeDate = new Date(entry.close_date);
        const formattedCloseDate = closeDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
  

        row.innerHTML = `
          <td>${formattedCloseDate}</td>
          <td>${entry.cost}</td>
          <td>${entry.gain_loss}</td>
          <td>${entry.gain_loss_percent}</td>
          <td>${formattedOpenDate}</td>
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

  
