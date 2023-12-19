<template>
  <div class="t__fluid__viewbar" :class="clss">
    <div class="t__fluid__viewbar__date">
      <!-- {{ pointerDate }} -->
    </div>
    <slot />
  </div>
</template>

<script>
import { dayjs } from '../dayjs.js'
export default {
  name: 'FluidViewbar',
  props: {
    date: {
      type: String,
    },
    rangeX: {
      type: Object,
    },
    rangeY: {
      type: Object,
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    pointerDate() {
      return dayjs(this.date).format('time')
      return dayjs(this.date).format()
    },
    clss() {
      const clss = []
      if (this.debug) clss.push('--debug')
      return clss
    },
  },
  methods: {},
}
</script>
