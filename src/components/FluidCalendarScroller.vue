<template>
  <div class="t__fluid__calendar__navigate" :class="clss" ref="scroller">
    <div
      v-if="canScroll"
      class="t__fluid__calendar__navigate__btn"
      :class="clss"
      @mousedown="startDrag"
      :style="stl"
      ref="btn"
    ></div>
  </div>
</template>

<script>
import { wait } from '../utils.js'
export default {
  name: 'FluidCalendarScroller',
  props: {
    x: {
      type: Boolean,
      default: false,
    },
    y: {
      type: Boolean,
      default: false,
    },
    total: {
      type: Number,
    },
    position: {
      type: Number,
    },
    height: {
      type: Number,
    },
    // max: {
    //   type: Number,
    // },
  },
  emits: ['increment', 'position'],
  data() {
    return {
      dragging: false,
      initialX: 0,
      initialY: 0,
      offsetX: 0,
      offsetY: 0,
      diffX: 0,
      diffY: 0,
      tx: 0,
      ty: 0,
      center: 0,
      interval: null,
      canScroll: false,
      scrollerWidth: 0,
    }
  },
  watch: {
    total: {
      immediate: true,
      handler(value) {
        if (value === undefined) return
        this.canScroll = value > this.height
      },
    },
    position(position) {
      if (!this.total || !this.canScroll) return
      this.ty = this.toLocalPosition(position)
    },
  },
  computed: {
    stl() {
      const stl = []
      stl.push({ transform: `translate(${this.tx}px, ${this.ty}px)` })
      const p = (this.height / this.total) * 100
      const h = (this.height / 100) * p
      stl.push({ height: h + 'px' })
      return stl
    },
    clss() {
      const clss = []
      if (this.x) clss.push('--x')
      if (this.y) clss.push('--y')
      return clss
    },
  },
  methods: {
    async getHeight() {
      await wait(0)
      return this.$refs.scroller?.getBoundingClientRect().height
    },
    toCalendarPosition(position) {
      const scrollerHeight = this.$refs.scroller.getBoundingClientRect().height
      const btnHeight = this.$refs.btn.getBoundingClientRect().height
      const btnWidth = this.$refs.btn.getBoundingClientRect().width
      const p = (position / scrollerHeight) * 100
      const result =
        ((this.total - scrollerHeight + btnHeight + btnWidth) / 100) * p * -1
      return result
    },
    toLocalPosition(position) {
      const bh = this.$refs.btn.getBoundingClientRect().height
      const p = ((this.height - bh) / (this.total - this.height)) * 100
      const value = ((this.position * -1) / 100) * p
      return value
    },
    increment(arg) {
      this.$emit('increment', arg)
    },
    startDrag(event) {
      const btn = this.$refs.btn.getBoundingClientRect()
      this.dragging = true

      if (this.x) {
        this.initialX = this.total ? 0 : this.tx
        this.diffX = event.clientX - btn.left
      }

      if (this.y) {
        this.initialY = this.total ? 0 : this.ty
        this.diffY = event.clientY - btn.top
      }

      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', this.drag)
      document.addEventListener('mouseup', this.endDrag)
    },
    drag(event) {
      if (this.dragging) {
        const btn = this.$refs.btn.getBoundingClientRect()
        const position = this.$refs.scroller.getBoundingClientRect()
        if (this.x) {
          const incX = event.clientX - position.left - this.diffX
          const min = 0
          const max = position.width - btn.width
          if (incX <= min) {
            this.tx = 0
          } else if (incX >= max) {
            this.tx = max
          } else {
            this.tx = incX
          }
        }
        if (this.y) {
          const incY = event.clientY - position.top - this.diffY
          const min = 0
          const max = position.height - btn.height
          // console.log('INCY => ', incY, max)
          let move
          if (incY <= min) {
            move = 0
          } else if (incY >= max) {
            move = max
          } else {
            move = incY
          }
          this.$emit('position', { y: this.toCalendarPosition(move) })
        }
      }
    },
    endDrag() {
      clearInterval(this.interval)
      this.dragging = false

      document.body.style.userSelect = 'auto'
      document.removeEventListener('mousemove', this.drag)
      document.removeEventListener('mouseup', this.endDrag)
    },
  },
}
</script>
