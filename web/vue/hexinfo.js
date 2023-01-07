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
  },
  template: `
  <div>
    <div class="results" v-if="!hex.loading">
      <CollapsableList
        itemType="Product" 
        title="Products" 
        :results="hex.products"
        @modal="openModal" />
      <CollapsableList
        itemType="Client" 
        title="Clients" 
        :results="hex.clients" 
        @modal="openModal"/>
      <ProductModal v-if="show.Product" :info="show.info" @close="show.Product = false"/>
      <ClientModal v-if="show.Client" :info="show.info" @close="show.Client = false"/>
    </div>
    <div class="center" v-else>
      <img class="loading" src="loading.gif" alt="...Loading..."/>
    </div>
  </div>`,
});
