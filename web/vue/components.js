import "./map.js";
import "./modal.js";
import "./graph.js";
import "./form.js";

Vue.component("Info", {
  name: "info",
  data() {
    return {
      picked_view: "map_view",
      product: [],
      hexagons: [],
      actionType: "init",
    };
  },
  methods: {
    onHexClick(hexData) {
      this.getMostProduct(hexData.id);
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
    async getMostProduct(hexId) {
      const hstr = "85" + hexId.toString(16);
      const product = await (await fetch(`/most/${hstr}`)).json();
      this.product = product;
      this.hexagons = [hexId];
    },
    async findProduct(p_name) {
      const product = await (await fetch(`/product/${p_name}`)).json();
      this.product = product;
    },
    async findProductHex(p_id) {
      const hexagons = await (await fetch(`/hex/${p_id}`)).json();
      this.hexagons = hexagons;
      this.product = [];
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
      <Map @hexClick="onHexClick" v-bind:hexagons="hexagons"/>
      <div class="info-container col">
        <div class="information">
          <Form v-bind:form_values="product" @submit="onFormSubmit"/>
          <Results v-bind:results_prop="product" v-bind:actionType="actionType" v-bind:hexagons="hexagons"/>
        </div>
      </div>
    </div>
    <div v-else class="main-graph-view-container">
     <Graph/>
    </div>
  </div>
 `,
});

Vue.component("Results", {
  props: ["results_prop", "hexagons", "actionType"],
  data() {
    return {
      show: false,
      info: {},
    };
  },
  methods: {
    openModal(productValues) {
      this.info = productValues;
      this.show = true;
    },
  },
  template: `<div class="results">
    <ul class="result-list" v-if="results_prop.length > 0">
      <li class="item" v-for="(values, i) in results_prop"  v-bind:key="i" @click="openModal(values)">
        <div class="key"><span class="number">{{++i}}</span></div>
        <div class="info">
          <span class="data" v-for="(val, key, j) in values" v-bind:key="j">
            <b>{{ key }}:</b> {{ val }}
          </span>
        </div>
      </li>
    </ul>
    <div class="center" v-else-if="actionType=='name'">
      <span>200 No results 🙃</span>
    </div>
    <div class="center" v-else-if="actionType=='id' && hexagons.length == 0">
      <span>404 Id not found 😭</span>
    </div>
    <ProductModal v-if="show" :info="info" @close="show = false"/>
  </div>`,
});

// attach to index.html
new Vue({
  el: "#app_component",
});
