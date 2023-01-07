Vue.component("CollapsableList", {
  props: ["itemType", "title", "results"],
  data() {
    return {
      expanded: -1,
    };
  },
  methods: {
    onToogle(num) {
      this.expanded = this.expanded == num ? -1 : num;
    },
  },
  template: `
  <div class="collapse-list-container">
    <div class="collapse-list-header" >
      <h4>{{title}}</h4>
    </div>

    <div class="collapse-list-results">
      <div class="center" v-if="results.length == 0">
        <span>200 No results 🙃</span>
      </div>
      <div v-else class="result-list collapse-list">
        <component :is="itemType"
          v-for="(values, i) in results"
          :key="i"
          :num="++i"
          :info="values" 
          :collapsed="expanded !== i"
          @toogle="onToogle"
          @heatmap="$emit('heatmap', values)"
          @openDetail="$emit('modal', itemType, values)"/>
      </div>
    </div>
  </div>`,
});

Vue.component("Product", {
  props: ["collapsed", "info", "num"],
  computed: {
    title() {
      return this.info.name;
    },
  },
  methods: {
    onToogle() {
      this.$emit("toogle", this.num);
      this.$emit("heatmap", this.info);
    },
  },
  template: `
  <Collapsable :collapsed="collapsed" @toogle="onToogle">
      <div class="item" slot="header">
        <div class="key">
          <span class="number">{{num}}</span>
        </div>
        <div class="title">
          <h4>{{title}}</h4>
        </div>
      </div>
      <div class="body-wrapper" slot="body">
        <span v-if="info.id" 
          class="modal-trigger" 
          @click="$emit('openDetail', info)">
          Open details
        </span>
        <div class="info">
          <span class="data" v-for="(val, key, j) in this.info" :key="j">
            <b>{{ key }}:</b> {{ val }}
          </span>
        </div>
      </div>
  </Collapsable>`,
});

Vue.component("Client", {
  props: ["collapsed", "info", "num"],
  computed: {
    title() {
      return this.info.customer_id;
    },
  },
  template: `
  <Collapsable :collapsed="collapsed" @toogle="$emit('toogle', num)">
      <div class="item" slot="header">
        <div class="key">
          <span class="number">{{num}}</span>
        </div>
        <div class="title">
          <h4>{{title}}</h4>
        </div>
      </div>
      <div class="body-wrapper" slot="body">
        <span class="modal-trigger" @click="$emit('openDetail', info)">Open details</span>
        <DetailList :info="this.info"/>
      </div>
  </Collapsable>`,
});

Vue.component("Supplier", {
  props: ["collapsed", "info", "num"],
  computed: {
    title() {
      return this.info.name;
    },
  },
  template: `
  <Collapsable :collapsed="collapsed" @toogle="$emit('toogle', num)">
      <div class="item" slot="header">
        <div class="key">
          <span class="number">{{num}}</span>
        </div>
        <div class="title">
          <h4>{{title}}</h4>
        </div>
      </div>
      <div class="body-wrapper" slot="body">
        <div class="info">
          <span class="data" v-for="(val, key, j) in this.info" :key="j">
            <b>{{ key }}:</b> {{ val }}
          </span>
        </div>
      </div>
  </Collapsable>`,
});

Vue.component("Collapsable", {
  props: ["collapsed"],
  computed: {
    state() {
      return this.collapsed ? "collapsed" : "expanded";
    },
  },
  template: `
  <div class="collapse-container">
    <div class="collapse-header" >
      <div class="collapse-h-slot">
        <slot name="header">
          default header
        </slot>
      </div>
      <div class="icon" @click="$emit('toogle')">
        <span v-if="!collapsed">△</span>
        <span v-else>▽</span>
      </div>
    </div>

    <div :class="['collapse-body', state]">
      <slot name="body">
        default body
      </slot>
    </div>
  </div>`,
});
