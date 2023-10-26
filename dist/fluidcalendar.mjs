import dayjs from 'dayjs';
import gsap from 'gsap';
import { openBlock, createElementBlock, normalizeClass, normalizeStyle, createElementVNode, toDisplayString, createCommentVNode, resolveComponent, Fragment, createTextVNode, renderList, createVNode, createBlock } from 'vue';

var script$3 = {
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
      const clss = [];
      if (this.collisions.includes(this.booking.id)) clss.push('--collision');
      return clss
    },
    stl() {
      const stl = [];
      stl.push({ transform: `translate(${this.x}px, ${this.y}px)` });
      stl.push({ width: this.width + 'px' });
      stl.push({ height: this.rowHeight + 'px' });
      return stl
    },
    width() {
      const diff = dayjs(this.booking.end_at).diff(
        dayjs(this.booking.start_at),
        'minute',
      );
      return diff * this.widthByMinute
    },
  },
  methods: {
    format(date) {
      return dayjs(date).format('DD MMM')
    },
  },
};

const _hoisted_1$2 = { class: "t__fluid__calendar__booking__inner" };
const _hoisted_2$2 = { class: "t__fluid__calendar__booking__label" };

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["t__fluid__calendar__booking", $options.clss]),
    style: normalizeStyle($options.stl)
  }, [
    createElementVNode("div", _hoisted_1$2, [
      createElementVNode("span", _hoisted_2$2, [
        createElementVNode("span", null, toDisplayString($options.format($props.booking.start_at)), 1 /* TEXT */),
        createElementVNode("span", null, toDisplayString($options.format($props.booking.end_at)), 1 /* TEXT */)
      ])
    ])
  ], 6 /* CLASS, STYLE */))
}

script$3.render = render$3;
script$3.__file = "src/components/FluidCalendarBooking.vue";

function wait(secondes) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(timer);
    }, secondes * 1000);
  })
}

var script$2 = {
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
        this.canScroll = value > this.height;
      },
    },
    position(position) {
      if (!this.total || !this.canScroll) return
      this.ty = this.toLocalPosition(position);
    },
  },
  computed: {
    stl() {
      const stl = [];
      stl.push({ transform: `translate(${this.tx}px, ${this.ty}px)` });
      const p = (this.height / this.total) * 100;
      const h = (this.height / 100) * p;
      stl.push({ height: h + 'px' });
      return stl
    },
    clss() {
      const clss = [];
      if (this.x) clss.push('--x');
      if (this.y) clss.push('--y');
      return clss
    },
  },
  methods: {
    async getHeight() {
      await wait(0);
      return this.$refs.scroller?.getBoundingClientRect().height
    },
    toCalendarPosition(position) {
      const scrollerHeight = this.$refs.scroller.getBoundingClientRect().height;
      const btnHeight = this.$refs.btn.getBoundingClientRect().height;
      const btnWidth = this.$refs.btn.getBoundingClientRect().width;
      const p = (position / scrollerHeight) * 100;
      const result =
        ((this.total - scrollerHeight + btnHeight + btnWidth) / 100) * p * -1;
      // console.log()
      return result
    },
    toLocalPosition(position) {
      const bh = this.$refs.btn.getBoundingClientRect().height;
      const p = ((this.height - bh) / (this.total - this.height)) * 100;
      const value = ((this.position * -1) / 100) * p;
      return value
    },
    increment(arg) {
      this.$emit('increment', arg);
    },
    startDrag(event) {
      const btn = this.$refs.btn.getBoundingClientRect();
      this.dragging = true;

      if (this.x) {
        this.initialX = this.total ? 0 : this.tx;
        this.diffX = event.clientX - btn.left;
      }

      if (this.y) {
        this.initialY = this.total ? 0 : this.ty;
        this.diffY = event.clientY - btn.top;
      }

      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.endDrag);
    },
    drag(event) {
      if (this.dragging) {
        const btn = this.$refs.btn.getBoundingClientRect();
        const position = this.$refs.scroller.getBoundingClientRect();
        if (this.x) {
          const incX = event.clientX - position.left - this.diffX;
          const min = 0;
          const max = position.width - btn.width;
          if (incX <= min) {
            this.tx = 0;
          } else if (incX >= max) {
            this.tx = max;
          } else {
            this.tx = incX;
          }
        }
        if (this.y) {
          const incY = event.clientY - position.top - this.diffY;
          const min = 0;
          const max = position.height - btn.height;
          console.log('INCY => ', incY, max);
          let move;
          if (incY <= min) {
            move = 0;
          } else if (incY >= max) {
            move = max;
          } else {
            move = incY;
          }
          this.$emit('position', { y: this.toCalendarPosition(move) });
        }
      }
    },
    endDrag() {
      clearInterval(this.interval);
      this.dragging = false;

      document.body.style.userSelect = 'auto';
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.endDrag);
    },
  },
};

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["t__fluid__calendar__navigate", $options.clss]),
    ref: "scroller"
  }, [
    ($data.canScroll)
      ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["t__fluid__calendar__navigate__btn", $options.clss]),
          onMousedown: _cache[0] || (_cache[0] = (...args) => ($options.startDrag && $options.startDrag(...args))),
          style: normalizeStyle($options.stl),
          ref: "btn"
        }, null, 38 /* CLASS, STYLE, HYDRATE_EVENTS */))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$2.render = render$2;
