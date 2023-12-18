<template>
  <div
    class="t__fluid__calendar__booking --unavailability"
    :style="stl"
    :class="clss"
  >
    <!-- <button>m</button> -->
    <div ref="inner" class="t__fluid__calendar__booking__inner">
      <div
        ref="content"
        class="t__fluid__calendar__booking__content"
        :style="sltContent"
      >
        <!-- {{ $slots.bookable }} -->
        <!-- {{ refX }} -->
        <slot v-if="!ghost" />
        <!-- <span class="t__fluid__calendar__booking__label">
        <span>{{ format(booking.start_at) }}</span>
        <span>{{ format(booking.end_at) }}</span>
      </span> -->
      </div>
      <svg x="0" y="0">
        <defs>
          <pattern
            id="diagonalHatch"
            patternUnits="userSpaceOnUse"
            width="4"
            height="8"
            patternTransform="rotate(-45 2 2)"
          >
            <path d="M -1,2 l 6,0" stroke="#D0D6E3" stroke-width=".5" />
          </pattern>
        </defs>
        <rect
          x="1"
          y="1"
          :height="height"
          :width="width"
          fill="url(#diagonalHatch)"
        />
      </svg>
      <button
        class="t__fluid__calendar__booking__resize"
        @mousedown.stop="startSize"
      >
        <!-- {{ diff }} -->
      </button>
    </div>
  </div>
</template>

<script>
import { dayjs } from '../dayjs.js'
export default {
  name: 'FluidCalendarUnavail',
  props: {
    unavail: {
      type: Object,
      default: () => {},
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
    refX: {
      type: Number,
      default: 0,
    },
    ratio: {
      type: Number,
    },
  },
  data() {
    return {
      baseX: 0,
      diff: 0,
      lastDecal: 0,
    }
  },
  computed: {
    clss() {
      const clss = []
      //   if (this.collisions.includes(this.booking.id)) clss.push('--collision')
      //   if (this.booking.ghost) clss.push('--ghost')
      //   if (this.booking.ghosted) clss.push('--ghosted')
      return clss
    },
    stl() {
      const stl = []
      stl.push({ width: this.width / this.ratio - 4 + 'px' })
      stl.push({ height: this.height + 'px' })
      return stl
    },
    sltContent() {
      const stl = []
      if (this.refX && this.refX < 0) {
        const inner = this.$refs.inner?.getBoundingClientRect()
        const content = this.$refs.content?.getBoundingClientRect()
        if (inner && content) {
          const c = window.getComputedStyle(this.$refs.inner)
          const pl = Number(c.paddingLeft.split('px')[0])
          const pr = Number(c.paddingRight.split('px')[0])
          let decal = this.refX * -1
          const v = content.width + decal + pl + pr
          if (v >= inner.width) {
            decal = this.lastDecal
          }
          stl.push({ transform: `translateX(${decal}px)` })
          this.lastDecal = decal
        }
      }
      return stl
    },
    width() {
      const diff = dayjs(this.unavail.end_at).diff(
        dayjs(this.unavail.start_at),
        'minute',
      )
      return diff * this.widthByMinute + this.diff
    },
    height() {
      return this.rowHeight - 1
    },
    ghost() {
      return this.unavail.ghost
    },
  },
  methods: {
    format(date) {
      return dayjs(date).format('DD MMM')
    },
    click() {
      console.log('Click', this.unavail)
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
