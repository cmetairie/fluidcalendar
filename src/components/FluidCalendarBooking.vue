<template>
  <div class="t__fluid__calendar__booking" :style="stl" :class="clss">
    <div class="t__fluid__calendar__booking__inner">
      <slot />
      <!-- <span class="t__fluid__calendar__booking__label">
        <span>{{ format(booking.start_at) }}</span>
        <span>{{ format(booking.end_at) }}</span>
      </span> -->
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs/esm'
export default {
  name: 'FluidCalendarBooking',
  props: {
    booking: {
      type: Object,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
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
  computed: {
    clss() {
      const clss = []
      if (this.collisions.includes(this.booking.id)) clss.push('--collision')
      return clss
    },
    stl() {
      const stl = []
      stl.push({ transform: `translate(${this.x}px, ${this.y}px)` })
      stl.push({ width: this.width + 'px' })
      stl.push({ height: this.rowHeight + 'px' })
      return stl
    },
    width() {
      const diff = dayjs(this.booking.end_at).diff(
        dayjs(this.booking.start_at),
        'minute',
      )
      return diff * this.widthByMinute
    },
  },
  methods: {
    format(date) {
      return dayjs(date).format('DD MMM')
    },
  },
}
</script>