script$2.__file = "src/components/FluidCalendarScroller.vue";

var script$1 = {
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
        await wait(0);
        const scrollerHeight = this.$refs.scroller.getBoundingClientRect()
          .height;

        this.canScroll = scrollerHeight !== value;

        // console.log('Watch total ', scrollerHeight, value)
      },
    },
    faking(value) {
      return
    },
    position(position) {
      if (!this.total || !this.canScroll) return
      this.ty = this.toLocalPosition(position);
    },
  },
  mounted() {
    this.init();
  },
  computed: {
    clss() {
      const clss = [];
      if (this.x) clss.push('--x');
      if (this.y) clss.push('--y');
      if (!this.total) clss.push('--grab');
      return clss
    },
  },
  methods: {
    async init() {
      if (this.total) return
      await wait(0);
      if (this.x) {
        const scrollerWidth = this.$refs.scroller.getBoundingClientRect().width;
        const btnWidth = this.$refs.btn.getBoundingClientRect().width;
        const positionX = scrollerWidth / 2 - btnWidth / 2;
        this.tx = positionX;
      }
      if (this.y) {
        const scrollerHeight = this.$refs.scroller.getBoundingClientRect()
          .height;
        const btnHeight = this.$refs.btn.getBoundingClientRect().height;
        const positionY = scrollerHeight / 2 - btnHeight / 2;
        this.ty = positionY;
      }
    },
    toCalendarPosition(position) {
      const scrollerHeight = this.$refs.scroller.getBoundingClientRect().height;
      const btnHeight = this.$refs.btn.getBoundingClientRect().height;
      const btnWidth = this.$refs.btn.getBoundingClientRect().width;
      const p = (position / scrollerHeight) * 100;
      const result =
        ((this.total - scrollerHeight + btnHeight + btnWidth) / 100) * p * -1;
      return result
    },
    toLocalPosition(position) {
      const scrollerHeight = this.$refs.scroller.getBoundingClientRect().height;
      const btnHeight = this.$refs.btn.getBoundingClientRect().height;
      const btnWidth = this.$refs.btn.getBoundingClientRect().width;
      const p =
        ((scrollerHeight - btnHeight - btnWidth) /
          (this.total - scrollerHeight)) *
        100;
      const value = ((this.position * -1) / 100) * p;
      return value
    },
    increment(arg) {
      this.$emit('increment', arg);
    },
    startDrag(event) {
      const btn = this.$refs.btn.getBoundingClientRect();
      this.dragging = true;

      if (this.x) {
        this.initialX = this.total ? 0 : this.tx;
        this.diffX = event.clientX - btn.left;
      }

      if (this.y) {
        this.initialY = this.total ? 0 : this.ty;
        this.diffY = event.clientY - btn.top;
      }

      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.endDrag);
    },
    drag(event) {
      if (this.dragging) {
        const btn = this.$refs.btn.getBoundingClientRect();
        const position = this.$refs.scroller.getBoundingClientRect();
        if (this.x) {
          const incX = event.clientX - position.left - this.diffX;
          const min = 0;
          const max = position.width - btn.width;
          if (incX <= min) {
            this.tx = 0;
          } else if (incX >= max) {
            this.tx = max;
          } else {
            this.tx = incX;
          }
          if (!this.total) {
            clearInterval(this.interval);
            this.interval = setInterval(
              () => this.increment({ x: (incX - this.initialX) / 5 }),
              10,
            );
          }
        }
        if (this.y) {
          const incY = event.clientY - position.top - this.diffY;
          const min = 0;
          const max = position.height - btn.height;
          let move;
          if (incY <= min) {
            move = 0;
          } else if (incY >= max) {
            move = max;
          } else {
            move = incY;
          }
          if (!this.total) {
            this.ty = move;
            clearInterval(this.interval);
            this.interval = setInterval(
              () => this.increment({ y: (incY - this.initialY) / 5 }),
              10,
            );
          } else {
            this.$emit('position', { y: this.toCalendarPosition(move) });
          }
        }
      }
    },
    endDrag() {
      clearInterval(this.interval);
      this.dragging = false;
      if (this.x) {
        if (!this.total) {
          const interpolation = { value: this.tx };
          gsap.to(interpolation, {
            value: this.initialX,
            onUpdate: () => {
              this.tx = interpolation.value;
              this.$emit('increment', {
                x: (interpolation.value - this.initialX) / 5,
              });
            },
            duration: 0.15,
          });
        }
      }

      if (this.y) {
        if (!this.total) {
          const interpolation = { value: this.ty };
          gsap.to(interpolation, {
            value: this.initialY,
            onUpdate: () => {
              this.ty = interpolation.value;
              this.$emit('increment', {
                y: (interpolation.value - this.initialY) / 10,
              });
            },
            duration: 0.15,
          });
        }
      }

      document.body.style.userSelect = 'auto';
      //   document.body.style.pointerEvents = 'auto'
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.endDrag);
    },
  },
};

