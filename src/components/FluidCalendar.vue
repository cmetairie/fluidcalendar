<template>
  {{ dragData }}
  <div v-if="displayFR" class="t__frame__rate">
    <span v-if="_bookings">{{ _bookings.length }} rézas</span>
    <br />
    <span v-if="_bookables">{{ _bookables.length }} bookables</span>
    <br />
    {{ frameRate }} FPS
  </div>
  <!-- {{ collisions }} -->
  <div v-if="debug" class="t__debugg">
    <pre>{{
      {
        scroller,
        zooming,
        widthByMinute,
        decalX,
        height,
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
  <!-- <h2>{{ format(pointerDate) }}</h2>
  <button @click="centerViewTo('2023-10-17')">2023-10-17</button>
  <button @click="generate">generate</button>
  <button @click="reset">reset</button>
  <input
    type="range"
    min="0.1"
    max="10"
    v-model="zoom"
    step="0.01"
    @mousedown="zooming = true"
    @mouseup="zooming = false"
  />
  <input type="range" min="20" max="100" v-model="rowHeight" step="1" /> -->
  <!-- {{ dragData }} -->
  <div
    class="t__fluid__calendar"
    :style="{ height: Math.min(fullHeight, height) + 'px' }"
    ref="fluidCalendar"
    :class="{ '--debug': debug }"
  >
    <div class="t__fluid__calendar__bookables" ref="bookables">
      <div
        class="t__fluid__calendar__bookables__header"
        :style="{ height: rowHeight + 'px' }"
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
          <slot v-if="$slots.bookable" name="bookable" :bookable="bookable" />
          <span v-else>{{ bookable.label }}</span>
        </div>
      </div>
    </div>
    <FluidCalendarNavigator :faking="fakeMove" @increment="navIncrement" x />
    <FluidCalendarScroller
      y
      @position="navPosition"
      :total="fullHeight - rowHeight"
      :position="positionY"
      :height="height - rowHeight"
      :style="{ top: rowHeight + 'px' }"
    />

    <!-- <button class="t__fluid__calendar__prev" @click="prev"></button> -->
    <div class="t__fluid__calendar__content" @mousedown="mousedown">
      <!-- <span class="t__fluid__calendar__pointer"></span> -->
      <span
        v-if="dragData"
        :style="{
          top: dragData[0].y + 'px',
          left: dragData[0].x + 'px',
          width: `${dragData.length * widthByMinute * 60 * 24}px`,
          transform: `translateY(${positionY}px) translateX(${translateX}px)`,
          height: `${rowHeight}px`,
        }"
        class="t__fluid__calendar__selection"
      ></span>
      <div
        class="t__fluid__calendar__canva"
        :style="{
          transform: `translateX(${translateX}px)`,
          width: width + 'px',
        }"
      >
        <!-- <div class="t__fluid__calendar__content__translate"> -->
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
            >
              <slot v-if="$slots.booking" name="booking" :booking="booking" />
              <span class="t__fluid__calendar__booking__label" v-else>
                {{ booking.id }} {{ booking.label }}
              </span>
            </FluidCalendarBooking>
          </FluidDraggable>
        </div>
        <svg
          class="t__fluid__calendar__header__grid"
          xmlns="http://www.w3.org/2000/svg"
          :style="{ height: rowHeight + 'px' }"
        >
          <defs>
            <pattern
              id="header_grid"
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
          <rect width="100%" height="100%" fill="url(#header_grid)" />
        </svg>
        <div
          class="t__fluid__calendar__header"
          :style="{
            width: width + 'px',
            height: rowHeight + 'px',
          }"
        >
          <div
            class="t__fluid__calendar__header__cell"
            v-for="cell of rangeX.cells"
            :key="cell.date"
            :style="{ width: `${cellWidth}px` }"
          >
            <slot v-if="$slots.date" name="date" :date="cell" />
            <span v-else>{{ format(cell.date) }}</span>
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
</template>

<script>
// import dayjs from 'dayjs/esm'

import { dayjs } from '../dayjs.js'

import gsap from 'gsap'

import FluidCalendarBooking from './FluidCalendarBooking.vue'
import FluidCalendarScroller from './FluidCalendarScroller.vue'
import FluidCalendarNavigator from './FluidCalendarNavigator.vue'
import FluidDraggable from './FluidDraggable.vue'

import {
  generateBookables,
  getRandomNumber,
  generateEntriesWithDetails,
  debounce,
} from '../utils.js'

// import '../styles.css'

