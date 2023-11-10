<template>
  <div class="t__fluid__pinch" ref="pinchTarget" @wheel="handlePinch">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'FluidPinch',
  emits: ['pinch'],
  data() {
    return {
      inc: 0.1,
    }
  },
  props: {
    zoom: {
      type: Number,
    },
  },
  computed: {},
  methods: {
    handlePinch(event) {
      if (event.ctrlKey) {
        const mouseX = event.clientX
        const mouseY = event.clientY
        if (event.deltaY > 0) {
          this.$emit('pinch', {
            zoom: this.zoom - this.inc,
            x: mouseX,
            y: mouseY,
          })
        } else {
          this.$emit('pinch', {
            zoom: this.zoom + this.inc,
            x: mouseX,
            y: mouseY,
          })
        }
      }
    },
  },
}
</script>