const _hoisted_1$1 = {
  key: 0,
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  class: "lucide lucide-chevron-left"
};
const _hoisted_2$1 = /*#__PURE__*/createElementVNode("path", { d: "m15 18-6-6 6-6" }, null, -1 /* HOISTED */);
const _hoisted_3$1 = [
  _hoisted_2$1
];
const _hoisted_4$1 = {
  key: 1,
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  class: "lucide lucide-chevron-right"
};
const _hoisted_5$1 = /*#__PURE__*/createElementVNode("path", { d: "m9 18 6-6-6-6" }, null, -1 /* HOISTED */);
const _hoisted_6$1 = [
  _hoisted_5$1
];

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["t__fluid__calendar__navigate", $options.clss]),
    ref: "scroller"
  }, [
    ($data.canScroll)
      ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["t__fluid__calendar__navigate__btn", $options.clss]),
          onMousedown: _cache[0] || (_cache[0] = (...args) => ($options.startDrag && $options.startDrag(...args))),
          style: normalizeStyle({ transform: `translate(${$data.tx}px, ${$data.ty}px)` }),
          ref: "btn"
        }, [
          createCommentVNode(" {{ faking }} "),
          (!$props.total)
            ? (openBlock(), createElementBlock("svg", _hoisted_1$1, [..._hoisted_3$1]))
            : createCommentVNode("v-if", true),
          (!$props.total)
            ? (openBlock(), createElementBlock("svg", _hoisted_4$1, [..._hoisted_6$1]))
            : createCommentVNode("v-if", true)
        ], 38 /* CLASS, STYLE, HYDRATE_EVENTS */))
      : createCommentVNode("v-if", true)
  ], 2 /* CLASS */))
}

