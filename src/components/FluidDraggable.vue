<template>
  <div class="t__fluid__calendar__draggable" :style="stl">
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
  },
  methods: {},
}
</script>
