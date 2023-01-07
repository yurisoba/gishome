import "./map.js";
import "./modal.js";
import "./hexinfo.js";
import "./form.js";
import "./collapsable.js";
import "./charts.js";

Vue.component("Info", {
  name: "info",
  data() {
    return {
      graph_container: document.getElementById("cy_container"),
      actionType: "init",
      picked_view: "map_view",
      results: {
        products: [],
        modalShow: false,
        info: {},
      },
      hexResults: {
        loading: false,
        suppliers: [],
        products: [],
        clients: [],
        stats: [],
      },
      // these two values will be sent to the map automatically when updated
      hexagons: [],
      mapProps: {},
    };
  },
  watch: {
    picked_view(nVal) {
      if (nVal == "map_view") {
        this.graph_container.classList.add("hide");
      } else {
        this.graph_container.classList.remove("hide");
      }
    },
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
    hexIdToInt(hexId) {
      return Number("0x" + hexId.substr(2));
    },
    onHexClick(hexData) {
      this.hexagons = [hexData.id];
      this.$refs.form.hexPicked();
      this.hexResults.loading = true;
      this.getHexData(hexData.id);
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
      const data = await (await fetch(`/heatmap/${p_id}`)).json();
      console.log("from components.js, getHeatMap", data);
      let sum = 0;
      data.forEach((obj) => {
          sum += obj.count;
      });
      const nv = {
          array: [],
          is_heatmap: true,
      };
      data.forEach((obj) => {
          nv.array.push({hex: obj.hex, value: obj.count/sum});
      });

      // these two values will be sent to the map automatically when updated
      this.hexagons = nv;
      this.mapProps = data;
    },
    async getHexData(hexId) {
      this.hexagons = [hexId];

      let h = this.hexIdToString(hexId);
      const products = await (await fetch(`/most/${h}`)).json();
      const suppliers = await (await fetch(`/mostsupply/${h}`)).json();
      const stats = await (await fetch(`/stats/${h}`)).json();
      const clients = await (await fetch(`/loyal/${h}`)).json();

      this.hexResults = {
        loading: false,
        suppliers,
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
    <div v-show="picked_view=='map_view'" class="main-map-view-container">
      <Map 
        @hexClick="onHexClick" 
        :hexagons="hexagons"
        :info="mapProps"/>
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
  </div>
 `,
});

// attach to index.html
new Vue({
  el: "#app_component",
});
