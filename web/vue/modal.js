Vue.component("ProductModal", {
  template: `
    <Modal @close="$emit('close')">
        <h3 slot="header">{{name}}</h3>
    </Modal>`,
  props: ["info"],
  data() {
    return {
      text: "text here",
    };
  },
  computed: {
    name() {
      return this.info.name || "Unlabeled";
    },
  },
  mounted() {
    console.log("fetch information");
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
