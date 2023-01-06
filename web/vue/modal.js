Vue.component("ProductModal", {
  template: `
    <Modal @close="$emit('close')">
        <h3 slot="header">{{name}}</h3>
        <div slot="body">
          <div v-if="time">
            {{time}}
          </div>
          <div v-else>
            <span>No available data 😭</span>
          </div>
        </div>
    </Modal>`,
  props: ["info"],
  data() {
    return {
      time: {},
    };
  },
  computed: {
    name() {
      return this.info.name || "Unlabeled";
    },
  },
  mounted() {
    if (this.info.id) {
      this.fetchInfo();
    }
  },
  methods: {
    async fetchInfo() {
      this.time = await (await fetch(`/time/product/${this.info.id}`)).json();
    },
  },
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
