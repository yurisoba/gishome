Vue.component("Chart", {
  props: ["info", "title", "chartId", "chartType", "cols"],
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    info() {
      google.setOnLoadCallback(this.drawChart);
    },
  },
  mounted() {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(this.drawChart);
  },
  methods: {
    getChartData() {
      let data = this.info.map((x) => {
        let d = [];
        Object.keys(this.cols).forEach((key) => {
          d.push(x[key]);
        });
        return d;
      });
      return data;
    },
    drawChart() {
      // Define the chart to be drawn.
      var data = new google.visualization.DataTable();
      Object.entries(this.cols).forEach((entry) => {
        const [key, value] = entry;
        data.addColumn(value, key);
      });

      let chartData = this.getChartData();
      data.addRows(chartData);

      var options = null;

      switch (this.chartType) {
        case "line":
          options = {
            hAxis: {
              title: "Time",
            },
            vAxis: {
              title: "count",
            },
          };

          this.chart = new google.visualization.LineChart(
            document.getElementById(this.chartId)
          );
          break;
        default:
          this.chart = new google.visualization.PieChart(
            document.getElementById(this.chartId)
          );
          break;
      }
      this.chart.draw(data, options);
    },
  },
  template: `
  <div class="chart-wrapper">
    <h4 v-if="title">{{title}}</h4>
    <div class="chart" :id="chartId"/>
  </div>`,
});