script$1.render = render$1;
script$1.__file = "src/components/FluidCalendarNavigator.vue";

function generateRessources(num) {
  const entries = [];
  for (let i = 1; i <= num; i++) {
    const id = i;
    const label = i % 3 === 0 ? 'dolor' : i % 2 === 0 ? 'ipsum' : 'lorem';
    entries.push({ id, label: label + ' - ' + id });
  }
  return entries
}

function generateEntriesWithDetails(resources, num = 100) {
  const entriesWithDetails = [];

  for (let i = 1; i <= num; i++) {
    const id = i;
    const start_at = getRandomDateTime();
    const end_at = dayjs(start_at).add(getRandomNumber(1, 4), 'day').format();
    const label = `Lorem ipsum${i % 2 === 0 ? ' solor' : ''}`;
    const ressourceId = resources[i % resources.length].id;

    entriesWithDetails.push({ id, start_at, end_at, label, ressourceId });
  }

  return entriesWithDetails
}

function getRandomDateTime() {
  const year = 2023;
  const month = getRandomNumber(6, 12);
  const day = getRandomNumber(1, 28);
  const hours = getRandomNumber(0, 23);
  const minutes = getRandomNumber(0, 59);
  const seconds = getRandomNumber(0, 59);

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

var script = {
  name: 'FluidCalendar',
  components: {
    FluidCalendarBooking: script$3,
    FluidCalendarScroller: script$2,
    FluidCalendarNavigator: script$1,
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
      this.updateFrameRate();
    }
    this.$refs.fluidCalendar.addEventListener('wheel', (e) => {
      e.preventDefault();
      const speedX = e.deltaX * 0.75;
      const speedY = this.fullHeight > this.height ? e.deltaY * 0.75 : 0;

      const scroller = {};

      if (speedX) scroller.x = speedX;
      if (speedY) scroller.y = speedY;

      this.scroll(scroller);
      return
    });

    window.addEventListener('resize', this.manageSize);
    this.manageSize();
    this.generate();
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
          this.centerViewTo(dayjs().format(), false);
        }
        if (this.zooming) ;
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
        const visibleRessources = this.rangeY.rows.map((m) => m.id);
        return visibleRessources.includes(f.ressourceId)
      })
    },
    scroller() {
      const p = (this.positionX / this.width) * 100;
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
      const start = this.rangeX.start;
      const dist =
        (this.translateX * -1) / this.widthByMinute + 125 / this.widthByMinute;
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
      const d = this.positionX / this.widthByMinute / 60 / 24;
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
      const ressources = this.filteredRessources;
      if (!ressources) return {}
      const pointerY = this.decalY * -1;
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
        .format();
      const end = dayjs(dayjs(this.moment).startOf('day'))
        .add(
          60 * 24 * (this.rangeDays + 1 - this.decalX * this.threshold),
          'minute',
        )
        .endOf('day')
        .format();

      const diffInDays = dayjs(end).diff(dayjs(start), 'day');
      let cells = [];
      for (let i = 0; i < diffInDays; i++) {
        const date = dayjs(start).add(i, 'day').format();
        const cell = {
          date: date,
        };
        cells.push(cell);
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
      this.fixtures.ressources = [];
      this.fixtures.bookings = [];
    },
    generate() {
      // console.log(generateRessources(50))
      // this.ressources = []
      this.fixtures.ressources = generateRessources(getRandomNumber(2, 100));
      this.fixtures.bookings = generateEntriesWithDetails(
        this.fixtures.ressources,
        getRandomNumber(10, 2000),
      );
      this.positionY = 0;
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
      this.dragData = null;
      const point = {
        x: event.clientX,
        y: event.clientY,
      };
      const data = this.pointToData(point);
      if (data.collision) {
        this.addCollision(data.collision.id);
        document.body.style.cursor = 'not-allowed';
      } else {
        this.dragData = [data];
        document.body.style.cursor = 'ew-resize';
      }

      // event.dataTransfer.setData('application/json', JSON.stringify(data))
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.endDrag);
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
      this.dragData;
      const point = {
        x: event.clientX,
        y: event.clientY,
      };
      const current = this.pointToData(point);

      if (current.collision) {
        document.body.style.cursor = 'not-allowed';
        this.addCollision(current.collision.id);
        return
      }
      if (current.ressource.id != this.dragData[0].ressource.id) return

      const exist = this.dragData.find((f) =>
        dayjs(f.date).isSame(dayjs(current.date), 'day'),
      );

      if (exist) return

      // const isBefore =

      this.dragData.push(current);

      console.log('ok to add ', current);
      // if (data.collision) return // Collision
      // const data = event.dataTransfer.getData('application/json')
      // console.log('Drag ', event, this.dragData)
    },
    endDrag(event) {
      this.collisions = [];
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      //   document.body.style.pointerEvents = 'auto'
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.endDrag);
      // this.dragData = null
    },
    addCollision(id) {
      if (this.collisions.includes(id)) return
      this.collisions.push(id);
    },
    scroll({ x, y }) {
      this.dragData = null;
      if (x != undefined) {
        this.fakeMove = x;
        this.positionX = this.positionX - x;
        this.pointer = this.positionX * -1;
      }

      if (y != undefined) {
        const max =
          this.positionY -
          this.height +
          (this._ressources.length + 1) * this.rowHeight;
        const nextY = this.positionY - y;
        if (nextY > 0) {
          this.positionY = 0;
          return
        }
        if (max < 0) {
          this.positionY =
            ((this._ressources.length + 1) * this.rowHeight - this.height) * -1;
        }

        this.positionY = this.positionY - y;
      }
    },
    navIncrement({ x, y }) {
      this.scroll({ x: x, y: y });
    },
    navPosition({ x, y }) {
      if (y != undefined) {
        this.positionY = y;
      }
      // console.log('position => ', x, y)
      // this.scroll({ x: x, y: y })
      //
    },
    updateFrameRate() {
      const currentTime = performance.now();
      const elapsedTime = currentTime - this.lastFrameTime;
      if (elapsedTime >= 500) {
        this.frameRate = Math.round((this.frameCount / elapsedTime) * 1000);
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }
      this.frameCount++;
      requestAnimationFrame(this.updateFrameRate);
    },
    manageSize() {
      const documentHeight = window.innerHeight;
      const coords = this.$refs.fluidCalendar.getBoundingClientRect();

      const widthByDay = this.widthByMinute * 60 * 24;

      const visibleDays = coords.width / widthByDay;

      this.rangeDays = Math.ceil(visibleDays);
      // console.log('COORDS => ', this.rangeDays)

      this.height = this.debug
        ? documentHeight - coords.y - 150
        : documentHeight - coords.y;
    },
    prev() {
      const date = dayjs(this.pointerDate).add(-5, 'day').format();
      this.centerViewTo(date);
    },
    next() {
      const date = dayjs(this.pointerDate).add(5, 'day').format();
      this.centerViewTo(date);
    },
    format(date) {
      return dayjs(date).format('DD MMM YYYY')
    },
    ressourceToY(ressourceId) {
      const ressourceIndex = this.filteredRessources.findIndex(
        (f) => f.id === ressourceId,
      );
      return (ressourceIndex + 1) * this.rowHeight
    },
    pointToData({ x, y }) {
      const top =
        y -
        this.$refs.fluidCalendar.getBoundingClientRect().top +
        this.positionY * -1;
      const date = this.xToDate(x);
      const ressource = this.yToRessource(top);
      const collision = this._bookings.find((f) => {
        return (
          f.ressourceId === ressource.id &&
          !dayjs(f.end_at).isBefore(dayjs(date), 'day') &&
          !dayjs(f.start_at).isAfter(dayjs(date), 'day')
        )
      });
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
        this.$refs.ressources.getBoundingClientRect().width;
      const p = zero + this.translateX * -1;
      const days = p / this.widthByMinute / 60 / 24;
      const date = dayjs(this.rangeX.start)
        .add(days | 0, 'day')
        .format();
      return date
    },
    dateToX(date) {
      const diff = dayjs(date).diff(dayjs(this.rangeX.start), 'minute');
      return diff * this.widthByMinute
    },
    centerViewTo(date, animate = true) {
      const diff = dayjs(this.rangeX.start).diff(
        dayjs(date).startOf('day'),
        'minute',
      );
      const t = this.positionX - this.translateX + diff * this.widthByMinute;
      if (!animate) {
        this.positionX = t;
        return
      }
      const interpolation = { value: this.positionX };
      gsap.to(interpolation, {
        value: t,
        onUpdate: () => {
          this.positionX = interpolation.value;
        },
        duration: 0.5,
      });
    },
  },
};

