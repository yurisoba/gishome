Vue.component("ProductModal", {
  template: `
    <Modal @close="$emit('close')">
        <h3 slot="header">{{name}}</h3>
        <div slot="body">
          <Chart 
            v-if="time" 
            title="Time" 
            chartType="line"
            :chartId="pId + 'time'" 
            :info="time"/>
          <div v-else>
            <span>No available data 😭</span>
          </div>
        </div>
    </Modal>`,
  props: ["info"],
  data() {
    return {
      time: [],
    };
  },
  computed: {
    pId() {
      return this.info.id || false;
    },
    name() {
      return this.info.name || "Unlabeled";
    },
  },
  mounted() {
    if (this.pId) {
      this.fetchInfo();
    }
  },
  methods: {
    async fetchInfo() {
      const time = await (await fetch(`/time/product/${this.pId}`)).json();
      this.time = time.array || [];
    },
  },
});

Vue.component("ClientModal", {
  template: `
    <Modal @close="$emit('close')">
        <h3 slot="header">{{name}}</h3>
        <div slot="body">
          <Chart 
            v-if="time" 
            title="Time" 
            chartType="line"
            :chartId="cId + 'time'" 
            :info="time"/>
          <Chart 
            v-if="categories" 
            title="Categories" 
            chartType="pie"
            :chartId="cId + 'categories'" 
            :info="categories"/>
          <Chart 
            v-if="suppliers" 
            title="Suppliers" 
            chartType="pie"
            :chartId="cId + 'supplier'" 
            :info="suppliers"/>
          <div v-if="!time && !suppliers && !categories">
            <span>No available data 😭</span>
          </div>
        </div>
    </Modal>`,
  props: ["info"],
  data() {
    return {
      categories: [],
      suppliers: [],
      time: [],
    };
  },
  computed: {
    cId() {
      return this.info.customer_id || false;
    },
    name() {
      return this.info.customer_id || "Unlabeled";
    },
  },
  mounted() {
    if (this.cId) {
      this.fetchInfo();
    }
  },
  methods: {
    async fetchInfo() {
      const categories = await (await fetch(`/categories/${this.cId}`)).json();
      const suppliers = await (await fetch(`/suppliers/${this.cId}`)).json();
      const time = await (await fetch(`/time/customer/${this.cId}`)).json();

      this.categories = categories.array || [];
      this.suppliers = suppliers.array || [];
      this.time = time.array || [];
    },
  },
});

Vue.component("ListWrapper", {
  props: ["info", "title"],
  template: `
  <div class="list-wrapper">
    <h4 v-if="title">{{title}}</h4>
    <ul class="list-wrapper-container">
      <li class="list-item-wrapper" v-for="(values, i) in info" :key="i">
        <DetailList :info="values"/>
      </li>
    </ul>
  </div>`,
});

Vue.component("DetailList", {
  props: ["info"],
  template: `
  <ul class="info detail-list-container">
    <li class="data" v-for="(val, key, i) in info" :key="i">
      <b>{{ key }}:</b> {{ val }}
    </li>
  </ul>`,
});

Vue.component("Modal", {
  template: `
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header">
              default header
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              default footer
              <button class="modal-default-button" @click="$emit('close')">
                CLOSE
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>`,
});
