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
    borderColor: 'rgb(75, 192, 192)',
    borderJoinStyle: 'round',
    pointRadius: 0,
    tension: 0.25
  },{
    label: 'EMA Short',
    data: [15, 40, 78, 30, 67, 95, 54, 45, 87, 21, 34, 56],
    fill: false,
    borderColor: 'rgb(75, 111, 50)',
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
