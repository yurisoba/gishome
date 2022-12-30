import "./map.js";
import "./form.js";

Vue.component("Info", {
  name: "info",
  data() {
    return {
      product: {},
      hexagon: {},
    };
  },
  methods: {
    onFormSubmit(formData) {
      switch (formData.picked) {
        case "id":
          this.findProductHex(formData.productId);
          break;

        default:
          this.findProduct(formData.productName);
          break;
      }
    },
    onHexClick(hexData) {
      this.getMostProduct(hexData.id);
    },
    async getMostProduct(hexId) {
      const product = await (await fetch(`/most/${hexId}`)).json();
      this.product = product;
    },
    async findProduct(p_name) {
      const product = await (await fetch(`/product/${p_name}`)).json();
      this.product = product;
    },
    async findProductHex(p_id) {
      const hexagon = await (await fetch(`/hex/${p_id}`)).json();
      this.hexagon = hexagon;
      this.product = { ...this.product, hex: hexagon };
    },
  },
  template: `
  <div class="main-container">
    <Map @hexClick="onHexClick"/>
    <div class="info-container col">
      <div class="information">
        <Form v-bind:form_values="product" @submit="onFormSubmit"/>
        <Results v-bind:results_prop="product"/>
      </div>
    </div>
</div>
 `,
});

Vue.component("Results", {
  props: ["results_prop"],
  template: `<div class="results">
  <ul>
    <li v-for="(value, key, i) in results_prop"  v-bind:key="i">
      <b>{{ key }}:</b> {{ value }}
    </li>
  </ul>
  </div>`,
});

// attach to index.html
new Vue({
  el: "#app_component",
});
