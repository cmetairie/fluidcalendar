<template>
  <div class="t__fluid__calendar__wrapper">
    <div v-if="debug" class="t__debugg">
      <pre>{{
        {
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
    <button @click="centerViewTo('2024-01-20')">2023-12-20</button>
    <button @click="prev()">prev</button>
    <button @click="centerViewTo()">today</button>
    <button @click="next()">next</button>
    <!-- {{ dragData }} -->
    <!-- <h2>{{ format(pointerDate) }}</h2>
  <button @click="centerViewTo('2023-10-17')">2023-10-17</button>
  <button @click="generate">generate</button>
  <button @click="reset">reset</button>

  <input type="range" min="20" max="100" v-model="rowHeight" step="1" /> -->
    <!-- {{ dragData }} -->
    <!-- {{ dragData }} -->

    <FluidViewbar
      :rangeX="rangeX"
      :rangeY="rangeY"
      :date="pointerDate"
      :debug="debug"
    >
      <!-- <button @click="zoom = zoom - 0.5">-</button>
      <input type="range" min="0.1" max="10" v-model="zoom" step="0.01" />
      <button @click="zoom = zoom + 0.5">+</button> -->
    </FluidViewbar>
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
            <span>bookables</span>
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
        <FluidCalendarNavigator
          :faking="fakeMove"
          @increment="navIncrement"
          x
        />
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
            <div class="t__fluid__calendar__unavailabilities">
              <FluidDraggable
                v-for="unavail of unavailabilities"
                :key="unavail.id"
                :y="bookableToY(unavail.bookableId, unavail.diff?.y)"
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
                :y="bookableToY(booking.bookableId, booking.diff?.y)"
                :x="dateToX(booking.start_at)"
                :ghost="booking.ghost"
              >
                <FluidCalendarBooking
                  :booking="booking"
                  :widthByMinute="widthByMinute"
                  :rowHeight="rowHeight"
                  :collisions="collisions"
                  :width="
                    getWidth({ start: booking.start_at, end: booking.end_at })
                  "
                  :ratio="ratio"
                  :refX="translateX + dateToX(booking.start_at)"
                >
                  <!-- <slot
                    v-if="$slots.booking"
                    name="booking"
                    :booking="booking"
                  /> -->
                  <span class="t__fluid__calendar__booking__label">
                    {{ format(booking.start_at, 'time') }} {{ booking.label }},
                    {{ format(booking.end_at, 'time') }}
                  </span>
                </FluidCalendarBooking>
              </FluidDraggable>
            </div>
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
            <svg
              class="t__fluid__calendar__header__time__grid"
              xmlns="http://www.w3.org/2000/svg"
              v-if="displayHours"
              :style="{ height: headerHeight + 'px' }"
            >
              <defs>
                <pattern
                  id="header_time_grid"
                  :width="(cellWidth / minutesByCell) * 60"
                  :height="headerHeight"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    :d="`M ${
                      (cellWidth / minutesByCell) * 60
                    } ${headerHeight} L ${(cellWidth / minutesByCell) * 60} ${
                      headerHeight - 6
                    }`"
                    fill="none"
                    stroke="#aaa"
                    stroke-width="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#header_time_grid)" />
            </svg>
            <div
              class="t__fluid__calendar__header"
              :style="{
                width: width + 'px',
                height: headerHeight + 'px',
              }"
            >
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
                    transform: `translateY(${displayHours ? -20 : 0}px)`,
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
                <div
                  v-if="displayArea"
                  class="t__fluid__calendar__header__time__areas"
                  :style="{
                    top: rowHeight + 'px',
                    height: Math.min(fullHeight, h) + 'px',
                  }"
                >
                  <div
                    v-for="i in areas"
                    class="t__fluid__calendar__header__time__area"
                  >
                    <!-- ? -->
                    <!-- {{ i }} -->
                  </div>
                </div>
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

import { debounce } from '../utils.js'

// import '../styles.css'

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
    bookings: {
      type: Array,
      default: () => [],
    },
    bookables: {
      type: Array,
      default: () => [],
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
  emits: ['updateDate', 'updateRange', 'clickBooking'],
  data() {
    return {
      moveY: 0,
      mouseMoveStartPoint: 0,
      mouseMoveListener: null,
      pincher: null,
      locale: null,
      collisions: [],
      dragData: null,
      selection: {},
      displayFR: true,
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
    }
  },
  async mounted() {
    // this.loadLocale(this.lang)
    this._bookings = [...this.bookings]
    this._bookables = [...this.bookables]
    const root = document.documentElement
    root.style.setProperty('--row-height', `${this.rowHeight}px`)

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
    pointerDate(date) {
      debounce(() => {
        this.$emit('updateDate', date)
        this.$emit('updateRange', {
          start: this.rangeX.start,
          end: this.rangeX.end,
        })
        // console.log('Range ?', this.rangeX)
      }, this.debounce)
    },
    zoom(v, o) {
      const oldWidthByMinute = o / 10
      const nextWidthByMinute = v / 10

      const pincherX =
        this.pincher.x -
        this.$refs.fluidCalendar.getBoundingClientRect().left -
        this.$refs.bookables.getBoundingClientRect().width

      const oldDecal = (this.positionX - pincherX) / oldWidthByMinute

      const nextDecal = (this.positionX - pincherX) / nextWidthByMinute

      this.scroll({ x: (nextDecal - oldDecal) * nextWidthByMinute })
    },
    width: {
      immediate: true,
      async handler(width, oldWidth) {
        const now = dayjs()
        if (!oldWidth) {
          this.centerViewTo(now.date, 0.001)
        }
      },
    },
  },
  computed: {
    offsetStart() {
      return dayjs().diffHours('00:00:00', this.slotMinTime)
    },
    offsetEnd() {
      return dayjs().diffHours('24:00:00', this.slotMaxTime)
    },
    slots() {
      const [hours, minutes, seconds] = this.slotDuration.split(':').map(Number)
      return [hours, minutes, seconds]
      // slotDuration , slotMinTime, slotMaxTime
    },
    hours() {
      // const [hours, minutes, seconds] = this.slotDuration.split(':').map(Number)
      const hours = []
      const [minHours, minMinutes] = this.slotMinTime.split(':').map(Number)
      const [maxHours] = this.slotMaxTime.split(':').map(Number)
      const h = maxHours - minHours
      let startX = 0
      for (let i = 0; i < h - 1; i++) {
        const restMinutes = 60 - minMinutes
        startX = startX + this.widthByMinute * restMinutes
        hours.push({ index: i, x: startX, label: `${minHours + i + 1}:00` })
      }
      return hours
    },
    areas() {
      const h = this.hours.map((i) => i.index)
      h.push({})
      return h
    },
    displayHours() {
      return this.zoom > 10
    },
    displayArea() {
      return this.zoom > 8
    },
    headerHeight() {
      return 40
      return this.displayHours ? this.rowHeight * 1.35 : this.rowHeight
    },
    ratio() {
      return 1440 / this.minutesByCell
    },
    // diffCenter(){

    // },
    threshold() {
      return 2
      return Math.floor(this.rangeDays / 8)
    },
    rangeDays() {
      return 6
      const width = screen.width
      const nbDays = this.widthByMinute * 60 * 24
      console.log('NB DAYS ?', width / nbDays)
      return Math.floor(width / nbDays) + 5

      const nb = Math.floor(width / 200)
      return nb > 10 ? nb : 10
    },
    // _bookings() {
    //   return [...this.bookings] //this.bookings.concat(this.cal.bookings)
    // },
    // _bookables() {
    //   return [...this.bookables] //this.bookables.concat(this.cal.bookables)
    // },
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
        return visibleBookables.includes(f.bookableId)
      })
    },
    scroller() {
      return (this.positionX / this.width) * 100
    },
    pointerDate() {
      if (!this.rangeX) return

      // const days =
      //   -this.positionX / this.widthByMinute / this.minutesByCell -
      //   this.rangeDays

      // const minutes =
      //   -this.positionX / this.widthByMinute -
      //   this.rangeDays * this.minutesByCell * this.widthByMinute

      const minutes =
        Math.floor(
          this.positionX / this.widthByMinute +
            this.rangeDays * this.minutesByCell,
        ) * -1

      // console.log('Add ', minutes)

      // console.log(
      //   'Minutes = >',
      //   dayjs().startOf('day', this.slotMinTime).date,
      //   minutes,
      // )

      // console.log(dayjs().startOf('day', this.slotMinTime).date)

      return dayjs()
        .startOf('day', this.slotMinTime)
        .gptAdd(minutes, 'minute', this.slotMinTime, this.slotMaxTime)
        .format('iso')
      const start = dayjs(this.rangeX.start)
      const dist =
        (this.translateX * -1) / this.widthByMinute / this.widthByMinute

      return start.add(dist, 'minute').format('iso')
    },
    widthByMinute() {
      return this.zoom / 10
    },
    cellWidth() {
      return this.widthByMinute * this.minutesByCell
    },
    minutesByCell() {
      return dayjs().duration(this.slotMinTime, this.slotMaxTime)
    },
    decalY() {
      return (this.positionY / this.rowHeight) | 0
    },
    decalX() {
      const d = this.positionX / this.widthByMinute / this.minutesByCell
      // console.log('d => ', d)
      // console.log(
      //   'd => ',
      //   d,
      //   (this.positionX / this.widthByMinute) / this.minutesByCell,
      // )
      return ((d + this.threshold) / this.threshold) | 0
    },
    width() {
      return this.cellWidth * (this.rangeDays * 2 + 1)
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

      const start = dayjs(dayjs().startOf('day', this.slotMinTime).date)
        .add(s, 'minute')
        .startOf('day', this.slotMinTime)
        .format('iso')

      const end = dayjs(dayjs().startOf('day', this.slotMinTime).date)
        .add(e, 'minute')
        .endOf('day', this.slotMaxTime)
        .format('iso')

      const diffInDays = dayjs(end).diff(dayjs(start)) + 1

      // let slots = []

      // console.log('Slots => ', dayjs().startOf('day', this.slotMinTime).date)

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
    getWidth({ start, end }) {
      return this.dateToX(end) - this.dateToX(start)
    },
    pinch(p) {
      if (p.zoom > 2 && p.zoom < 40) {
        this.pincher = p
        this.zoom = p.zoom
      }
    },
    mousedown(event) {
      this.dragData = null
      if (event.button != 0) return
      this.point = {
        x: event.clientX,
        y: event.clientY,
        // snap: true
      }
      const data = this.pointToData(this.point)
      // console.log('POINT ', data)
      this.point.data = data
      if (data.collision) {
        this.addCollision(data.collision.id)
        document.body.style.cursor = 'not-allowed'
      } else if (data.booking) {
        document.removeEventListener('mousemove', this.mouseMoveListener)
        document.removeEventListener('mouseup', this.endMove)
        // console.log('Click booking ', event, data)
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
      const newBooking = {
        ...booking,
        start_at: dayjs(booking.start_at).add(m, 'minute').format('iso'),
        end_at: dayjs(booking.end_at).add(m, 'minute').format('iso'),
        diff: diff,
        ghosted: true,
      }
      const ghost = {
        ...booking,
        id: booking.id + '--ghost',
        start_at: dayjs(booking.start_at)
          .add(m, 'minute')
          .startOf('day')
          .format('iso'),
        end_at: dayjs(booking.end_at)
          .add(m, 'minute')
          .startOf('day')
          .format('iso'),
        bookableId: this.yToBookable(
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
    },
    endMove(event) {
      if (event.clientX === this.point.x && event.clientY === this.point.y) {
        this.$emit('clickBooking', this.point.data.booking)
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

      // console.log('Drag ', current)

      this.dragData = {
        ...this.dragData,
        snapEnd: current.snapStart,
        snapStartX: this.dateToX(this.dragData.snapStart),
        snapEndX: this.dateToX(current.snapStart),
        // width: current.x - this.dragData.x,
      }

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
      // this.dragData = null
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
      const bookableIndex = this.filteredBookables.findIndex(
        (f) => f.id === bookableId,
      )
      return bookableIndex * this.rowHeight + diffY + this.headerHeight
    },
    pointToData({ x, y, snap = false }) {
      const top =
        y -
        this.$refs.fluidCalendar.getBoundingClientRect().top +
        this.positionY * -1
      const date = this.xToDate(x)
      const snapStart = this.xToDate(x, true)
      const bookable = this.yToBookable(top)

      if (!bookable) {
        return {
          snapStart: snapStart,
          date: date,
          x: this.dateToX(date),
          // y: this.bookableToY(this.yToBookable(top).id),
        }
      }

      const clickOnBooking = this._bookings.find((f) => {
        const d = dayjs(date)
        const start = dayjs(f.start_at)
        const end = dayjs(f.end_at)
        const checkDate =
          (d.isAfter(start, 'minute') || d.isSame(start, 'minute')) &&
          (d.isBefore(end, 'minute') || d.isSame(end, 'minute'))
        return f.bookableId === bookable.id && checkDate
      })

      if (clickOnBooking) {
        return {
          snapStart: snapStart,
          date: date,
          bookable: bookable,
          x: this.dateToX(date),
          y: this.bookableToY(this.yToBookable(top).id),
          booking: clickOnBooking,
        }
      }

      const collision = this._bookings.find((f) => {
        return (
          f.bookableId === bookable.id &&
          !dayjs(f.end_at).isBefore(dayjs(date), 'day') &&
          !dayjs(f.start_at).isAfter(dayjs(date), 'day')
        )
      })
      return {
        snapStart: snapStart,
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
    xToDate(x, snap = false) {
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
        this.slotMinTime,
        this.slotMaxTime,
      ).date
      if (snap) dayjs(date).snapToTime(this.slotDuration)

      return date
    },
    dateToX(date) {
      const diffInDays = dayjs(date).diff(dayjs(this.rangeX.start))
      const diff = dayjs(date).diff(dayjs(this.rangeX.start), 'minute')
      const offset = ((this.offsetStart + this.offsetEnd) * diffInDays) / 60
      // console.log('OFFSET ', diffInDays)
      return (diff - offset) * this.widthByMinute
    },
    centerViewTo(unTimedDate, speed = 0.5) {
      console.log('Center => ', unTimedDate)
      const date = dayjs(unTimedDate).setTime(this.slotMinTime)
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