export default {
  name: 'FluidCalendar',
  components: {
    FluidCalendarBooking,
    FluidCalendarScroller,
    FluidCalendarNavigator,
    FluidDraggable,
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
    debounce: {
      type: Number,
      default: 0,
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['updateDate', 'updateRange'],
  data() {
    return {
      moveY: 0,
      mouseMoveStartPoint: 0,
      mouseMoveListener: null,
      locale: null,
      collisions: [],
      dragData: null,
      selection: {},
      displayFR: true,
      // debug: false,
      rangeDays: 8,
      threshold: 2,
      rowHeight: 40,
      moment: new Date(),
      pointer: 0,
      positionX: 0,
      positionY: 0,
      zoom: 0.75,
      zooming: false,
      height: 0,
      frameRate: 0,
      lastFrameTime: performance.now(),
      frameCount: 0,
      fakeMove: 0,
      fixtures: {
        bookings: [],
        bookables: [],
      },
    }
  },
  async mounted() {
    // this.loadLocale(this.lang)
    if (this.displayFR) {
      this.updateFrameRate()
    }
    this.$refs.fluidCalendar.addEventListener('wheel', (e) => {
      e.preventDefault()
      const speedX = e.deltaX * 0.75
      const speedY = this.fullHeight > this.height ? e.deltaY * 0.75 : 0

      const scroller = {}

      if (speedX) scroller.x = speedX
      if (speedY) scroller.y = speedY

      this.scroll(scroller)
      return
    })

    window.addEventListener('resize', this.manageSize)
    this.manageSize()
    this.generate()
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
    zoom(value, oldValue) {
      // console.log('ZOOM ?', value)
      // const width = (value / 10) * 60 * 24
      // const oldWidth = (oldValue / 10) * 60 * 24
      // const pointerX =
      //   this.translate * -1 + this.decal * this.cellWidth * -1 + 125
      // const p = (pointerX / width) * 100
      // const diff = width - oldWidth
      // const r = (diff / 100) * p
      // this.position = this.position - r
    },
    width: {
      immediate: true,
      async handler(width, oldWidth) {
        const now = dayjs()
        if (!oldWidth) {
          this.centerViewTo(now.date, false)
        }
        if (this.zooming) {
          // const pointerX =
          //   this.translate * -1 + this.decal * this.cellWidth * -1 + 125
          // const p = (pointerX / width) * 100
          // const diff = width - oldWidth
          // const r = (diff / 100) * p
          // this.position = this.position - r
          // console.log({ r })
        }
      },
    },
  },
  computed: {
    _bookings() {
      return this.bookings.concat(this.fixtures.bookings)
    },
    _bookables() {
      return this.bookables.concat(this.fixtures.bookables)
    },
    fullHeight() {
      if (!this.filteredBookables || !this.filteredBookables.length) return 0
      return (this.filteredBookables.length + 1) * this.rowHeight
    },
    filteredBookables() {
      return this._bookables //.filter((f) => this.test.includes(f.id))
    },
    nbBookablesDisplayed() {
      return Math.ceil(this.height / this.rowHeight)
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
      const start = dayjs(this.rangeX.start)
      const dist =
        (this.translateX * -1) / this.widthByMinute + 125 / this.widthByMinute

      return start.add(dist, 'minute').format('iso')
    },
    widthByMinute() {
      return this.zoom / 10
    },
    cellWidth() {
      return this.widthByMinute * 60 * 24
    },
    decalY() {
      return (this.positionY / this.rowHeight) | 0
    },
    decalX() {
      const d = this.positionX / this.widthByMinute / 60 / 24
      return ((d - 4 + this.rangeDays) / this.threshold) | 0
    },
    width() {
      return this.cellWidth * (this.rangeDays * 2 + 1)
    },
    translateX() {
      return (
        this.positionX -
        this.decalX * this.threshold * (this.widthByMinute * 60 * 24)
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
      const start = dayjs(dayjs().startOf('day').date)
        .add(
          -60 * 24 * (this.rangeDays + this.decalX * this.threshold),
          'minute',
        )
        .startOf('day')
        .format('iso')

      const end = dayjs(dayjs().startOf('day').date)
        .add(
          60 * 24 * (this.rangeDays - this.decalX * this.threshold),
          'minute',
        )
        .endOf('day')
        .format('iso')

      const diffInDays = dayjs(end).diff(dayjs(start), 'day')

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
    dragStart(event) {
      console.log('dragStart =< ', event)
    },
    reset() {
      this.fixtures.bookables = []
      this.fixtures.bookings = []
    },
    generate() {
      // console.log(generateRessources(50))
      // this.ressources = []
      this.fixtures.bookables = generateBookables(getRandomNumber(2, 100))
      this.fixtures.bookings = generateEntriesWithDetails(
        this.fixtures.bookables,
        getRandomNumber(10, 2000),
      )
      this.positionY = 0
    },
    mousedown(event) {
      this.dragData = null
      const point = {
        x: event.clientX,
        y: event.clientY,
      }
      const data = this.pointToData(point)
      if (data.collision) {
        this.addCollision(data.collision.id)
        document.body.style.cursor = 'not-allowed'
      } else if (data.booking) {
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
        this.dragData = [data]
        document.body.style.cursor = 'ew-resize'
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
        start_at: dayjs(booking.start_at).add(m, 'minute').format('iso'),
        end_at: dayjs(booking.end_at).add(m, 'minute').format('iso'),
        bookableId: this.yToBookable(
          event.clientY -
            this.$refs.fluidCalendar.getBoundingClientRect().top +
            this.positionY * -1,
        )?.id,
        ghost: true,
      }
      const ghosti = this.fixtures.bookings.findIndex(
        (f) => f.id === booking.id + '--ghost',
      )
      if (ghosti < 0) {
        this.fixtures.bookings.push(ghost)
      } else {
        this.fixtures.bookings.splice(ghosti, 1, ghost)
      }
      const i = this.fixtures.bookings.findIndex((f) => f.id === booking.id)
      this.fixtures.bookings.splice(i, 1, newBooking)
    },
    endMove(event) {
      let i = -1
      const ghost = this.fixtures.bookings.find((f) => {
        i++
        return f.ghost
      })
      const ghostedIndex = this.fixtures.bookings.findIndex((f) => f.ghosted)
      const id = ghost.id.split('--')[0]
      const newBooking = { ...ghost, id: id }
      delete newBooking.ghost
      this.fixtures.bookings.splice(i, 1)
      this.fixtures.bookings.splice(ghostedIndex, 1, newBooking)
      document.removeEventListener('mousemove', this.mouseMoveListener)
      document.removeEventListener('mouseup', this.endMove)
    },
    drag(event) {
      const first = this.dragData
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
      if (current.bookable.id != this.dragData[0].bookable.id) return

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
          this.height +
          (this._bookables.length + 1) * this.rowHeight
        const nextY = this.positionY - y
        if (nextY > 0) {
          this.positionY = 0
          return
        }
        if (max < 0) {
          this.positionY =
            ((this._bookables.length + 1) * this.rowHeight - this.height) * -1
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
    updateFrameRate() {
      const currentTime = performance.now()
      const elapsedTime = currentTime - this.lastFrameTime
      if (elapsedTime >= 500) {
        this.frameRate = Math.round((this.frameCount / elapsedTime) * 1000)
        this.frameCount = 0
        this.lastFrameTime = currentTime
      }
      this.frameCount++
      requestAnimationFrame(this.updateFrameRate)
    },
    manageSize() {
      const documentHeight = window.innerHeight
      const coords = this.$refs.fluidCalendar.getBoundingClientRect()

      const widthByDay = this.widthByMinute * 60 * 24

      const visibleDays = coords.width / widthByDay

      // this.rangeDays = Math.ceil(visibleDays)
      // console.log('COORDS => ', this.rangeDays)

      this.height = this.debug
        ? documentHeight - coords.y - 150
        : documentHeight - coords.y
    },
    prev() {
      const date = dayjs(this.pointerDate).add(-5, 'day').format()
      this.centerViewTo(date)
    },
    next() {
      const date = dayjs(this.pointerDate).add(5, 'day').format()
      this.centerViewTo(date)
    },
    format(date) {
      return dayjs(date).format('DD MMMM')
    },
    bookableToY(bookableId, diffY = 0) {
      const bookableIndex = this.filteredBookables.findIndex(
        (f) => f.id === bookableId,
      )
      return (bookableIndex + 1) * this.rowHeight + diffY
    },
    pointToData({ x, y }) {
      const top =
        y -
        this.$refs.fluidCalendar.getBoundingClientRect().top +
        this.positionY * -1
      const date = this.xToDate(x)
      const bookable = this.yToBookable(top)

      // console.log('Date ', date)

      if (!bookable) {
        return {
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
          date: date,
          bookable: bookable,
          x: this.dateToX(date),
          y: this.bookableToY(this.yToBookable(top).id),
          booking: clickOnBooking,
        }
      }

      // console.log('clickOnBooking => ', clickOnBooking?.id)

      const collision = this._bookings.find((f) => {
        return (
          f.bookableId === bookable.id &&
          !dayjs(f.end_at).isBefore(dayjs(date), 'day') &&
          !dayjs(f.start_at).isAfter(dayjs(date), 'day')
        )
      })
      return {
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
    xToDate(x) {
      const zero =
        x -
        this.$refs.fluidCalendar.getBoundingClientRect().left -
        this.$refs.bookables.getBoundingClientRect().width
      const p = zero + this.translateX * -1
      const days = p / this.widthByMinute
      return dayjs(this.rangeX.start).add(days, 'minute').date
    },
    dateToX(date) {
      const diff = dayjs(date).diff(dayjs(this.rangeX.start), 'minute')
      return diff * this.widthByMinute
    },
    centerViewTo(date, animate = true) {
      const d = dayjs(date)
      const r = dayjs(this.rangeX.start)
      const diff = r.diff(d.startOf('day'), 'minute')
      const t = this.positionX - this.translateX + diff * this.widthByMinute
      if (!animate) {
        this.positionX = t
        return
      }
      const interpolation = { value: this.positionX }
      gsap.to(interpolation, {
        value: t,
        onUpdate: () => {
          this.positionX = interpolation.value
        },
        duration: 0.5,
      })
    },
  },
}
</script>
