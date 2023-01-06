import "./map.js";
import "./modal.js";
import "./hexinfo.js";
import "./graph.js";
import "./form.js";
import "./collapsable.js";

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
      hexagons: [],
      actionType: "init",
    };
  },
  methods: {
    onHexClick(hexData) {
      this.actionType = "hex";
      this.$refs.form.hexPicked();
      this.getMostProduct(hexData.id);

      console.log(this.actionType);
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
      this.getMostProduct(hexData.id);
      this.$refs.form.hexPicked();
    },
    openModal(itemType, values) {
      this.results.info = values;
      this.results.modalShow = true;
    },
    async getMostProduct(hexId) {
      const hstr = this.hexIdToString(hexId);
      const products = await (await fetch(`/most/${hstr}`)).json();
      this.results.products = products;
      this.hexagons = [hexId];
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
            @submit="onFormSubmit"/>
          <div v-if="actionType=='name'"
            class="results-container">
            <div class="results">
              <CollapsableList
                itemType="Product" 
                title="Products" 
                :results="results.products"
                @modal="openModal" />
              <ProductModal v-if="results.modalShow" :info="info" @close="results.modalShow = false"/>
            </div>
          </div>
          <HexInfo 
            v-else-if="actionType=='hex'"
            class="results-container"
            :hex="hexagons"/>
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
