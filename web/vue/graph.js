Vue.component("Graph", {
  template: `
    <div class="graph-container col">
      <div id="graph">{{text}}</div>
    </div>`,
  props: [],
  data() {
    return {
      text: "graph here",
    };
  },
  mounted() {
    console.log("fetch information");
  },
});
