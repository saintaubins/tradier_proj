//const backEndUrl = 'http://127.0.0.1:5001/';
const backEndUrl = 'https://tradier-app-b7ceb132d0e1.herokuapp.com/';


document.getElementById("algoOrderButton").addEventListener("click", function() {
    console.log('algoOrderButton clicked')
    //isAlgoOrder = true;
    placeAlgoOrder();
});

let orderInfoRes = []
let loopTheTrend = []
let afterTrade = {}
let currTrade = {}
let encodedData = {}
let monitorTradeUrl = ''
document.getElementById("modalYesButton").addEventListener("click", function() {
      const getAlgoUrl = placeAlgoOrder();

      sendOrder(getAlgoUrl)
      .then((data) => {
        if (data.message.success){
          console.log('data -> ', data)
          orderInfoRes = data.message.success[0];
          loopTheTrend = data.message.success[1][1];
          currTrade = data.message.success[2][1];
          //console.log('currTrade -> ', currTrade)
          encodedData = encodedData = encodeURIComponent(JSON.stringify(currTrade));
          
          console.log('encodedData ', encodedData)
        }
      }).then(() => {
        monitorTradeUrl = `${backEndUrl}figure_it_out?loopTheTrend=${loopTheTrend}&currentTrade=${encodedData}`;
        console.log('monitorTradeUrl:', monitorTradeUrl)
        //afterTrade = monitorTrade(monitorTradeUrl);
      }).then(() => {
        //afterTrade = monitorTrade(monitorTradeUrl);
        const promise1 = monitorTrade(monitorTradeUrl);

        // console.log('afterTrade -> ', afterTrade)
        // if (afterTrade.message.res.success) {
        //   showAfterOrderMessage([`${afterTrade.message.res.success}`]);
        // } else {
        //   showAfterOrderMessage([`${afterTrade.message.res.exception}`]);
        // }
        Promise.all([promise1])
        .then(([afterTrade]) => {
          console.log('afterTrade -> ', afterTrade);
          if (afterTrade.message) {
            showAfterOrderMessage([`${afterTrade.message.m}`, `${afterTrade.message.res}`]);
          } else {
            showAfterOrderMessage([`${afterTrade.message}`]);
          }
        })
        .catch((error) => {
          // Handle any errors that might occur during the promise execution
          console.error('An error occurred in the promise:', error);
        });
      })
     .catch((error) => {
      showErrorMessage([`${error}`]);
      console.error('An error occurred:', error);
     }); 

});

//let monitorTradeUrl = `${backEndUrl}figure_it_out?loopTheTrend=${loopTheTrend}&currentTrade=${currentTrade}`;

function monitorTrade(monitorTradeUrl) {
  return new Promise((resolve, reject) => {
    // Send the POST request
    fetch(monitorTradeUrl, {mode: 'cors'})
      .then((response) => {
          if (!response.ok) {
              console.log('response -> ', response);
              throw new Error("Network response was not ok");
          }
          return response.json(); // Parse the response as JSON
      })
      .then((data) => {
          console.log('**********************************')
          console.log('data -> ', data)
          // Process the data returned by the server, if needed
          //console.log('data -> ', data['error from current_trade'])
          if (data['error from current_trade']) {
              showErrorMessage([data['error from current_trade']]);
              setTimeout(hideErrorMessage, 15000);
           } else if (data.message == null) {
              showErrorMessage(['Did not set monitoring for the trade.']);
              setTimeout(hideErrorMessage, 15000);
          } //else if (data.message.success) {
          //     showOrderMessage(data.message.success);
          //     setTimeout(hideOrderMessage, 15000);
          // }
          
          resolve(data); // Resolve the promise with the data
      })
      .catch((error) => {
          console.error("Error occurred while making the request:", error);
          showErrorMessage(['Error occurred while making the request:', `${error}`]);
          //setTimeout(hideErrorMessage, 15000);
          reject(error); // Reject the promise with the error
      });
  });
}

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
    
  return new Promise((resolve, reject) => {
    // Send the POST request
    fetch(Url, {
      mode: 'cors'
    })
      .then((response) => {
          if (!response.ok) {
              console.log('response -> ', response);
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
          console.log('data stuff -> ', data)
          resolve(data); // Resolve the promise with the data
      })
      .catch((error) => {
          console.error("Error occurred while making the request:", error);
          reject(error); // Reject the promise with the error
      });
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

// Function to display the success message box
function showAfterOrderMessage(orderMessages) {
  const orderMessageDiv = document.getElementById('afterOrderMessage');
  const orderText = document.getElementById('afterOrderText');
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
//console.log('sharedData ->', sharedData)
const algo = document.getElementById('algoChart');

let labelsX = []
let priceData = []
let dataY = {}

let monitorChart = new Chart(algo, {
  type: 'line',
  data: dataY,
  options: {
    scales: {
      x: {
        ticks: {
          maxTicksLimit: labelsX.length // Display all ticks
        }
      },
      y: {
        beginAtZero: false
      }
    }
  }
});


function updateChart(newInfo) {
  sharedData = newInfo;
  console.log('sharedData updateChart function ->', sharedData)
 
  if(Array.isArray(sharedData.curr_price)) {
    // Extract prices from your data array
    priceData = sharedData.data_array.map(dataPoint => dataPoint.price);
    labelsX = sharedData.data_array.map(label => label.time);

  } else {
    labelsX = []
  }

  dataY = {
    labels: labelsX,
    datasets: [{
      label: 'Current price',
      data: priceData,
      fill: false,
      borderColor: 'rgb(123,104,238)',
      // borderJoinStyle: 'round',
      pointRadius: 0,
      tension: 0.25
    },{
      label: 'EMA Short',
      data: sharedData.ema1,
      fill: false,
      borderColor: 'rgb(255, 255, 0)',
      // borderJoinStyle: 'round',
      pointRadius: 0,
      tension: 0.25
    },{
      label: 'EMA Long',
      data: sharedData.ema7,
      fill: false,
      borderColor: 'rgb(23, 192, 2)',
      // borderJoinStyle: 'round',
      pointRadius: 0,
      tension: 0.25
    }]
  };

  monitorChart.destroy();
  monitorChart = new Chart(algo, {
    type: 'line',
    data: dataY,
    options: {
      scales: {
        x: {
          ticks: {
            maxTicksLimit: labelsX.length // Display all ticks
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
  monitorChart.update();
  //algo.update()
}

