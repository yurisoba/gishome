Vue.component("HexInfo", {
  props: ["hex"],
  data() {
    return {
      show: {
        Product: false,
        Client: false,
        info: {},
      },
    };
  },
  methods: {
    openModal(itemType, values) {
      this.show.info = values;
      this.show[itemType] = true;
    },
    onHeatMap(values) {
      this.$emit("heatmap", values);
    },
  },
  template: `
  <div>
    <div class="results" v-if="!hex.loading">
      <CollapsableList
        itemType="Client" 
        title="Clients" 
        :results="hex.clients" 
        @modal="openModal"/>
      <CollapsableList
        itemType="Supplier" 
        title="Suppliers" 
        :results="hex.suppliers"/>
      <CollapsableList
        itemType="Product" 
        title="Top Products" 
        :results="hex.stats"
        @heatmap="onHeatMap"
        @modal="openModal" />
      <CollapsableList
        itemType="Product" 
        title="All Products" 
        :results="hex.products"
        @heatmap="onHeatMap"
        @modal="openModal" />
      <ProductModal v-if="show.Product" :info="show.info" @close="show.Product = false"/>
      <ClientModal v-if="show.Client" :info="show.info" @close="show.Client = false"/>
    </div>
    <div class="center" v-else>
      <img class="loading" src="loading.gif" alt="...Loading..."/>
    </div>
  </div>`,
});
