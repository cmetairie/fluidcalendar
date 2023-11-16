<template>
  <div class="t__fluid__calendar__mobile">
    <header class="t__fluid__calendar__mobile__header">
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
  </div>
</template>

<script>
export default {
  name: 'FluidCalendarMobile',
  data() {
    return {
      _bookings: [],
      _bookables: [],
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
  },
  mounted() {
    this._bookings = [...this.bookings]
    this._bookables = [...this.bookables]
    this.selectedBookable = this._bookables[0]
  },
  computed: {},
  methods: {},
}
</script>
