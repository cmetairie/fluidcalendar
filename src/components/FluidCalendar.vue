<template>
  <div class="t__fluid__calendar__wrapper" ref="wrapper">
    <FluidCalendarDesktop
      v-if="desktop"
      v-bind="$props"
      @updateDate="(v) => $emit('updateDate', v)"
      @updateRange="(v) => $emit('updateRange', v)"
      @clickBooking="(v) => $emit('clickBooking', v)"
    />
    <FluidCalendarMobile
      v-if="mobile"
      v-bind="$props"
      @updateDate="(v) => $emit('updateDate', v)"
      @updateRange="(v) => $emit('updateRange', v)"
      @clickBooking="(v) => $emit('clickBooking', v)"
    />
  </div>
</template>

<script>
import FluidCalendarDesktop from './FluidCalendarDesktop.vue'
import FluidCalendarMobile from './FluidCalendarMobile.vue'

export default {
  name: 'FluidCalendar',
  components: { FluidCalendarDesktop, FluidCalendarMobile },
  emits: ['updateDate', 'updateRange', 'clickBooking'],
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
      mobile: false,
      desktop: false,
    }
  },
  async mounted() {
    window.addEventListener('resize', this.manageSize)
    this.manageSize()
  },
  methods: {
    manageSize() {
      const coords = this.$refs.wrapper?.getBoundingClientRect()
      if (coords) {
        const w = coords.width
        if (w > 800) {
          this.mobile = false
          this.desktop = true
        } else {
          this.mobile = true
          this.desktop = false
        }
        // console.log('COORDS => ', coords.width)
      }
    },
  },
}
</script>
