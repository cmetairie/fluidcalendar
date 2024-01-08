<template>
  <div class="t__fluid__calendar__wrapper">
    <!-- {{ zoom }} -->
    <div v-if="debug" class="t__debugg">
      <pre>{{
        {
          zoom,
          rangeDays,
          threshold,
          minutesByCell,
          scroller,
          widthByMinute,
          decalX,
          h,
          decalY,
          positionX,
          positionY,
          translateX,
          translateY,
          width,
          pointer,
          pointerDate,
          start: rangeX.start,
          end: rangeX.end,
          cellWidth,
          // rangeY,
        }
      }}</pre>
    </div>
    <!-- <button @click="centerViewTo('2024-01-20')">2023-12-20</button>
    <button @click="prev()">prev</button>
    <button @click="centerViewTo()">today</button>
    <button @click="next()">next</button> -->
    <!-- {{ dragData }} -->
    <!-- <h2>{{ format(pointerDate) }}</h2>
  <button @click="centerViewTo('2023-10-17')">2023-10-17</button>
  <button @click="generate">generate</button>
  <button @click="reset">reset</button>

  <input type="range" min="20" max="100" v-model="rowHeight" step="1" /> -->
    <!-- {{ dragData }} -->
    <!-- {{ dragData }} -->
    <!-- 
    <FluidViewbar
      :rangeX="rangeX"
      :rangeY="rangeY"
      :date="pointerDate"
      :debug="debug"
    ></FluidViewbar> -->
    <!-- <FluidViewbar
      :rangeX="rangeX"
      :rangeY="rangeY"
      :date="pointerDate"
      :debug="debug"
    ></FluidViewbar> -->
    <FluidPinch :zoom="zoom" @pinch="pinch">
      <div
        class="t__fluid__calendar"
        :style="{ height: Math.min(fullHeight, h) + 'px' }"
        ref="fluidCalendar"
        :class="{ '--debug': debug }"
      >
        <div class="t__fluid__calendar__bookables" ref="bookables">
          <div
            class="t__fluid__calendar__bookables__header"
            :style="{ height: headerHeight + 'px' }"
          >
            <span>{{ bookableType.label }}</span>
          </div>
          <div
            class="t__fluid__calendar__bookables__inner"
            :style="{
              transform: `translateY(${positionY}px) translateY(${translateY}px)`,
            }"
          >
            <div
              v-for="bookable of rangeY.rows"
              :key="bookable.id"
              :style="{ height: rowHeight + 'px' }"
              class="t__fluid__calendar__bookable"
            >
              <slot
                v-if="$slots.bookable"
                name="bookable"
                :bookable="bookable"
              />
              <span v-else>{{ bookable.label }}</span>
            </div>
          </div>
        </div>

        <FluidCalendarScroller
          y
          @position="navPosition"
          :total="fullHeight - rowHeight"
          :position="positionY"
          :height="h - rowHeight"
          :style="{ top: rowHeight + 'px' }"
        />

        <!-- <button class="t__fluid__calendar__prev" @click="prev"></button> -->
        <div class="t__fluid__calendar__content" @mousedown="mousedown">
          <!-- <span class="t__fluid__calendar__pointer"></span> -->

          <div
            class="t__fluid__calendar__canva"
            :style="{
              transform: `translateX(${translateX}px)`,
              width: width + 'px',
            }"
          >
            <span
              v-if="dragData"
              :style="{
                top: dragData.y + 'px',
                left: dragData.snapStartX + 'px',
                width: `${dragData.snapEndX - dragData.snapStartX}px`,
                height: `${rowHeight}px`,
                transform: `translateY(${positionY}px)`,
              }"
              class="t__fluid__calendar__selection"
            ></span>
            <!-- <div class="t__fluid__calendar__content__translate"> -->
            <div
              class="t__fluid__calendar__unavailabilities"
              :style="{ transform: `translateY(${positionY}px)` }"
            >
              <FluidDraggable
                v-for="unavail of unavailabilities"
                :key="unavail.id"
                :y="bookableToY(unavail, unavail.diff?.y)"
                :x="dateToX(unavail.start_at)"
                :ghost="unavail.ghost"
              >
                <FluidCalendarUnavail
                  :key="'unavailability-' + unavail.id"
                  :unavail="unavail"
                  :widthByMinute="widthByMinute"
                  :rowHeight="rowHeight"
                  :ratio="ratio"
                  :refX="translateX + dateToX(unavail.start_at)"
                >
                  <span class="t__fluid__calendar__booking__label">
                    {{ unavail.id }} {{ unavail.label }}
                  </span>
                </FluidCalendarUnavail>
              </FluidDraggable>
            </div>

            <div
              class="t__fluid__calendar__bookings"
              :style="{ transform: `translateY(${positionY}px)` }"
            >
              <FluidDraggable
                v-for="booking of visibleBookings"
                :key="booking.id"
                :y="bookableToY(booking, booking.diff?.y)"
                :x="dateToX(booking._start_at || booking.start_at)"
                :ghost="booking.ghost"
              >
                <FluidCalendarBooking
                  :booking="booking"
                  :widthByMinute="widthByMinute"
                  :rowHeight="rowHeight"
                  :collisions="collisions"
                  :width="
                    getWidth({
                      start: booking._start_at || booking.start_at,
                      end: booking._end_at || booking.end_at,
                    })
                  "
                  :slotMinTime="slotMin"
                  :slotMaxTime="slotMax"
                  :slotDuration="slotDur"
                  @resize="(size) => resizeBooking(booking, size)"
                  :ratio="ratio"
                  :refX="
                    translateX + dateToX(booking._start_at || booking.start_at)
                  "
                >
                  <slot
                    v-if="$slots.booking"
                    name="booking"
                    :booking="booking"
                  />
                  <span class="t__fluid__calendar__booking__label">
                    {{ booking.label }}
                    <!-- {{ format(booking.start_at, 'time') }}
                    {{ format(booking.end_at, 'time') }} -->
                  </span>
                </FluidCalendarBooking>
              </FluidDraggable>
            </div>

            <!-- <svg
              class="t__fluid__calendar__header__time__grid"
              xmlns="http://www.w3.org/2000/svg"
              v-if="displayHours"
              :style="{ height: headerHeight + 'px' }"
            >
              <defs>
                <pattern
                  id="header_time_grid"
                  :width="slotDurationInMinutes * widthByMinute"
                  :height="headerHeight"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    :d="`M ${
                      slotDurationInMinutes * widthByMinute
                    } ${headerHeight} L ${
                      slotDurationInMinutes * widthByMinute
                    } ${headerHeight - 6}`"
                    fill="none"
                    stroke="#aaa"
                    stroke-width="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#header_time_grid)" />
            </svg> -->
            <div
              class="t__fluid__calendar__header"
              :style="{
                width: width + 'px',
                height: headerHeight + 'px',
              }"
            >
              <svg
                class="t__fluid__calendar__header__grid"
                xmlns="http://www.w3.org/2000/svg"
                :style="{ height: headerHeight + 'px' }"
              >
                <defs>
                  <pattern
                    id="header_grid"
                    :width="cellWidth"
                    :height="headerHeight"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      :d="`M ${cellWidth} 0 L 0 0 0 ${headerHeight}`"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#header_grid)" />
              </svg>
              <div
                class="t__fluid__calendar__header__cell"
                v-for="cell of rangeX.cells"
                :key="cell.date"
                :style="{
                  width: `${cellWidth}px`,
                }"
              >
                <!-- <slot v-if="$slots.date" name="date" :date="cell" /> -->
                <span
                  class="t__fluid__calendar__header__cell__date"
                  :class="{ '--up': displayHours }"
                  :style="{
                    transform: `translateY(${displayHours ? -6 : 0}px)`,
                  }"
                >
                  {{ format(cell.date) }}
                </span>
                <div
                  v-if="displayHours"
                  class="t__fluid__calendar__header__time__cells"
                >
                  <div
                    v-for="hour of hours"
                    class="t__fluid__calendar__header__time__cell"
                    :style="{
                      transform: `translateX(${hour.x}px)`,
                    }"
                  >
                    <span>{{ hour.label }}</span>
                  </div>
                </div>
                <!-- <div
                  v-if="false"
                  class="t__fluid__calendar__header__time__areas"
                  :style="{
                    top: rowHeight + 'px',
                    height: Math.min(fullHeight, h) + 'px',
                  }"
                >
                  <div
                    v-for="hour in hours"
                    class="t__fluid__calendar__header__time__area"
                    :class="{ '--is-rest': hour.isRest }"
                    :style="{ width: hour.width + 'px', left: hour.x + 'px' }"
                  ></div>
                </div> -->
              </div>
            </div>
            <div
              class="t__fluid__calendar__inner"
              :style="{
                width: width + 'px',
                transform: `translateY(${positionY}px)`,
              }"
            >
              <svg
                class="t__fluid__calendar__grid"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="grid"
                    :width="cellWidth"
                    :height="rowHeight"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      :d="`M ${cellWidth} 0 L 0 0 0 ${rowHeight}`"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div
              class="t__fluid__calendar__outer"
              :style="{
                width: width + 'px',
                transform: `translateY(${positionY}px)`,
                top: Math.min(fullHeight, h) + 1 + 'px',
              }"
            >
              <svg
                class="t__fluid__calendar__grid__outer"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="gridouter"
                    :width="cellWidth"
                    :height="rowHeight"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x="0"
                      y="0"
                      :width="cellWidth"
                      :height="rowHeight"
                      fill="#f8fafe"
                    />
                    <path
                      :d="`M 0 0 L 0 ${rowHeight}`"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridouter)" />
              </svg>
            </div>

            <!-- </div> -->
          </div>
        </div>
        <!-- <button class="t__fluid__calendar__next" @click="next"></button> -->
        <!-- <div class="t__fluid__calendar__scrollbar">
      <div class="t__fluid__calendar__scroll__area" ref="scroll_area">
        <button class="t__fluid__calendar__scroller"></button>
      </div>
    </div> -->
      </div>
    </FluidPinch>
    <FluidCalendarNavigator :faking="fakeMove" @increment="navIncrement" x />
  </div>
</template>

<script>
// import dayjs from 'dayjs/esm'

import { dayjs } from '../dayjs.js'

import gsap from 'gsap'

import FluidCalendarBooking from './FluidCalendarBooking.vue'
import FluidCalendarUnavail from './FluidCalendarUnavail.vue'
import FluidCalendarScroller from './FluidCalendarScroller.vue'
import FluidCalendarNavigator from './FluidCalendarNavigator.vue'
import FluidDraggable from './FluidDraggable.vue'
import FluidViewbar from './FluidViewbar.vue'
import FluidPinch from './FluidPinch.vue'

import { debounce, wait, splitNumber } from '../utils.js'

// import '../styles.css'

function disperseArray(originalArray, maxElements) {
  const resultArray = []
  const totalElements = originalArray.length

  if (totalElements <= 2) {
    // If the original array has 2 or fewer elements, return an empty array
    return resultArray
  }

  // Calculate the step size. We subtract 2 from totalElements to exclude first and last items.
  const stepSize = Math.ceil((totalElements - 2) / (maxElements + 1))

  for (let i = stepSize; i < totalElements - 1; i += stepSize) {
    resultArray.push(originalArray[i])
  }

  // If the result array has more elements than max, truncate it
  return resultArray.slice(0, maxElements)
}

export default {
  name: 'FluidCalendarDesktop',
  components: {
    FluidCalendarBooking,
    FluidCalendarScroller,
    FluidCalendarNavigator,
    FluidDraggable,
    FluidViewbar,
    FluidPinch,
    FluidCalendarUnavail,
  },
  props: {
    lang: {
      type: String,
      default: 'fr',
    },
    dates: {
      type: Array,
      default: () => [],
    },
    bookings: {
      type: Array,
      default: () => [],
    },
    bookables: {
      type: Array,
      default: () => [],
    },
    bookableType: {
      type: Object,
      default: () => {},
    },
    unavailabilities: {
      type: Array,
      default: () => [],
    },
    debounce: {
      type: Number,
      default: 0,
    },
    slotDuration: {
      type: String,
      default: '01:00',
    },
    slotMinTime: {
      type: String,
      default: '00:00:00',
    },
    slotMaxTime: {
      type: String,
      default: '23:59:00',
    },
    debug: {
      type: Boolean,
      default: false,
    },
    h: {
      type: Number,
      default: 0,
    },
  },
  emits: [
    'updateDate',
    'updateRange',
    'openBooking',
    'updateDebouncedDate',
    'updateDebouncedRange',
    'createNewBooking',
    'updateBooking',
  ],
  data() {
    return {
      prevResize: 0,
      moveY: 0,
      mouseMoveStartPoint: 0,
      mouseMoveListener: null,
      pincher: null,
      locale: null,
      collisions: [],
      dragData: null,
      selection: {},
      rowHeight: 40,
      moment: new Date(),
      pointer: 0,
      positionX: 0,
      positionY: 0,
      zoom: 3,
      fakeMove: 0,
      point: {},
      _bookings: [],
      _bookables: [],
      willResize: null,
      _dateToX: {},
      _bookableToY: {},
    }
  },
  async mounted() {
    const root = document.documentElement
    root.style.setProperty('--row-height', `${this.rowHeight}px`)

    this.zoom = Math.min(
      Math.max((1000 - this.slotDurationInMinutes) / 90, 3),
      30,
    )

    this.centerViewTo(this.dates[0], 0.001)

    this.$refs.fluidCalendar.addEventListener('wheel', (e) => {
      e.preventDefault()

      const speedX = e.deltaX * 0.75
      const speedY = this.fullHeight > this.h ? e.deltaY * 0.75 : 0

      const scroller = {}

      if (speedX) scroller.x = speedX
      if (speedY) scroller.y = speedY

      this.scroll(scroller)
      return
    })
  },
  watch: {
    bookables(bookables) {
      this._bookables = bookables
    },
    bookings: {
      immediate: true,
      handler(bookings) {
        this._bookings = [...this.bookings].map((m) => {
          const realStart = dayjs(m.start_at).date
          const start = dayjs(m.start_at).setTime(this.slotMin)
          const startDiff = dayjs(realStart).diff(dayjs(start), 'minute')
          const realEnd = dayjs(m.end_at).date
          const end = dayjs(m.end_at).setTime(this.slotMax)
          const endDiff = dayjs(realEnd).diff(dayjs(end), 'minute')
          const result = { ...m }
          if (startDiff < 0) result._start_at = dayjs(start).format('iso')
          if (endDiff > 0) result._end_at = dayjs(end).format('iso')
          return result
        })
        this._bookables = [...this.bookables]
      },
    },
    pointerDate(date) {
      this.$emit('updateDate', date)
      this.$emit('updateRange', {
        start: this.rangeX.start,
        end: this.rangeX.end,
      })
      debounce(() => {
        this.$emit('updateDebouncedDate', date)
        this.$emit('updateDebouncedRange', {
          start: this.rangeX.start,
          end: this.rangeX.end,
        })
      }, this.debounce)
    },
    zoom(v, o) {
      const oldWidthByMinute = o / 10
      const nextWidthByMinute = v / 10

      if (!this.pincher) return

      const pincherX =
        this.pincher.x -
        this.$refs.fluidCalendar.getBoundingClientRect().left -
        this.$refs.bookables.getBoundingClientRect().width

      const oldDecal = (this.positionX - pincherX) / oldWidthByMinute

      const nextDecal = (this.positionX - pincherX) / nextWidthByMinute

      this.scroll({ x: (nextDecal - oldDecal) * nextWidthByMinute })
    },
  },
  computed: {
    slotMin() {
      return this.slotMinTime
    },
    slotMax() {
      if (this.slotMaxTime === '00:00:00') return '23:59:59'
      return this.slotMaxTime
    },
    slotDur() {
      const min = dayjs().getDuration(this.slotMin)
      const max = dayjs().getDuration(this.slotMax)
      const duration = dayjs().getDuration(this.slotDuration)
      return dayjs().minutesToHHMMSS(Math.min(duration, max - min))
    },
    slotDurationInMinutes() {
      return dayjs().getDuration(this.slotDur)
    },
    offsetStart() {
      return dayjs().diffHours('00:00:00', this.slotMin)
    },
    offsetEnd() {
      return dayjs().diffHours('24:00:00', this.slotMax)
    },
    slots() {
      const [hours, minutes, seconds] = this.slotDur.split(':').map(Number)
      return [hours, minutes, seconds]
    },
    hours() {
      const hours = []
      const [minHours, minMinutes] = this.slotMin.split(':').map(Number)
      const [maxHours] = this.slotMax.split(':').map(Number)
      const h = (maxHours - minHours) * 60
      let startX = 0

      let firstLabel = this.slotMin.split(':')
      firstLabel = `${firstLabel[0]}:${firstLabel[1]}`
      const slotDuration = this.slotDurationInMinutes
      const nbSlots = splitNumber(h / slotDuration)
      let j = 0

      for (let i = 0; i <= nbSlots.value; i++) {
        j = i + 1
        if (i === 0 && nbSlots.value === 0) {
          hours.push({
            index: 0,
            x: 0,
            label: firstLabel,
            width: slotDuration * nbSlots.rest * this.widthByMinute,
            isRest: true,
          })
        } else if (i === 0) {
          hours.push({
            index: 0,
            x: 0,
            label: firstLabel,
            width: slotDuration * this.widthByMinute,
          })
        } else {
          startX = startX + this.widthByMinute * slotDuration
          const label = dayjs().addDuration(
            this.slotMin,
            this.slotDurationInMinutes * i,
          )
          hours.push({
            index: i,
            x: startX,
            label: label,
            width: this.widthByMinute * slotDuration,
          })
        }
      }
      if (nbSlots.rest) {
        const label = dayjs().addDuration(
          this.slotMin,
          this.slotDurationInMinutes * j,
        )
        hours.push({
          index: j,
          x: startX + this.widthByMinute * slotDuration,
          label: label,
          width: slotDuration * nbSlots.rest * this.widthByMinute,
          isRest: true,
          // width: this.widthByMinute * slotDuration,
        })
      }
      return disperseArray(hours, Math.round(this.cellWidth / 140))
    },
    // areas() {
    //   const h = this.hours.map((i) => i.index)
    //   h.pop()
    //   return h
    // },
    displayHours() {
      if (!this.hours || !this.hours.length) return
      return this.zoom > 5
    },
    headerHeight() {
      return 40
    },
    ratio() {
      return 1440 / this.minutesByCell
    },
    threshold() {
      return 2
      return Math.floor(this.rangeDays / 8)
    },
    rangeDays() {
      return 12
      const width = screen.width
      const nbDays = this.widthByMinute * 60 * 24
      console.log('NB DAYS ?', width / nbDays)
      return Math.floor(width / nbDays) + 5

      const nb = Math.floor(width / 200)
      return nb > 10 ? nb : 10
    },
    fullHeight() {
      if (!this.filteredBookables || !this.filteredBookables.length) return 0
      return this.filteredBookables.length * this.rowHeight + this.headerHeight
    },
    filteredBookables() {
      return this._bookables //.filter((f) => this.test.includes(f.id))
    },
    nbBookablesDisplayed() {
      return Math.ceil(this.h / this.rowHeight)
    },
    visibleBookings() {
      if (!this._bookings) return []
      return this._bookings.filter((f) => {
        if (dayjs(f.start_at).isAfter(dayjs(this.rangeX.end))) return false
        if (dayjs(f.end_at).isBefore(dayjs(this.rangeX.start))) return false
        const visibleBookables = this.rangeY.rows.map((m) => m.id)
        return visibleBookables.includes(f.bookable_id)
      })
    },
    scroller() {
      return (this.positionX / this.width) * 100
    },
    pointerDate() {
      if (!this.rangeX) return

      const minutes =
        Math.floor(
          this.positionX / this.widthByMinute +
            this.rangeDays * this.minutesByCell,
        ) * -1

      return dayjs()
        .startOf('day', this.slotMin)
        .gptAdd(minutes, 'minute', this.slotMin, this.slotMax)
        .format('iso')
    },
    widthByMinute() {
      return this.zoom / 10
    },
    cellWidth() {
      return this.widthByMinute * this.minutesByCell
    },
    minutesByCell() {
      return dayjs().duration(this.slotMin, this.slotMax)
    },
    decalY() {
      return (this.positionY / this.rowHeight) | 0
    },
    decalX() {
      const d = this.positionX / this.widthByMinute / this.minutesByCell
      return ((d + this.threshold) / this.threshold) | 0
    },
    width() {
      if (!this.rangeX || !this.rangeX.cells || !this.rangeX.cells.length)
        return 0
      return this.cellWidth * this.rangeX.cells.length
    },
    translateX() {
      return (
        this.positionX -
        this.decalX * this.threshold * (this.widthByMinute * this.minutesByCell)
      )
    },
    translateY() {
      return this.decalY * -1 * this.rowHeight
    },
    rangeY() {
      const bookables = this.filteredBookables
      if (!bookables) return {}
      const pointerY = this.decalY * -1
      return {
        rows: bookables.slice(pointerY, pointerY + this.nbBookablesDisplayed),
      }
    },
    rangeX() {
      const s = -this.rangeDays * 1440 - this.decalX * this.threshold * 1440
      const e = this.rangeDays * 1440 - this.decalX * this.threshold * 1440

      const start = dayjs(dayjs().startOf('day', this.slotMin).date)
        .add(s, 'minute')
        .startOf('day', this.slotMinTime)
        .format('iso')

      const end = dayjs(dayjs().startOf('day', this.slotMin).date)
        .add(e, 'minute')
        .endOf('day', this.slotMax)
        .format('iso')

      const diffInDays = dayjs(end).diff(dayjs(start)) + 1

      let cells = []
      for (let i = 0; i < diffInDays; i++) {
        const date = dayjs(start).add(i, 'day').format('iso')
        const cell = {
          date: date,
          short: dayjs(start).add(i, 'day').format(),
        }
        cells.push(cell)
      }
      return {
        start,
        end,
        cells: cells,
      }
    },
  },
  methods: {
    resizeBooking(booking, v) {
      if (!v) {
        this.$emit('updateBooking', booking)
        this.willResize = null
        return
      }

      const nextDate = dayjs(this.xToDate(v))
        .snapToTime(this.slotMin, this.slotDur, false, this.slotMax)
        .format('iso')

      if (dayjs(nextDate).isBefore(dayjs(booking.start_at), 'minute')) return
      if (dayjs(nextDate).isSame(dayjs(booking.end_at), 'minute')) return
      booking.end_at = booking._end_at = nextDate

      this.willResize = booking

      // this.$emit('updateBooking', booking)
    },
    getWidth({ start, end }) {
      return (
        this.dateToX(dayjs(end).format('iso')) -
        this.dateToX(dayjs(start).format('iso'))
      )
    },
    pinch(p) {
      if (p.zoom > 2 && p.zoom < 40) {
        this.pincher = p
        this.zoom = p.zoom
      }
    },
    async mousedown(event) {
      this.dragData = null
      await wait(0)
      if (event.button != 0) return
      this.point = {
        x: event.clientX,
        y: event.clientY,
        // snap: true
      }
      const data = this.pointToData(this.point)
      this.point.data = data
      if (data.collision) {
        this.addCollision(data.collision.id)
        document.body.style.cursor = 'not-allowed'
      } else if (data.booking) {
        document.removeEventListener('mousemove', this.mouseMoveListener)
        document.removeEventListener('mouseup', this.endMove)
        this.mouseMoveStartPoint = { x: event.clientX, y: event.clientY }
        this.mouseMoveListener = (event) => {
          this.move(event, data.booking)
        }
        document.addEventListener('mousemove', this.mouseMoveListener)
        document.addEventListener('mouseup', this.endMove)

        return
        // document.addEventListener('mouseup', this.endDrag)
      } else {
        this.dragData = data
        // document.body.style.cursor = 'ew-resize'
      }

      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', this.drag)
      document.addEventListener('mouseup', this.endDrag)
    },
    move(event, booking) {
      const x = event.clientX - this.mouseMoveStartPoint.x
      const y = event.clientY - this.mouseMoveStartPoint.y
      const m = x / this.widthByMinute
      const diff = {
        x: x,
        y: y,
        xInMinutes: m,
      }
      const nBStart = dayjs(booking.start_at)
        .gptAdd(m, 'minute', this.slotMin, this.slotMax)
        .format('iso')
      const nBEnd = dayjs(booking.end_at)
        .gptAdd(m, 'minute', this.slotMin, this.slotMax)
        .format('iso')
      const newBooking = {
        ...booking,
        start_at: nBStart,
        _start_at: nBStart,
        end_at: nBEnd,
        _end_at: nBEnd,
        diff: diff,
        ghosted: true,
      }
      const gStart = dayjs(booking.start_at)
        .gptAdd(m, 'minute', this.slotMin, this.slotMax)
        .snapToTime(this.slotMin, this.slotDur, false, this.slotMax)
        .format('iso')
      const gEnd = dayjs(booking.end_at)
        .gptAdd(m, 'minute', this.slotMin, this.slotMax)
        .snapToTime(this.slotMin, this.slotDur, false, this.slotMax)
        .format('iso')
      const ghost = {
        ...booking,
        id: booking.id + '--ghost',
        start_at: gStart,
        _start_at: gStart,
        end_at: gEnd,
        _end_at: gEnd,
        bookable_id: this.yToBookable(
          event.clientY -
            this.$refs.fluidCalendar.getBoundingClientRect().top +
            this.positionY * -1,
        )?.id,
        ghost: true,
      }
      const ghosti = this._bookings.findIndex(
        (f) => f.id === booking.id + '--ghost',
      )
      if (ghosti < 0) {
        this._bookings.push(ghost)
      } else {
        this._bookings.splice(ghosti, 1, ghost)
      }
      const i = this._bookings.findIndex((f) => f.id === booking.id)
      this._bookings.splice(i, 1, newBooking)
      // this.$emit('updateBooking', newBooking)
    },
    endMove(event) {
      if (event.clientX === this.point.x && event.clientY === this.point.y) {
        this.$emit('openBooking', this.point.data.booking)
        document.removeEventListener('mousemove', this.mouseMoveListener)
        document.removeEventListener('mouseup', this.endMove)
        return
      }
      let i = -1
      const ghost = this._bookings.find((f) => {
        i++
        return f.ghost
      })
      if (!ghost) {
        document.removeEventListener('mousemove', this.mouseMoveListener)
        document.removeEventListener('mouseup', this.endMove)
        return
      }
      const ghostedIndex = this._bookings.findIndex((f) => f.ghosted)
      const id = ghost.id.split('--')[0]
      const newBooking = { ...ghost, id: id }
      delete newBooking.ghost
      this._bookings.splice(i, 1)
      this._bookings.splice(ghostedIndex, 1, newBooking)
      this.$emit('updateBooking', newBooking)
      document.removeEventListener('mousemove', this.mouseMoveListener)
      document.removeEventListener('mouseup', this.endMove)
    },
    drag(event) {
      const point = {
        x: event.clientX,
        y: event.clientY,
      }
      const current = this.pointToData(point)

      if (current.collision) {
        document.body.style.cursor = 'not-allowed'
        this.addCollision(current.collision.id)
        return
      }
      if (current.bookable.id != this.dragData.bookable.id) return

      // console.log('Drag ', current.snapDown.date)

      this.dragData = {
        ...this.dragData,
        snapEnd: current.snapUp.format('iso'),
        snapStartX: this.dateToX(this.dragData.snapDown.format('iso')),
        snapEndX: this.dateToX(current.snapUp.format('iso')),
        dateStart: this.dragData.snapDown.format('iso'),
        dateEnd: current.snapUp.format('iso'),
        // width: current.x - this.dragData.x,
      }

      // console.log('Drag Data ', this.dragData.dateStart, this.dragData.dateEnd)

      return

      const exist = this.dragData.find((f) =>
        dayjs(f.date).isSame(dayjs(current.date), 'day'),
      )

      if (exist) return

      // const isBefore =

      this.dragData.push(current)

      console.log('ok to add ', current)
      // if (data.collision) return // Collision
      // const data = event.dataTransfer.getData('application/json')
      // console.log('Drag ', event, this.dragData)
    },
    endDrag(event) {
      this.collisions = []

      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
      //   document.body.style.pointerEvents = 'auto'
      document.removeEventListener('mousemove', this.drag)
      document.removeEventListener('mouseup', this.endDrag)
      if (!this.dragData) return
      if (this.dragData.dateStart && this.dragData.dateEnd) {
        this.$emit('createNewBooking', {
          start_at: this.dragData.dateStart,
          end_at: this.dragData.dateEnd,
          bookable_type_id: this.dragData.bookable.bookable_type_id,
          bookable_id: this.dragData.bookable.id,
        })
      }
    },
    addCollision(id) {
      if (this.collisions.includes(id)) return
      this.collisions.push(id)
    },
    scroll({ x, y }) {
      this.dragData = null
      if (x != undefined) {
        this.fakeMove = x
        this.positionX = this.positionX - x
        this.pointer = this.positionX * -1
      }

      if (y != undefined) {
        const max =
          this.positionY -
          this.h +
          (this._bookables.length + 1) * this.rowHeight
        const nextY = this.positionY - y
        if (nextY > 0) {
          this.positionY = 0
          return
        }
        if (max < 0) {
          this.positionY =
            ((this._bookables.length + 1) * this.rowHeight - this.h) * -1
        }

        this.positionY = this.positionY - y
      }
    },
    navIncrement({ x, y }) {
      this.scroll({ x: x, y: y })
    },
    navPosition({ x, y }) {
      if (y != undefined) {
        this.positionY = y
      }
    },
    prev() {
      const date = dayjs(this.pointerDate).add(-5, 'day').date
      this.centerViewTo(date)
    },
    next() {
      const date = dayjs(this.pointerDate).add(5, 'day').date
      this.centerViewTo(date)
    },
    format(date, f = 'DD MMMM') {
      return dayjs(date).format(f)
    },
    bookableToY(bookableId, diffY = 0) {
      let id
      if (typeof bookableId === 'object') {
        if (!bookableId._order) {
          id = bookableId.bookable_id
        } else {
          id =
            bookableId._order.canceled_at || bookableId._order.is_no_show
              ? 'canceled'
              : bookableId.bookable_id
        }
      } else {
        id = bookableId
      }
      if (this._bookableToY[id]) return this._bookableToY[id]
      const bookableIndex = this.filteredBookables.findIndex((f) => f.id === id)
      const value = bookableIndex * this.rowHeight + diffY + this.headerHeight
      this._bookableToY[id] = value
      return value
    },
    pointToData({ x, y, snap = false }) {
      const top =
        y -
        this.$refs.fluidCalendar.getBoundingClientRect().top +
        this.positionY * -1
      const date = this.xToDate(x)
      // const snapStart = this.xToDate(x, true)
      const snapDown = this.xToDate(x, true)
      const snapUp = this.xToDate(x, true, true)
      const bookable = this.yToBookable(top)

      if (!bookable) {
        return {
          snapUp: snapUp,
          snapDown: snapDown,
          // snapStart: snapStart,
          date: date,
          x: this.dateToX(date),
          // y: this.bookableToY(this.yToBookable(top).id),
        }
      }

      const clickOnBooking = this._bookings.find((f) => {
        const d = dayjs(date)
        const start = dayjs(f._start_at || f.start_at)
        const end = dayjs(f._end_at || f.end_at)

        const checkDate =
          (d.isAfter(start, 'minute') || d.isSame(start, 'minute')) &&
          (d.isBefore(end, 'minute') || d.isSame(end, 'minute'))
        if (!f._displayIn) {
          return f.bookable_id === bookable.id && checkDate
        } else {
          return bookable.id === f._displayIn
        }
      })

      if (clickOnBooking) {
        return {
          snapUp: snapUp,
          snapDown: snapDown,
          // snapStart: snapStart,
          date: date,
          bookable: bookable,
          x: this.dateToX(date),
          y: this.bookableToY(this.yToBookable(top).id),
          booking: clickOnBooking,
        }
      }

      const collision = this._bookings.find((f) => {
        return (
          f.bookable_id === bookable.id &&
          !dayjs(f.end_at).isBefore(dayjs(date), 'day') &&
          !dayjs(f.start_at).isAfter(dayjs(date), 'day')
        )
      })
      return {
        snapUp: snapUp,
        snapDown: snapDown,
        // snapStart: snapStart,
        date: date,
        bookable: bookable,
        x: this.dateToX(date),
        y: this.bookableToY(this.yToBookable(top).id),
        collision: collision,
      }
    },
    yToBookable(top) {
      return this.filteredBookables[((top / this.rowHeight) | 0) - 1]
    },
    xToDate(x, snap = false, up) {
      let v = x
      const zero =
        v -
        this.$refs.fluidCalendar.getBoundingClientRect().left -
        this.$refs.bookables.getBoundingClientRect().width
      const p = zero + this.translateX * -1
      const days = p / this.widthByMinute

      let date = dayjs(this.rangeX.start).gptAdd(
        days,
        'minute',
        this.slotMin,
        this.slotMax,
      ).date

      if (snap) {
        return dayjs(date).snapToTime(
          this.slotMin,
          this.slotDur,
          up,
          this.slotMax,
        )
      }
      return date
    },
    dateToX(date) {
      const key = date + this.zoom + this.rangeX.start
      if (this._dateToX[key]) return this._dateToX[key]
      const diffInDays = dayjs(date).diff(
        dayjs(this.rangeX.start),
        'day',
        this.slotMinTime,
        this.slotMaxTime,
      )
      const diff = dayjs(date).diff(dayjs(this.rangeX.start), 'minute')
      const offset = ((this.offsetStart + this.offsetEnd) * diffInDays) / 60
      const value = (diff - offset) * this.widthByMinute
      this._dateToX[key] = value
      return value
    },
    centerViewTo(unTimedDate, speed = 0.5) {
      // console.log('Center => ', unTimedDate)
      const date = dayjs(unTimedDate).setTime(this.slotMin)
      const d = dayjs(date)
      const r = dayjs(this.rangeX.start)
      const diff = r.diff(d, 'minute') / this.ratio
      const t = this.positionX - this.translateX + diff * this.widthByMinute
      if (!speed) {
        this.positionX = t
        return
      }
      const interpolation = { value: this.positionX }
      gsap.to(interpolation, {
        value: t,
        onUpdate: () => {
          this.positionX = interpolation.value
        },
        duration: speed,
      })
    },
  },
}
</script>
