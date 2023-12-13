<template>
  <div class="t__fluid__pinch" ref="pinchTarget" @wheel="handlePinch">
    <!-- {{ zoom }} -->
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
    min: {
      type: Number,
      default: 0.5,
    },
    max: {
      type: Number,
      default: 10,
    },
  },
  methods: {
    handlePinch(event) {
      event.preventDefault()
      if (event.ctrlKey) {
        const mouseX = event.clientX
        const mouseY = event.clientY
        this.inc = this.zoom / 15
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
