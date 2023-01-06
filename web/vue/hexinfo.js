Vue.component("HexInfo", {
  props: ["hex"],
  data() {
    return {
      show: {
        Product: false,
        Client: false,
        info: {},
      },
      stats: [],
      loyal: [],
    };
  },
  computed: {
    hexId() {
      return this.hex[0] ? "85" + this.hex[0].toString(16) : "";
    },
  },
  mounted() {
    if (this.hex.length > 0) {
      this.fetchInfo();
    }
  },
  methods: {
    async fetchInfo() {
      const stats = await (await fetch(`/stats/${this.hexId}`)).json();
      const loyal = await (await fetch(`/loyal/${this.hexId}`)).json();
    },
    openModal(itemType, values) {
      this.show.info = values;
      this.show[itemType] = true;
    },
  },
  template: `
  <div>
    <div class="results">
      <CollapsableList
        itemType="Product" 
        title="Products" 
        :results="stats"
        @modal="openModal" />
      <CollapsableList
        itemType="Client" 
        title="Clients" 
        :results="stats" />
      <ProductModal v-if="show.Product" :info="show.info" @close="show.Product = false"/>
    </div>
  </div>`,
});
