<template>
  <div v-if="displayFR" class="t__frame__rate">
    <span v-if="_bookings">{{ _bookings.length }} rézas</span>
    <br />
    <span v-if="_ressources">{{ _ressources.length }} ressources</span>
    <br />
    {{ frameRate }} FPS
  </div>
  <!-- {{ collisions }} -->
  <div v-if="debug" class="t__debugg">
    <pre>{{
      {
        // scroller,
        // zooming,
        // widthByMinute,
        decalX,
        // height,
        // decalY,
        positionX,
        // positionY,
        translateX,
        // translateY,
        // width,
        // pointer,
        // pointerDate,
        start: rangeX.start,
        end: rangeX.end,
        // cellWidth,
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
    ref="fluidCalendar"
    :style="{ height: Math.min(fullHeight, height) + 'px' }"
    :class="{ '--debug': debug }"
  >
    <div class="t__fluid__calendar__ressources" ref="ressources">
      <div
        class="t__fluid__calendar__ressources__header"
        :style="{ height: rowHeight + 'px' }"
      >
        <span>ressources</span>
      </div>
      <div
        class="t__fluid__calendar__ressources__inner"
        :style="{
          transform: `translateY(${positionY}px) translateY(${translateY}px)`,
        }"
      >
        <div
          v-for="ressource of rangeY.rows"
          :key="ressource.id"
          :style="{ height: rowHeight + 'px' }"
          class="t__fluid__calendar__ressource"
        >
          {{ ressource.label }}
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
      <span class="t__fluid__calendar__pointer"></span>
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
          <FluidCalendarBooking
            v-for="booking of visibleBookings"
            :key="booking.id"
            :booking="booking"
            :widthByMinute="widthByMinute"
            :rowHeight="rowHeight"
            :collisions="collisions"
            :y="ressourceToY(booking.ressourceId)"
            :x="dateToX(booking.start_at)"
          />
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
            <span>{{ format(cell.date) }}</span>
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
import dayjs from 'dayjs'

import gsap from 'gsap'

import FluidCalendarBooking from './FluidCalendarBooking.vue'
import FluidCalendarScroller from './FluidCalendarScroller.vue'
import FluidCalendarNavigator from './FluidCalendarNavigator.vue'

function generateRessources(num) {
  const entries = []
  for (let i = 1; i <= num; i++) {
    const id = i
    const label = i % 3 === 0 ? 'dolor' : i % 2 === 0 ? 'ipsum' : 'lorem'
    entries.push({ id, label: label + ' - ' + id })
  }
  return entries
}

function generateEntriesWithDetails(resources, num = 100) {
  const entriesWithDetails = []

  for (let i = 1; i <= num; i++) {
    const id = i
    const start_at = getRandomDateTime()
    const end_at = dayjs(start_at).add(getRandomNumber(1, 4), 'day').format()
    const label = `Lorem ipsum${i % 2 === 0 ? ' solor' : ''}`
    const ressourceId = resources[i % resources.length].id

    entriesWithDetails.push({ id, start_at, end_at, label, ressourceId })
  }

  return entriesWithDetails
}

function getRandomDateTime() {
  const year = 2023
  const month = getRandomNumber(6, 12)
  const day = getRandomNumber(1, 28)
  const hours = getRandomNumber(0, 23)
  const minutes = getRandomNumber(0, 59)
  const seconds = getRandomNumber(0, 59)

  return `${year}-${padZero(month)}-${padZero(day)}T${padZero(hours)}:${padZero(
    minutes,
  )}:${padZero(seconds)}+02:00`
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function padZero(number) {
  return number.toString().padStart(2, '0')
}

export default {
  name: 'FluidCalendar',
  components: {
    FluidCalendarBooking,
    FluidCalendarScroller,
    FluidCalendarNavigator,
  },
  props: {
    bookings: {
      type: Array,
      default: () => [],
    },
    ressources: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      collisions: [],
      dragData: null,
      selection: {},
      displayFR: false,
      debug: false,
      rangeDays: 5,
      threshold: 2,
      rowHeight: 40,
      moment: dayjs().format(),
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
        ressources: [],
      },
    }
  },
  async mounted() {
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
        // console.log('WWWW ', width, oldWidth)
        if (!oldWidth) {
          this.centerViewTo(dayjs().format(), false)
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
    _ressources() {
      return this.ressources.concat(this.fixtures.ressources)
    },
    fullHeight() {
      if (!this.filteredRessources || !this.filteredRessources.length) return 0
      return (this.filteredRessources.length + 1) * this.rowHeight
    },
    filteredRessources() {
      return this._ressources //.filter((f) => this.test.includes(f.id))
    },
    nbRessourcesDisplayed() {
      return Math.ceil(this.height / this.rowHeight)
    },
    visibleBookings() {
      if (!this._bookings) return []
      return this._bookings.filter((f) => {
        if (dayjs(f.start_at).isAfter(dayjs(this.rangeX.end))) return false
        if (dayjs(f.end_at).isBefore(dayjs(this.rangeX.start))) return false
        const visibleRessources = this.rangeY.rows.map((m) => m.id)
        return visibleRessources.includes(f.ressourceId)
      })
    },
    scroller() {
      const p = (this.positionX / this.width) * 100
      return p
      // if (this.$refs.timeline) {
      //   const timeline = this.$refs.timeline.getBoundingClientRect()
      //   return {
      //     left: timeline.left,
      //     width: timeline.width,
      //   }
      // }
    },
    // height() {
    //   if (!this.ressources) return 0
    //   return this.ressources.length * this.rowHeight
    // },
    pointerDate() {
      if (!this.rangeX) return
      const start = this.rangeX.start
      const dist =
        (this.translateX * -1) / this.widthByMinute + 125 / this.widthByMinute
      return dayjs(start).add(dist, 'minute').format()
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
      const ressources = this.filteredRessources
      if (!ressources) return {}
      const pointerY = this.decalY * -1
      return {
        // start: pointerY,
        // end: pointerY + this.nbRessourcesDisplayed,
        rows: ressources.slice(pointerY, pointerY + this.nbRessourcesDisplayed),
      }
    },
    rangeX() {
      const start = dayjs(dayjs(this.moment).startOf('day'))
        .add(
          -60 * 24 * (this.rangeDays + this.decalX * this.threshold),
          'minute',
        )
        .startOf('day')
        .format()
      const end = dayjs(dayjs(this.moment).startOf('day'))
        .add(
          60 * 24 * (this.rangeDays + 1 - this.decalX * this.threshold),
          'minute',
        )
        .endOf('day')
        .format()

      const diffInDays = dayjs(end).diff(dayjs(start), 'day')
      let cells = []
      for (let i = 0; i < diffInDays; i++) {
        const date = dayjs(start).add(i, 'day').format()
        const cell = {
          date: date,
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
    reset() {
      this.fixtures.ressources = []
      this.fixtures.bookings = []
    },
    generate() {
      // console.log(generateRessources(50))
      // this.ressources = []
      this.fixtures.ressources = generateRessources(getRandomNumber(2, 100))
      this.fixtures.bookings = generateEntriesWithDetails(
        this.fixtures.ressources,
        getRandomNumber(10, 2000),
      )
      this.positionY = 0
      // this.ressources = [...generateRessources(50)]
      // this.bookings = [
      //   ...generateEntriesWithDetails(generateRessources(50), 1000),
      // ]
      //   bookings: {
      //   type: Array,
      //   default: () => generateEntriesWithDetails(generateRessources(50), 1000),
      // },
      // ressources: {
      //   type: Array,
      //   default: () => generateRessources(50),
      // },
    },
    pointHasCollision(point) {
      // console.log('check collision ', point)
    },
    mousedown(event) {
      // this.selection = {}
      this.dragData = null
      const point = {
        x: event.clientX,
        y: event.clientY,
      }
      const data = this.pointToData(point)
      if (data.collision) {
        this.addCollision(data.collision.id)
        document.body.style.cursor = 'not-allowed'
      } else {
        this.dragData = [data]
        document.body.style.cursor = 'ew-resize'
      }

      // event.dataTransfer.setData('application/json', JSON.stringify(data))
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', this.drag)
      document.addEventListener('mouseup', this.endDrag)
      // console.log('Point => ', data)
      // const collision = this.pointHasCollision(point)
      // console.log('POINT TO DATA => ', this.pointToData(selection))
      // this.selection = data
    },
    // startDrag(event) {
    //   document.body.style.userSelect = 'none'
    //   document.addEventListener('mousemove', this.drag)
    //   document.addEventListener('mouseup', this.endDrag)
    // },
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
      if (current.ressource.id != this.dragData[0].ressource.id) return

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
          (this._ressources.length + 1) * this.rowHeight
        const nextY = this.positionY - y
        if (nextY > 0) {
          this.positionY = 0
          return
        }
        if (max < 0) {
          this.positionY =
            ((this._ressources.length + 1) * this.rowHeight - this.height) * -1
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
      // console.log('position => ', x, y)
      // this.scroll({ x: x, y: y })
      //
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

      this.rangeDays = Math.ceil(visibleDays)
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
      return dayjs(date).format('DD MMM YYYY')
    },
    ressourceToY(ressourceId) {
      const ressourceIndex = this.filteredRessources.findIndex(
        (f) => f.id === ressourceId,
      )
      return (ressourceIndex + 1) * this.rowHeight
    },
    pointToData({ x, y }) {
      const top =
        y -
        this.$refs.fluidCalendar.getBoundingClientRect().top +
        this.positionY * -1
      const date = this.xToDate(x)
      const ressource = this.yToRessource(top)
      const collision = this._bookings.find((f) => {
        return (
          f.ressourceId === ressource.id &&
          !dayjs(f.end_at).isBefore(dayjs(date), 'day') &&
          !dayjs(f.start_at).isAfter(dayjs(date), 'day')
        )
      })
      // console.log('Collision ', date, ressource, collision)
      return {
        date: date,
        ressource: ressource,
        x: this.dateToX(date),
        y: this.ressourceToY(this.yToRessource(top).id),
        collision: collision,
      }
      // console.log('coordsToData ', x, y)
    },
    yToRessource(top) {
      return this.filteredRessources[((top / this.rowHeight) | 0) - 1]
    },
    xToDate(x) {
      const zero =
        x -
        this.$refs.fluidCalendar.getBoundingClientRect().left -
        this.$refs.ressources.getBoundingClientRect().width
      const p = zero + this.translateX * -1
      const days = p / this.widthByMinute / 60 / 24
      const date = dayjs(this.rangeX.start)
        .add(days | 0, 'day')
        .format()
      return date
    },
    dateToX(date) {
      const diff = dayjs(date).diff(dayjs(this.rangeX.start), 'minute')
      return diff * this.widthByMinute
    },
    centerViewTo(date, animate = true) {
      const diff = dayjs(this.rangeX.start).diff(
        dayjs(date).startOf('day'),
        'minute',
      )
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

<style lang="scss">
:root {
  // @todo erase
  --border-w: 1px;
  --color-txt: #60668a;
  --color-title: #2b3363;
  --color-border: #eaebf3;
  --color-border-m: #dadeed;
  --color-bg1: #fff;
  --color-bg2: #f8fafe;
  --color-skeleton: #f2f5f9;
  --space: 12px;
  --radius: 0.4854rem;
  --scroller-height: 12px;
  --ressources-width: 16rem;
  --width-navigation-button: 0.75rem;

  --shadow-s: 1px 1px 3px rgba(187, 194, 202, 0.15);
  --shadow-m: 1px 1px 0.5rem rgba(187, 194, 202, 0.25);
  --shadow-xl: 0px 1px 4rem rgba(56, 60, 68, 0.05);
  --shadow-xxl: rgba(0, 0, 0, 0.1) 0px 25px 50px -12px;
  --shadow-xxl-strong: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;

  --color-focus: #1692ff;
  --color-focus-link: #1692ff;
  --color-focus-alpha: rgba(22, 146, 255, 0.15);
  --color-focus-shadow: rgba(22, 146, 255, 0.15);
  --color-focus-highlight: #2fabff;
  --color-focus-light: #ffffff;
  --color-focus-soft-light: #ffffff;
  --color-focus-soft-dark: #005daf;
  --color-focus-dark: #003462;
  --color-focus-readable: #ffffff;
  --color-focus-bright: #49c5ff;
  --color-focus-hover-light: #28a4ff;
  --color-focus-hover-dark: #0080f1;
  --color-focuslight: #e3f3ff;
  --color-focuslight-link: #7dc7ff;
  --color-focuslight-alpha: rgba(227, 243, 255, 0.15);
  --color-focuslight-shadow: rgba(227, 243, 255, 0.15);
  --color-focuslight-highlight: #fcffff;
  --color-focuslight-light: #ffffff;
  --color-focuslight-soft-light: #ffffff;
  --color-focuslight-soft-dark: #7dc7ff;
  --color-focuslight-dark: #30a6ff;
  --color-focuslight-readable: #000000;
  --color-focuslight-bright: #ffffff;
  --color-focuslight-hover-light: #f5ffff;
  --color-focuslight-hover-dark: #bfe4ff;
}
.t__frame__rate {
  color: white;
  position: fixed;
  // font-size: 1.25rem;
  background: rgba(0, 0, 0, 0.9);
  top: 0;
  right: 0;
  padding: 1rem;
  z-index: 99;
}
.t__debugg {
  pointer-events: none;
  font-size: 13px;
  line-height: 1.5;
  width: 20rem;
  position: fixed;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  color: white;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10;
}
.t__fluid__calendar {
  position: relative;
  display: grid;
  grid-template-columns: var(--ressources-width) calc(
      100% - var(--ressources-width)
    );
  overflow: hidden;
  color: var(--color-txt);
  margin-top: var(--space);
  border-bottom: solid var(--color-border-m) 0.5px;
  border-left: solid var(--color-border-m) 0.5px;

  &.--debug {
    max-width: 80rem;
    margin: var(--space) auto;
    overflow: visible;
    .t__fluid__calendar__ressources {
      opacity: 0.75;
    }
    &::before {
      pointer-events: none;
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      background: rgba(255, 0, 0, 0.05);
      z-index: 9;
    }
  }
}

.t__fluid__calendar__content {
  position: relative;
  z-index: 1;
}

.t__fluid__calendar__header {
  position: relative;
  display: flex;
  background: var(--color-bg2);
  z-index: 1;
  &::before {
    content: '';
    display: block;
    position: absolute;
    bottom: -0.5px;
    right: 0;
    left: 0;
    height: 0.5px;
    background: var(--color-border-m);
    z-index: 2;
  }
}
.t__fluid__calendar__inner {
  line-height: 0;
  height: 100000px;
}
.t__fluid__calendar__header__cell {
  // flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  padding: 0 var(--space);
  box-sizing: border-box;
  // font-size: 12px;
  > span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.t__fluid__calendar__content__translate {
  // position: relative;
}
.t__fluid__calendar__pointer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 125px;
  width: 1px;
  background: red;
  z-index: 9;
}
.t__fluid__calendar__header__grid {
  color: var(--color-border-m);
  position: absolute;
  width: 100%;
  z-index: 2;
}
.t__fluid__calendar__grid {
  height: 100%;
  width: 100%;
  color: var(--color-border-m);
}

.t__fluid__calendar__ressources {
  position: relative;
  z-index: 2;
  background: var(--color-bg1);
  border-top: solid var(--color-border-m) 0.5px;
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    right: calc(var(--space) * -0.75);
    bottom: 0;
    width: calc(var(--space) * 0.75);
    background: linear-gradient(
      90deg,
      var(--color-border) 0%,
      rgba(0, 0, 0, 0) 100%
    );
    opacity: 0.25;
  }
}

.t__fluid__calendar__ressources__header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 var(--space);
  z-index: 1;
  background: var(--color-bg1);
  &::before {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    height: 0.5px;
    background: var(--color-border-m);
    z-index: 2;
  }
}

.t__fluid__calendar__ressource {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 var(--space);
  color: var(--color-title);
  &::before {
    content: '';
    display: block;
    position: absolute;
    top: -0.5px;
    right: 0;
    left: 0;
    height: 0.5px;
    background: var(--color-border-m);
    z-index: 1;
  }
}
.t__fluid__calendar__scrollbar {
  position: absolute;
  background: var(--color-bg2);
  width: 100%;
  right: 0;
  bottom: 0;
  left: 0;
  padding-left: var(--ressources-width);
}
.t__fluid__calendar__scroll__area {
  position: relative;
  background: var(--color-border);
  height: var(--scroller-height);
}
.t__fluid__calendar__scroller {
  all: unset;
  position: absolute;
  left: 0;
  top: 50%;
  width: 2rem;
  height: calc(var(--scroller-height) - 2px);
  background: #fff;
  border-radius: 1rem;
  transform: translateY(-50%);
}

// .t__fluid__calendar__prev,
// .t__fluid__calendar__next {
//   all: unset;
//   position: relative;
//   z-index: 2;
//   background: var(--color-focuslight);
//   color: var(--color-focus-dark);
//   opacity: 0.25;
// }

.t__fluid__calendar__bookings {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.t__fluid__calendar__booking {
  position: absolute;
  width: 4rem;
}

.t__fluid__calendar__selection {
  // display: none;
  position: absolute;
  // width: 4rem;
  // height: 4rem;
  background: var(--color-focuslight);

  // border: solid var(--color-focus) 1px;
  // box-shadow: inset 0 0 0 1px var(--color-focus);
  z-index: 3;
  opacity: 0.4;
  // border-radius: 3px;
}

.t__fluid__calendar__ressources__inner,
.t__fluid__calendar__bookings,
.t__fluid__calendar__canva,
.t__fluid__calendar__inner {
  will-change: transform;
}
</style>
