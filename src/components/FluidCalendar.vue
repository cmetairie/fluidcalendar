<template>
  <div
    class="t__fluid__calendar__wrapper"
    ref="wrapper"
    :class="{ '--debug': debug }"
  >
    <div v-if="displayFR" class="t__frame__rate">
      <span v-if="bookings">{{ bookings.length }} rézas</span>
      <br />
      <span v-if="bookables">{{ bookables.length }} bookables</span>
      <br />
      {{ frameRate }} FPS
    </div>
    <FluidCalendarDesktop
      v-if="desktop"
      v-bind="$props"
      :h="h"
      :w="w"
      @updateDate="(v) => $emit('updateDate', v)"
      @updateDebouncedDate="(v) => $emit('updateDebouncedDate', v)"
      @updateRange="(v) => $emit('updateRange', v)"
      @updateDebouncedRange="(v) => $emit('updateDebouncedRange', v)"
      @openBooking="(v) => $emit('openBooking', v)"
      @createNewBooking="(v) => $emit('createNewBooking', v)"
      @updateBooking="(v) => $emit('updateBooking', v)"
    >
      <template #date="{date}">
        <slot name="date" :date="date" />
      </template>
      <template #booking="{booking}">
        <slot name="booking" :booking="booking" />
      </template>
      <template #bookable="{bookable}">
        <slot name="bookable" :bookable="bookable" />
      </template>
    </FluidCalendarDesktop>
    <FluidCalendarMobile
      v-if="mobile"
      v-bind="$props"
      :h="h"
      :w="w"
      @updateDate="(v) => $emit('updateDate', v)"
      @updateRange="(v) => $emit('updateRange', v)"
      @openBooking="(v) => $emit('openBooking', v)"
    >
      <template #date="{date}">
        <slot name="date" :date="date" />
      </template>
      <template #booking="{booking}">
        <slot name="booking" :booking="booking" />
      </template>
      <template #bookable="{bookable}">
        <slot name="bookable" :bookable="bookable" />
      </template>
    </FluidCalendarMobile>
  </div>
</template>

<script>
import FluidCalendarDesktop from './FluidCalendarDesktop.vue'
import FluidCalendarMobile from './FluidCalendarMobile.vue'

export default {
  name: 'FluidCalendar',
  components: { FluidCalendarDesktop, FluidCalendarMobile },
  emits: [
    'updateDate',
    'updateRange',
    'openBooking',
    'updateDebouncedDate',
    'updateDebouncedRange',
    'createNewBooking',
    'updateBooking',
  ],
  props: {
    lang: {
      type: String,
      default: 'fr',
    },
    bookableType: {
      type: Object,
      default: () => {},
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
      default: '00:00',
    },
    slotMaxTime: {
      type: String,
      default: '23:59',
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['updateDate', 'updateRange'],
  data() {
    return {
      displayFR: false,
      mobile: false,
      desktop: false,
      h: 0,
      w: 0,
      frameRate: 0,
      frameCount: 0,
      lastFrameTime: performance.now(),
    }
  },
  async mounted() {
    // console.log('*** MOUNT FLUID CALENDAR ***')
    if (this.displayFR) {
      this.updateFrameRate()
    }
    window.addEventListener('resize', this.manageSize)
    this.manageSize()
  },
  methods: {
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
      const wrapper = this.$refs.wrapper.getBoundingClientRect()
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight,
      )
      // console.log('Wrapper top ?', wrapper.top, wrapper.bottom)
      // const documentHeight = d - wrapper.top * 2
      // console.log('*** documentHeight => ', d, documentHeight)
      const documentWidth = window.innerWidth - wrapper.left * 2
      const coords = this.$refs.wrapper?.getBoundingClientRect()
      // console.log('Coords => ', coords.y)
      if (coords) {
        const w = coords.width
        if (w > 800) {
          this.mobile = false
          this.desktop = true
        } else {
          this.mobile = true
          this.desktop = false
        }

        this.h = this.debug ? documentHeight - 150 : documentHeight
        this.w = documentWidth
      }
    },
  },
}
</script>
