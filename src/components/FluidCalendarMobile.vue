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
      <div class="t__fluid__calendar__mobile__header__date">
        <button
          @click="prev"
          class="t__fluid__calendar__mobile__header__nav --prev"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span>{{ date }}</span>
        <button
          @click="next"
          class="t__fluid__calendar__mobile__header__nav --next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chevron-right"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
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
    <main
      class="t__fluid__calendar__mobile__main"
      ref="main"
      @touchstart.prevent="touchStart"
    >
      <FluidCalendarMobileBooking
        v-for="booking of visibleBookings"
        :booking="booking"
        :heightByMinute="heightByMinute"
      >
        <slot v-if="$slots.booking" name="booking" :booking="booking" />
        <span class="t__fluid__calendar__booking__label" v-else>
          {{ booking.id }} {{ booking.label }}
        </span>
      </FluidCalendarMobileBooking>
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
            :class="{ '--day': cell.time === '00:00' }"
          >
            <span v-if="cell.time === '00:00'">{{ cell.short }}</span>
            <span v-else>{{ cell.time }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { dayjs } from '../dayjs.js'
import gsap from 'gsap'
import FluidCalendarMobileBooking from './FluidCalendarMobileBooking.vue'
export default {
  name: 'FluidCalendarMobile',
  components: { FluidCalendarMobileBooking },
  data() {
    return {
      touchPoint: null,
      touchListener: null,
      touchDiff: 0,
      touchScroll: null,
      pincher: null,
      _bookings: [],
      _bookables: [],
      pY: 0,
      zoom: 0.75,
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
  watch: {
    zoom(v, o) {
      const oldWidthByMinute = o / 10
      const nextWidthByMinute = v / 10
      const p = this.pincher.y - this.$refs.main.getBoundingClientRect().top
      const oldDecal = (this.pY - p) / oldWidthByMinute
      const nextDecal = (this.pY - p) / nextWidthByMinute
      this.scroll({ y: (nextDecal - oldDecal) * nextWidthByMinute })
    },
  },
  computed: {
    visibleBookings() {
      if (!this._bookings) return []
      return this._bookings.filter((f) => {
        if (dayjs(f.start_at).isAfter(dayjs(this.rY.end))) return false
        if (dayjs(f.end_at).isBefore(dayjs(this.rY.start))) return false
        return f.bookableId === this.selectedBookable.id
        // const visibleBookables = this.rY.rows.map((m) => m.id)
        // return visibleBookables.includes(f.bookableId)
      })
    },
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
    prev() {
      const value = this.heightByMinute * 60 * 24
      const interpolation = { value: this.pY }
      this.touchScroll = gsap.to(interpolation, {
        value: this.pY + value,
        onUpdate: () => {
          this.pY = interpolation.value
        },
        duration: 0.5,
      })
    },
    next() {
      const value = this.heightByMinute * 60 * 24
      const interpolation = { value: this.pY }
      this.touchScroll = gsap.to(interpolation, {
        value: this.pY - value,
        onUpdate: () => {
          this.pY = interpolation.value
        },
        duration: 0.5,
      })
    },
    touchStart(event) {
      if (this.touchScroll) this.touchScroll.kill()

      this.touchPoint = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }

      document.addEventListener('touchmove', this.touchMove)
      document.addEventListener('touchend', this.touchEnd)
      //   const data = this.pointToData(this.point)
      //   this.point.data = data
    },
    touchMove(event) {
      this.touchDiff = this.touchPoint.y - event.touches[0].clientY
      this.scroll({ y: this.touchDiff })
      this.touchPoint = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    },
    touchEnd(event) {
      const interpolation = { value: this.pY }
      this.touchScroll = gsap.to(interpolation, {
        value: this.pY - this.touchDiff * 20,
        onUpdate: () => {
          this.pY = interpolation.value
        },
        duration: 0.5 + Math.abs(this.touchDiff) / 50,
      })
      document.removeEventListener('touchmove', this.touchMove)
      document.removeEventListener('touchend', this.touchEnd)
    },
    pinch(p) {
      if (p.zoom > 0.25 && p.zoom < 10) {
        this.pincher = p
        this.zoom = p.zoom
      }
    },
    scroll({ y }) {
      if (y != undefined) {
        this.pY = this.pY - y
      }
    },
  },
}
</script>
