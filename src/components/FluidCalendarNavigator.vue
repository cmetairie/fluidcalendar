<template>
  <div class="t__fluid__calendar__navigate" :class="clss" ref="scroller">
    <div
      v-if="canScroll"
      class="t__fluid__calendar__navigate__btn"
      :class="clss"
      @mousedown="startDrag"
      :style="{ transform: `translate(${tx}px, ${ty}px)` }"
      ref="btn"
    >
      <!-- {{ faking }} -->
      <svg
        v-if="!total"
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
      <svg
        v-if="!total"
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
    </div>
  </div>
</template>

<script>
import gsap from 'gsap'

import { wait } from '../utils.js'
export default {
  name: 'FluidCalendarNavigator',
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
    faking: {
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
      canScroll: true,
      scrollerWidth: 0,
    }
  },
  watch: {
    total: {
      immediate: true,
      async handler(value) {
        if (value === undefined) return
        await wait(0)
        const scrollerHeight = this.$refs.scroller.getBoundingClientRect()
          .height

        this.canScroll = scrollerHeight !== value

        // console.log('Watch total ', scrollerHeight, value)
      },
    },
    faking(value) {
      return
      const v = Math.floor(value / 10)
      //   const btn = this.$refs.btn.getBoundingClientRect()
      //   const position = this.$refs.scroller.getBoundingClientRect()
      //   //   const incX = event.clientX - position.left - this.diffX
      //   const min = 0
      //   const max = position.width - btn.width
      //   if (incX <= min) {
      //     this.tx = 0
      //   } else if (incX >= max) {
      //     this.tx = max
      //   } else {
      //     this.tx = incX
      //   }
      if (v) {
        this.tx = this.tx + v
      } else {
        const interpolation = { value: this.tx }
        gsap.to(interpolation, {
          value: this.initialX,
          onUpdate: () => {
            this.tx = interpolation.value
            // this.$emit('increment', {
            //   x: (interpolation.value - this.initialX) / 5,
            // })
          },
          duration: 0.25,
        })
      }
      console.log('CHECKE FAKING => ', v)
    },
    position(position) {
      if (!this.total || !this.canScroll) return
      this.ty = this.toLocalPosition(position)
    },
  },
  mounted() {
    this.init()
  },
  computed: {
    clss() {
      const clss = []
      if (this.x) clss.push('--x')
      if (this.y) clss.push('--y')
      if (!this.total) clss.push('--grab')
      return clss
    },
  },
  methods: {
    async init() {
      if (this.total) return
      await wait(0)
      if (this.x) {
        const scrollerWidth = this.$refs.scroller.getBoundingClientRect().width
        const btnWidth = this.$refs.btn.getBoundingClientRect().width
        const positionX = scrollerWidth / 2 - btnWidth / 2
        this.tx = positionX
      }
      if (this.y) {
        const scrollerHeight = this.$refs.scroller.getBoundingClientRect()
          .height
        const btnHeight = this.$refs.btn.getBoundingClientRect().height
        const positionY = scrollerHeight / 2 - btnHeight / 2
        this.ty = positionY
      }
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
      const scrollerHeight = this.$refs.scroller.getBoundingClientRect().height
      const btnHeight = this.$refs.btn.getBoundingClientRect().height
      const btnWidth = this.$refs.btn.getBoundingClientRect().width
      const p =
        ((scrollerHeight - btnHeight - btnWidth) /
          (this.total - scrollerHeight)) *
        100
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
          if (!this.total) {
            clearInterval(this.interval)
            this.interval = setInterval(
              () => this.increment({ x: (incX - this.initialX) / 5 }),
              10,
            )
          }
        }
        if (this.y) {
          const incY = event.clientY - position.top - this.diffY
          const min = 0
          const max = position.height - btn.height
          let move
          if (incY <= min) {
            move = 0
          } else if (incY >= max) {
            move = max
          } else {
            move = incY
          }
          if (!this.total) {
            this.ty = move
            clearInterval(this.interval)
            this.interval = setInterval(
              () => this.increment({ y: (incY - this.initialY) / 5 }),
              10,
            )
          } else {
            this.$emit('position', { y: this.toCalendarPosition(move) })
          }
        }
      }
    },
    endDrag() {
      clearInterval(this.interval)
      this.dragging = false
      if (this.x) {
        if (!this.total) {
          const interpolation = { value: this.tx }
          gsap.to(interpolation, {
            value: this.initialX,
            onUpdate: () => {
              this.tx = interpolation.value
              this.$emit('increment', {
                x: (interpolation.value - this.initialX) / 5,
              })
            },
            duration: 0.15,
          })
        }
      }

      if (this.y) {
        if (!this.total) {
          const interpolation = { value: this.ty }
          gsap.to(interpolation, {
            value: this.initialY,
            onUpdate: () => {
              this.ty = interpolation.value
              this.$emit('increment', {
                y: (interpolation.value - this.initialY) / 10,
              })
            },
            duration: 0.15,
          })
        }
      }

      document.body.style.userSelect = 'auto'
      //   document.body.style.pointerEvents = 'auto'
      document.removeEventListener('mousemove', this.drag)
      document.removeEventListener('mouseup', this.endDrag)
    },
  },
}
</script>

<style lang="scss">
.t__fluid__calendar__navigate {
  position: absolute;
  overflow: visible;
  //   background: rgba(0, 0, 0, 0.05);
  z-index: 2;
  &.--x {
    right: 0;
    bottom: 0;
    left: var(--ressources-width);
    height: 0; //;var(--width-navigation-button);
  }
  &.--y {
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--width-navigation-button);
  }
}
.t__fluid__calendar__navigate__btn {
  //   all: unset;
  //   transform-origin: center center;
  //   background: red;
  background: var(--color-title);
  //   border: solid var(--color-txt) 1
  border-radius: var(--width-navigation-button);
  &.--x {
    margin-top: 1px;
    height: calc(var(--width-navigation-button) - 2px);
    width: calc(var(--width-navigation-button) * 3);
  }
  &.--y {
    margin-left: 1px;
    width: calc(var(--width-navigation-button) - 2px);
    height: calc(var(--width-navigation-button) * 3);
  }
  &.--grab {
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0;
    border: solid var(--color-border) 1px;
    color: #fff;
    background: var(--color-title);
    position: absolute;
    left: 0;
    top: -2.2rem;
    height: 2.25rem;
    width: 2.25rem;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 0 1rem rgba(187, 194, 202, 0.25);
    padding: 0 0.5rem;
    // transform: scale(0.9);
    svg {
      opacity: 0.75;
    }
    // &:hover {
    //   transform: scale(1);
    // }
    &:active {
      cursor: grabbing;
    }
  }
}
</style>
