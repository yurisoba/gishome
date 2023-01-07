Vue.component("Graph", {
  template: `
    <div class="graph-container col">
      <div id="graph_cy"></div>
    </div>`,
  props: [],
  data() {
    return {
      cy: null,
    };
  },
  mounted() {
    // this.cy = cytoscape({
    //   container: document.getElementById("graph_cy"),
    // });
    // this.getGrahp();
  },
  methods: {
    async getGrahp() {
      // const data = await (await fetch(`/graph/`)).json();
      const data = [
        { group: "nodes", data: { id: "n0" }, position: { x: 100, y: 100 } },
        { group: "nodes", data: { id: "n1" }, position: { x: 200, y: 200 } },
        { group: "edges", data: { id: "e0", source: "n0", target: "n1" } },
      ];

      this.cy.add(data);
    },
  },
});
