Vue.component("Chart", {
  props: ["info", "title", "chartId", "chartType"],
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(this.drawChart);
  },
  methods: {
    drawChart() {
      // Define the chart to be drawn.
      var data = new google.visualization.DataTable();
      data.addColumn("string", "name");
      data.addColumn("number", "count");

      let chartData = this.info.map((x) => [x["name"], x["count"]]);
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
