Vue.component("Form", {
  props: ["form_values"],
  data() {
    return {
      picked: "name",
      productName: this.form_values.name || "",
      productId: this.form_values.id || "",
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
    productId(value) {
      this.productId = value;
      this.msg["productId"] = "";
      if (isNaN(value) && !value.match(/[0-9A-Fa-f]{6}/g)) {
        this.msg["productId"] = "Please enter a valid product Id";
      }
    },
  },
  methods: {
    formSubmit(event) {
      this.$emit("submit", { ...this.$data });
    },
  },
  template: `<div><form class="input-form col"  @submit.prevent="formSubmit">
    <div class="options">
      <input type="radio" id="name" value="name" v-model="picked" />
      <label for="name" :class="picked=='name'?'active':''">Product Name</label>
      <input type="radio" id="id" value="id" v-model="picked" />
      <label for="id" :class="picked=='id'?'active':''">Product Id</label>
    </div>

    <div class="field" v-if="picked=='name'">
      <input type="text" v-model="productName" required>
      <span class="warning" v-if="msg.productName">{{msg.productName}}</span>
    </div>

    <div class="field" v-if="picked=='id'">
      <input type="text" v-model="productId" required>
      <span class="warning" v-if="msg.productId">{{msg.productId}}</span>
    </div>
</form></div>`,
});
