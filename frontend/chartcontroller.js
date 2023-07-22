
  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Import the necessary scripts in your HTML file
// Make sure to include chart.js, chartjs-adapter-date-fns, and chartjs-plugin-annotation

const stockChartCanvas = document.getElementById('stockChart');

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      type: 'line',
      label: 'Stock',
      data: [
        { t: '2022-01-01', o: 100, h: 150, l: 90, c: 120 },
        { t: '2022-02-01', o: 120, h: 160, l: 100, c: 140 },
        { t: '2022-03-01', o: 140, h: 180, l: 110, c: 160 },
        { t: '2022-04-01', o: 130, h: 170, l: 100, c: 150 },
        { t: '2022-05-01', o: 150, h: 190, l: 120, c: 180 },
      ],
    },
  ],
};

//Chart.register(ChartFinancials);
//Chart.register(AnnotationPlugin);

new Chart(stockChartCanvas, {
  type: 'line',
  data: chartData,
  options: {
    plugins: {
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            mode: 'horizontal',
            yMin: 150,
            yMax: 150,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: 'Threshold',
              position: 'right',
              backgroundColor: 'red',
              font: {
                size: 12,
              },
            },
          },
        },
      },
    },
  },
});
