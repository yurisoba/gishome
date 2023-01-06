Vue.component("Form", {
  data() {
    return {
      picked: "name",
      productName: "",
      msg: {},
    };
  },
  watch: {
    productName(value) {
      this.productName = value;
      this.msg["productName"] = "";
      if (!value) {
        this.msg["productName"] = "Please enter a product name";
      }
    },
  },
  methods: {
    formSubmit(event) {
      this.$emit("submit", { ...this.$data });
    },
    hexPicked() {
      this.picked = "hex";
    },
  },
  template: `
  <div>
    <form class="input-form col"  @submit.prevent="formSubmit">
    <div class="options">
      <input type="radio" id="name" value="name" v-model="picked" />
      <label for="name" :class="picked=='name'?'active':''">Product Name</label>
      <input type="radio" id="hex" value="hex" v-model="picked" disabled=true/>
      <label for="hex" :class="picked=='hex'?'active':''">Hexagon</label>
    </div>

    <div class="field" v-if="picked=='name'">
      <input type="text" v-model="productName" required>
      <span class="warning" v-if="msg.productName">{{msg.productName}}</span>
    </div>
  </form>
</div>`,
});
