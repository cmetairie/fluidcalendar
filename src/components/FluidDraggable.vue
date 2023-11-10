<template>
  <div class="t__fluid__calendar__draggable" :style="stl" :class="clss">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'FluidDraggable',
  props: {
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    ghost: {
      type: Boolean,
      default: false,
    },
  },
  //   emits: ['increment', 'position'],
  //   data() {},
  //   watch: {},
  computed: {
    stl() {
      const stl = []
      stl.push({ transform: `translate(${this.x}px, ${this.y}px)` })
      return stl
    },
    clss() {
      const clss = []
      if (this.ghost) clss.push('--ghost')
      return clss
    },
  },
  methods: {},
}
</script>