const _hoisted_1 = {
  key: 0,
  class: "t__frame__rate"
};
const _hoisted_2 = { key: 0 };
const _hoisted_3 = /*#__PURE__*/createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_4 = { key: 1 };
const _hoisted_5 = /*#__PURE__*/createElementVNode("br", null, null, -1 /* HOISTED */);
const _hoisted_6 = {
  key: 1,
  class: "t__debugg"
};
const _hoisted_7 = {
  class: "t__fluid__calendar__ressources",
  ref: "ressources"
};
const _hoisted_8 = /*#__PURE__*/createElementVNode("span", null, "ressources", -1 /* HOISTED */);
const _hoisted_9 = [
  _hoisted_8
];
const _hoisted_10 = /*#__PURE__*/createElementVNode("span", { class: "t__fluid__calendar__pointer" }, null, -1 /* HOISTED */);
const _hoisted_11 = ["width", "height"];
const _hoisted_12 = ["d"];
const _hoisted_13 = /*#__PURE__*/createElementVNode("rect", {
  width: "100%",
  height: "100%",
  fill: "url(#header_grid)"
}, null, -1 /* HOISTED */);
const _hoisted_14 = {
  class: "t__fluid__calendar__grid",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_15 = ["width", "height"];
const _hoisted_16 = ["d"];
const _hoisted_17 = /*#__PURE__*/createElementVNode("rect", {
  width: "100%",
  height: "100%",
  fill: "url(#grid)"
}, null, -1 /* HOISTED */);

function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_FluidCalendarNavigator = resolveComponent("FluidCalendarNavigator");
  const _component_FluidCalendarScroller = resolveComponent("FluidCalendarScroller");
  const _component_FluidCalendarBooking = resolveComponent("FluidCalendarBooking");

  return (openBlock(), createElementBlock(Fragment, null, [
    ($data.displayFR)
      ? (openBlock(), createElementBlock("div", _hoisted_1, [
          ($options._bookings)
            ? (openBlock(), createElementBlock("span", _hoisted_2, toDisplayString($options._bookings.length) + " rézas", 1 /* TEXT */))
            : createCommentVNode("v-if", true),
          _hoisted_3,
          ($options._ressources)
            ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString($options._ressources.length) + " ressources", 1 /* TEXT */))
            : createCommentVNode("v-if", true),
          _hoisted_5,
          createTextVNode(" " + toDisplayString($data.frameRate) + " FPS ", 1 /* TEXT */)
        ]))
      : createCommentVNode("v-if", true),
    createCommentVNode(" {{ collisions }} "),
    ($data.debug)
      ? (openBlock(), createElementBlock("div", _hoisted_6, [
          createElementVNode("pre", null, toDisplayString({
        // scroller,
        // zooming,
        // widthByMinute,
        decalX: $options.decalX,
        // height,
        // decalY,
        positionX: $data.positionX,
        // positionY,
        translateX: $options.translateX,
        // translateY,
        // width,
        // pointer,
        // pointerDate,
        start: $options.rangeX.start,
        end: $options.rangeX.end,
        // cellWidth,
        // rangeY,
      }), 1 /* TEXT */)
        ]))
      : createCommentVNode("v-if", true),
    createCommentVNode(" <h2>{{ format(pointerDate) }}</h2>\n  <button @click=\"centerViewTo('2023-10-17')\">2023-10-17</button>\n  <button @click=\"generate\">generate</button>\n  <button @click=\"reset\">reset</button>\n  <input\n    type=\"range\"\n    min=\"0.1\"\n    max=\"10\"\n    v-model=\"zoom\"\n    step=\"0.01\"\n    @mousedown=\"zooming = true\"\n    @mouseup=\"zooming = false\"\n  />\n  <input type=\"range\" min=\"20\" max=\"100\" v-model=\"rowHeight\" step=\"1\" /> "),
    createCommentVNode(" {{ dragData }} "),
    createElementVNode("div", {
      class: normalizeClass(["t__fluid__calendar", { '--debug': $data.debug }]),
      ref: "fluidCalendar",
      style: normalizeStyle({ height: Math.min($options.fullHeight, $data.height) + 'px' })
    }, [
      createElementVNode("div", _hoisted_7, [
        createElementVNode("div", {
          class: "t__fluid__calendar__ressources__header",
          style: normalizeStyle({ height: $data.rowHeight + 'px' })
        }, [..._hoisted_9], 4 /* STYLE */),
        createElementVNode("div", {
          class: "t__fluid__calendar__ressources__inner",
          style: normalizeStyle({
          transform: `translateY(${$data.positionY}px) translateY(${$options.translateY}px)`,
        })
        }, [
          (openBlock(true), createElementBlock(Fragment, null, renderList($options.rangeY.rows, (ressource) => {
            return (openBlock(), createElementBlock("div", {
              key: ressource.id,
              style: normalizeStyle({ height: $data.rowHeight + 'px' }),
              class: "t__fluid__calendar__ressource"
            }, toDisplayString(ressource.label), 5 /* TEXT, STYLE */))
          }), 128 /* KEYED_FRAGMENT */))
        ], 4 /* STYLE */)
      ], 512 /* NEED_PATCH */),
      createVNode(_component_FluidCalendarNavigator, {
        faking: $data.fakeMove,
        onIncrement: $options.navIncrement,
        x: ""
      }, null, 8 /* PROPS */, ["faking", "onIncrement"]),
      createVNode(_component_FluidCalendarScroller, {
        y: "",
        onPosition: $options.navPosition,
        total: $options.fullHeight - $data.rowHeight,
        position: $data.positionY,
        height: $data.height - $data.rowHeight,
        style: normalizeStyle({ top: $data.rowHeight + 'px' })
      }, null, 8 /* PROPS */, ["onPosition", "total", "position", "height", "style"]),
      createCommentVNode(" <button class=\"t__fluid__calendar__prev\" @click=\"prev\"></button> "),
      createElementVNode("div", {
        class: "t__fluid__calendar__content",
        onMousedown: _cache[0] || (_cache[0] = (...args) => ($options.mousedown && $options.mousedown(...args)))
      }, [
        _hoisted_10,
        ($data.dragData)
          ? (openBlock(), createElementBlock("span", {
              key: 0,
              style: normalizeStyle({
          top: $data.dragData[0].y + 'px',
          left: $data.dragData[0].x + 'px',
          width: `${$data.dragData.length * $options.widthByMinute * 60 * 24}px`,
          transform: `translateY(${$data.positionY}px) translateX(${$options.translateX}px)`,
          height: `${$data.rowHeight}px`,
        }),
              class: "t__fluid__calendar__selection"
            }, null, 4 /* STYLE */))
          : createCommentVNode("v-if", true),
        createElementVNode("div", {
          class: "t__fluid__calendar__canva",
          style: normalizeStyle({
          transform: `translateX(${$options.translateX}px)`,
          width: $options.width + 'px',
        })
        }, [
          createCommentVNode(" <div class=\"t__fluid__calendar__content__translate\"> "),
          createElementVNode("div", {
            class: "t__fluid__calendar__bookings",
            style: normalizeStyle({ transform: `translateY(${$data.positionY}px)` })
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleBookings, (booking) => {
              return (openBlock(), createBlock(_component_FluidCalendarBooking, {
                key: booking.id,
                booking: booking,
                widthByMinute: $options.widthByMinute,
                rowHeight: $data.rowHeight,
                collisions: $data.collisions,
                y: $options.ressourceToY(booking.ressourceId),
                x: $options.dateToX(booking.start_at)
              }, null, 8 /* PROPS */, ["booking", "widthByMinute", "rowHeight", "collisions", "y", "x"]))
            }), 128 /* KEYED_FRAGMENT */))
          ], 4 /* STYLE */),
          (openBlock(), createElementBlock("svg", {
            class: "t__fluid__calendar__header__grid",
            xmlns: "http://www.w3.org/2000/svg",
            style: normalizeStyle({ height: $data.rowHeight + 'px' })
          }, [
            createElementVNode("defs", null, [
              createElementVNode("pattern", {
                id: "header_grid",
                width: $options.cellWidth,
                height: $data.rowHeight,
                patternUnits: "userSpaceOnUse"
              }, [
                createElementVNode("path", {
                  d: `M ${$options.cellWidth} 0 L 0 0 0 ${$data.rowHeight}`,
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "1"
                }, null, 8 /* PROPS */, _hoisted_12)
              ], 8 /* PROPS */, _hoisted_11)
            ]),
            _hoisted_13
          ], 4 /* STYLE */)),
          createElementVNode("div", {
            class: "t__fluid__calendar__header",
            style: normalizeStyle({
            width: $options.width + 'px',
            height: $data.rowHeight + 'px',
          })
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList($options.rangeX.cells, (cell) => {
              return (openBlock(), createElementBlock("div", {
                class: "t__fluid__calendar__header__cell",
                key: cell.date,
                style: normalizeStyle({ width: `${$options.cellWidth}px` })
              }, [
                createElementVNode("span", null, toDisplayString($options.format(cell.date)), 1 /* TEXT */)
              ], 4 /* STYLE */))
            }), 128 /* KEYED_FRAGMENT */))
          ], 4 /* STYLE */),
          createElementVNode("div", {
            class: "t__fluid__calendar__inner",
            style: normalizeStyle({
            width: $options.width + 'px',
            transform: `translateY(${$data.positionY}px)`,
          })
          }, [
            (openBlock(), createElementBlock("svg", _hoisted_14, [
              createElementVNode("defs", null, [
                createElementVNode("pattern", {
                  id: "grid",
                  width: $options.cellWidth,
                  height: $data.rowHeight,
                  patternUnits: "userSpaceOnUse"
                }, [
                  createElementVNode("path", {
                    d: `M ${$options.cellWidth} 0 L 0 0 0 ${$data.rowHeight}`,
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "1"
                  }, null, 8 /* PROPS */, _hoisted_16)
                ], 8 /* PROPS */, _hoisted_15)
              ]),
              _hoisted_17
            ]))
          ], 4 /* STYLE */),
          createCommentVNode(" </div> ")
        ], 4 /* STYLE */)
      ], 32 /* HYDRATE_EVENTS */),
      createCommentVNode(" <button class=\"t__fluid__calendar__next\" @click=\"next\"></button> "),
      createCommentVNode(" <div class=\"t__fluid__calendar__scrollbar\">\n      <div class=\"t__fluid__calendar__scroll__area\" ref=\"scroll_area\">\n        <button class=\"t__fluid__calendar__scroller\"></button>\n      </div>\n    </div> ")
    ], 6 /* CLASS, STYLE */)
  ], 64 /* STABLE_FRAGMENT */))
}

script.render = render;
script.__file = "src/components/FluidCalendar.vue";

var components = { FluidCalendar: script };

const plugin = {
  install(Vue) {
    for (const prop in components) {
      if (components.hasOwnProperty(prop)) {
        const component = components[prop];
        Vue.component(component.name, component);
      }
    }
  },
};

export { plugin as default };
