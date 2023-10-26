<template>
  <div class="t__fluid__calendar__booking" :style="stl" :class="clss">
    <div class="t__fluid__calendar__booking__inner">
      <span class="t__fluid__calendar__booking__label">
        <span>{{ format(booking.start_at) }}</span>
        <span>{{ format(booking.end_at) }}</span>
      </span>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
export default {
  name: 'FluidCalendarBooking',
  props: {
    booking: {
      type: Object,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
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
  },
  computed: {
    clss() {
      const clss = []
      if (this.collisions.includes(this.booking.id)) clss.push('--collision')
      return clss
    },
    stl() {
      const stl = []
      stl.push({ transform: `translate(${this.x}px, ${this.y}px)` })
      stl.push({ width: this.width + 'px' })
      stl.push({ height: this.rowHeight + 'px' })
      return stl
    },
    width() {
      const diff = dayjs(this.booking.end_at).diff(
        dayjs(this.booking.start_at),
        'minute',
      )
      return diff * this.widthByMinute
    },
  },
  methods: {
    format(date) {
      return dayjs(date).format('DD MMM')
    },
  },
}
</script>

<style lang="scss">
.t__fluid__calendar__booking {
  display: flex;
  padding: 3px 0;
  box-sizing: border-box;
  &.--collision {
    .t__fluid__calendar__booking__inner {
      animation: minishake 0.85s;
    }
  }
  // animation: fade 0.5s;
}
.t__fluid__calendar__booking__inner {
  // cursor: pointer;
  flex: 1;
  display: flex;
  align-items: center;
  background: #e2f0ff;
  border: solid #b9dbff 2px;
  border-radius: var(--radius);
  padding: 0 calc(var(--space) * 0.75);
  box-sizing: border-box;
  max-width: 100%;
}
.t__fluid__calendar__booking__label {
  // user-select: none;
  white-space: nowrap;
  overflow: hidden;
  // text-overflow: ellipsis;
  // @todo Erase after
  font-size: 12px;
  font-weight: 500;
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

@keyframes minishake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-2px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(2px, 0, 0);
  }
}
</style>
