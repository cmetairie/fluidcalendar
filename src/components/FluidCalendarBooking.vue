<template>
  <div class="t__fluid__calendar__booking" :style="stl" :class="clss">
    <!-- <button>m</button> -->
    <div class="t__fluid__calendar__booking__inner">
      <!-- {{ $slots.bookable }} -->
      <slot v-if="!ghost" />
      <!-- <span class="t__fluid__calendar__booking__label">
        <span>{{ format(booking.start_at) }}</span>
        <span>{{ format(booking.end_at) }}</span>
      </span> -->
    </div>
    <button
      class="t__fluid__calendar__booking__resize"
      @mousedown.stop="startSize"
    >
      <!-- {{ diff }} -->
    </button>
  </div>
</template>

<script>
import { dayjs } from '../dayjs.js'
export default {
  name: 'FluidCalendarBooking',
  props: {
    booking: {
      type: Object,
    },
    widthByMinute: {
      type: Number,
      default: 0,
    },
    rowHeight: {
      type: Number,
      default: 0,
    },
    collisions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      baseX: 0,
      diff: 0,
    }
  },
  computed: {
    clss() {
      const clss = []
      if (this.collisions.includes(this.booking.id)) clss.push('--collision')
      if (this.booking.ghost) clss.push('--ghost')
      return clss
    },
    stl() {
      const stl = []
      stl.push({ width: this.width - 4 + 'px' })
      stl.push({ height: this.rowHeight - 4 + 'px' })
      return stl
    },
    width() {
      const diff = dayjs(this.booking.end_at).diff(
        dayjs(this.booking.start_at),
        'minute',
      )
      return diff * this.widthByMinute + this.diff
    },
    ghost() {
      return this.booking.ghost
    },
  },
  methods: {
    format(date) {
      return dayjs(date).format('DD MMM')
    },
    click() {
      console.log('Click', this.booking)
    },
    startSize(event) {
      this.baseX = event.clientX
      document.addEventListener('mousemove', this.size)
      document.addEventListener('mouseup', this.endSize)
    },
    size(event) {
      this.diff = event.clientX - this.baseX
    },
    endSize(event) {
      this.baseX = event.clientX
      document.removeEventListener('mousemove', this.size)
      document.removeEventListener('mouseup', this.endSize)
    },
  },
}
</script>
