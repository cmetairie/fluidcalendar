<template>
  <div
    class="t__fluid__calendar__mobile"
    ref="fluidCalendar"
    :style="{ height: h + 'px' }"
  >
    <div v-if="debug" class="t__debugg">
      <pre>{{
        {
          date,
          heightByMinute,
          pY,
          dY,
          tY,
          start: rY.start,
          end: rY.end,
          diffInHours: rY.diffInHours,
        }
      }}</pre>
    </div>
    <header class="t__fluid__calendar__mobile__header">
      <div class="t__fluid__calendar__mobile__header__date">{{ date }}</div>
      <div class="t__fluid__calendar__mobile__bookables">
        <button
          v-for="bookable of bookables"
          class="t__fluid__calendar__mobile__bookable"
          :class="{ '--selected': bookable.id === selectedBookable?.id }"
          @click="selectedBookable = bookable"
        >
          {{ bookable.label }}
        </button>
      </div>
    </header>
    <main class="t__fluid__calendar__mobile__main">
      <div
        class="t__fluid__calendar__mobile__inner"
        :style="{
          height: `${height}px`,
          transform: `translateY(${tY}px)`,
        }"
      >
        <!-- <div class="t__fluid__calendar__mobile__scroller"> -->
        <div class="t__fluid__calendar__mobile__hours">
          <div
            v-for="cell of rY.cells"
            class="t__fluid__calendar__mobile__hour"
            :style="{ height: `${cellHeight}px` }"
          >
            <span>{{ cell.time }}</span>
          </div>
        </div>
        <svg
          class="t__fluid__calendar__mobile__grid"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              :width="w"
              :height="cellHeight"
              patternUnits="userSpaceOnUse"
            >
              <path
                :d="`M ${w} 0 L 0 0 0 ${cellHeight}`"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <!-- </div> -->
      </div>
    </main>
  </div>
</template>

<script>
import { dayjs } from '../dayjs.js'
export default {
  name: 'FluidCalendarMobile',
  data() {
    return {
      _bookings: [],
      _bookables: [],
      pY: 0,
      zoom: 1,
      selectedBookable: null,
    }
  },
  props: {
    bookings: {
      type: Array,
      default: () => [],
    },
    bookables: {
      type: Array,
      default: () => [],
    },
    debug: {
      type: Boolean,
      default: false,
    },
    h: {
      type: Number,
      default: 0,
    },
    w: {
      type: Number,
      default: 0,
    },
  },
  mounted() {
    this._bookings = [...this.bookings]
    this._bookables = [...this.bookables]
    this.selectedBookable = this._bookables[0]
    this.$refs.fluidCalendar.addEventListener('wheel', (e) => {
      e.preventDefault()
      const speedY = e.deltaY * 0.75
      const scroller = {}
      if (speedY) scroller.y = speedY
      this.scroll(scroller)
    })
  },
  computed: {
    rangeDays() {
      return 1
    },
    heightByMinute() {
      return this.zoom
    },
    cellHeight() {
      return this.heightByMinute * 60
    },
    height() {
      return this.cellHeight * this.rY.diffInHours
    },
    tY() {
      return this.pY - this.dY * this.t * (this.heightByMinute * 60 * 24)
    },
    dY() {
      const d = this.pY / this.heightByMinute / 60 / 24
      //   console.log('D => ', this.pY / this.heightByMinute)
      return ((d + this.t) / this.t) | 0
    },
    t() {
      return 1
    },
    date() {
      if (!this.rY) return
      const start = dayjs(this.rY.start)
      const dist = (this.tY * -1) / this.heightByMinute

      return start.add(dist, 'minute').format()
    },
    rY() {
      const start = dayjs(dayjs().startOf('day').date)
        .add(-60 * 24 * (this.rangeDays + this.dY * this.t), 'minute')
        .startOf('day')
        .format('iso')
      const end = dayjs(dayjs().startOf('day').date)
        .add(60 * 24 * (this.rangeDays - this.dY * this.t), 'minute')
        .endOf('day')
        .format('iso')
      const diffInHours = dayjs(end).diff(dayjs(start), 'hour')
      let cells = []
      for (let i = 0; i < diffInHours; i++) {
        const date = dayjs(start).add(i, 'hour').format('iso')
        const cell = {
          date: date,
          short: dayjs(start).add(i, 'hour').format(),
          time: dayjs(start).add(i, 'hour').formatTime(),
        }
        cells.push(cell)
      }
      return {
        start,
        end,
        cells: cells,
        diffInHours: diffInHours,
      }
    },
  },
  methods: {
    scroll({ y }) {
      if (y != undefined) {
        this.pY = this.pY - y
      }
    },
  },
}
</script>
