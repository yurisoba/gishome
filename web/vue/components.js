import "./map.js";
import "./modal.js";
import "./hexinfo.js";
import "./graph.js";
import "./form.js";
import "./collapsable.js";
import "./charts.js";

Vue.component("Info", {
  name: "info",
  data() {
    return {
      picked_view: "map_view",
      results: {
        products: [],
        modalShow: false,
        info: {},
      },
      hexResults: {
        loading: false,
        products: [],
        clients: [],
        stats: [],
      },
      hexagons: [],
      actionType: "init",
    };
  },
  methods: {
    onPicked(picked) {
      this.actionType = picked;
    },
    onFormSubmit(formData) {
      this.actionType = formData.picked;
      switch (formData.picked) {
        case "id":
          this.findProductHex(formData.productId);
          break;

        default:
          this.findProduct(formData.productName);
          break;
      }
    },
    hexIdToString(hexId) {
      return hexId ? "85" + hexId.toString(16) : "";
    },
    onHexClick(hexData) {
      this.hexagons = [hexData.id];
      this.$refs.form.hexPicked();
      this.hexResults.loading = true;
      this.getMostProduct(hexData.id);
    },
    openModal(itemType, values) {
      this.results.info = values;
      this.results.modalShow = true;
    },
    showHeatMap(values) {
      this.getHeatMap(values.id);
    },
    async getHeatMap(values) {
      let p_id = values.id;
      const hexagons = await (await fetch(`/heatmap/${p_id}`)).json();
      console.log("heatmap", hexagons);
      // if (hexagons) {
      //   this.hexagons = hexagons;
      // }
    },
    async getMostProduct(hexId) {
      this.hexagons = [hexId];

      let h = this.hexIdToString(hexId);
      const products = await (await fetch(`/most/${h}`)).json();
      const stats = await (await fetch(`/stats/${h}`)).json();
      const clients = await (await fetch(`/loyal/${h}`)).json();

      this.hexResults = {
        loading: false,
        products,
        stats,
        clients,
      };
    },
    async findProduct(p_name) {
      const products = await (await fetch(`/product/${p_name}`)).json();
      this.results.products = products;
    },
    async findProductHex(p_id) {
      const hexagons = await (await fetch(`/hex/${p_id}`)).json();
      this.hexagons = hexagons;
      this.results.products = [];
    },
  },
  template: `
  <div>
    <header>
      <h1>Círculo de Hadas App</h1>
      <div class="views">
        <input type="radio" id="map_view" value="map_view" v-model="picked_view" />
        <label for="map_view" :class="picked_view=='map_view'?'active':''">Map View</label>
        <input type="radio" id="graph_view" value="graph_view" v-model="picked_view" />
        <label for="graph_view" :class="picked_view=='graph_view'?'active':''">Graph View</label>
      </div>
    </header>
    <div v-if="picked_view=='map_view'" class="main-map-view-container">
      <Map @hexClick="onHexClick" :hexagons="hexagons"/>
      <div class="info-container col">
        <div class="information">
          <Form 
            class="form-container"
            ref="form"
            :form_values="results"
            @picked="onPicked" 
            @submit="onFormSubmit"/>
          <div v-if="actionType =='name'"
            class="results-container">
            <div class="results">
              <CollapsableList
                class="only"
                itemType="Product" 
                title="Products" 
                :results="results.products"
                @heatmap="getHeatMap"
                @modal="openModal" />
              <ProductModal v-if="results.modalShow" :info="results.info" @close="results.modalShow = false"/>
            </div>
          </div>
          <HexInfo 
            v-else-if="actionType =='hex'"
            class="results-container"
            :hex="this.hexResults"
            @heatmap="getHeatMap"/>
        </div>
      </div>
    </div>
    <div v-else class="main-graph-view-container">
     <Graph/>
    </div>
  </div>
 `,
});

// attach to index.html
new Vue({
  el: "#app_component",
});
