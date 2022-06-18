<script setup lang="ts">
import { react } from '@babel/types';

var banana_tree = ref(3000)
var banana_market = ref(0)
var banana_camel = ref(0)
var come_back = ref(false)
var coord_in = ref({
  km: 0,
  percent: 0
})
var banana_drops = ref<{
  km: number,
  percent: number,
  quanitty: number
}[]>([])
var pick_value = ref(1000)
var drop_value = ref(0)

var start = ref(false)
var speed = ref<1|2|3|4|5|6|7|8|9|10>(3)
var mission_distance = ref(0)

let time = 0
function step(timestamp) {
  if (start.value) {
    // banana camel
    let old_km = coord_in.value.km
    coord_in.value.km = Math.ceil(coord_in.value.percent * 10)
    if (old_km != coord_in.value.km)
      banana_camel.value--

    if (banana_camel.value <= 0) {
      banana_camel.value = 0
      start.value = false
      return
    }

    // mission
    if (mission_distance.value == coord_in.value.km) {
      start.value = false
      return
    }


    
    let distance = speed.value / 3 / 60

    if (mission_distance.value != 0) {
      if (mission_distance.value < coord_in.value.km) {
        come_back.value = true
        coord_in.value.percent -= distance

        if (coord_in.value.percent <= 0) {
          coord_in.value.percent = 0
        }
      }
      else {
        come_back.value = false
        coord_in.value.percent += distance

        if (coord_in.value.percent >= 100) {
          coord_in.value.percent = 100
        }
      }
    }
    else {
      // move distance
      if (come_back.value) {
        coord_in.value.percent -= distance

        if (coord_in.value.percent <= 0) {
          coord_in.value.percent = 0
        }
      }
      else {
        coord_in.value.percent += distance

        if (coord_in.value.percent >= 100) {
          coord_in.value.percent = 100
        }
      }
    }

    requestAnimationFrame(step)
  }
}

watch(
  () => coord_in.value,
  v => {
    // let coord_temp = Math.ceil(v)
    console.log(v)
  }
)

const comeBack = () => {
  come_back.value = true

  if (!start.value) {
    start.value = true
    requestAnimationFrame(step)
  }
}

const stop = () => {
  start.value = false
}

const letGo = () => {
  come_back.value = false

  if (!start.value) {
    start.value = true
    requestAnimationFrame(step)
  }
}

const pick = () => {
  if (banana_camel.value >= 1000)
    return
  
  if (coord_in.value.km == 0) {
    let pick_max = pick_value.value > banana_tree.value ? banana_tree.value : pick_value.value
    let temp_max = banana_camel.value + pick_max

    banana_camel.value = temp_max > 1000 ? 1000 : temp_max

    let temp_banana_pick =  temp_max > 1000 ? temp_max - 1000 : pick_max
    banana_tree.value -= pick_max > temp_banana_pick ? pick_max - temp_banana_pick : temp_banana_pick
  }
  else {
    let temp_index = banana_drops.value.findIndex(i => i.km == coord_in.value.km)

    if (temp_index >= 0) {
      let pick_max = pick_value.value > banana_drops.value[temp_index].quanitty ? banana_drops.value[temp_index].quanitty : pick_value.value
      let temp_max = banana_camel.value + pick_max

      banana_camel.value = temp_max > 1000 ? 1000 : temp_max


      let temp_banana_pick =  temp_max > 1000 ? temp_max - 1000 : pick_max
      console.log(pick_max, temp_max, temp_banana_pick)
      banana_drops.value[temp_index].quanitty -= pick_max > temp_banana_pick ? pick_max - temp_banana_pick : temp_banana_pick
    }
  }
}

const drop = () => {
  console.log(1)
  if (banana_camel.value <= 0)
    return

  if (coord_in.value.km != 0 && coord_in.value.km != 100) {
    let temp_check = banana_drops.value.findIndex(i => i.km == coord_in.value.km)

    if (temp_check >= 0) {
      banana_drops.value[temp_check].quanitty += drop_value.value > banana_camel.value ? banana_camel.value : drop_value.value
    }
    else {
      banana_drops.value.push({
        km: coord_in.value.km,
        percent: coord_in.value.percent,
        quanitty: drop_value.value > banana_camel.value ? banana_camel.value : drop_value.value
      })
    }

    if (drop_value.value > banana_camel.value) {
      banana_camel.value = 0
    } else {
      banana_camel.value -= drop_value.value
    }
  }
}

// zoom
var zoom = ref(1)
const zoomInOut = (e) => {
  e.preventDefault()
  if (e.deltaY > 0)
    zoom.value -= 0.02
  else
    zoom.value += 0.02
}

// hover distance
var show_tooltip = ref(false)
var tooltip_distance = ref(0)
const move_distance = (e) => {
  let rect = e.currentTarget.getBoundingClientRect()
  let x = e.clientX - rect.left
  let width_div = e.target.offsetWidth

  tooltip_distance.value = Math.ceil(x/width_div * 1000)
}

const move_mission = () => {
  mission_distance.value = tooltip_distance.value

  if (!start.value) {
    start.value = true
    requestAnimationFrame(step)
  }
}

</script>

<template>
  <div class="px-12 py-8">
    <div 
      @wheel="zoomInOut"
      class="flex space-x-6 p-4 pb-12 bg-white rounded-lg" 
      :style="`width: ${100 * zoom}%`">
      <div class="flex-none">
        <p class="text-lg font-semibold text-center mb-4">{{banana_tree}}</p>
        <div class="w-32 h-32">
          <img src="~/assets/images/banana-tree.png" alt="banna tree" class="img-full">
        </div>
      </div>

      <div class="relative flex-grow select-none">
        <div class="absolute bottom-2 -translate-x-1/2" :style="`left: ${coord_in.percent}%`">
          <p class="text-lg font-semibold text-center">{{banana_camel}}/1000</p>
          <div class="w-16 mx-auto" :style="!come_back && 'transform: rotateY(180deg)'">
            <img src="~/assets/images/lac-da.png" alt="banna tree" class="img-full">
          </div>
          <div class="absolute left-0 -bottom-10 w-max min-w-full text-lg font-semibold text-center">{{coord_in.km}} km</div>
        </div>

        <!-- banana -->
        <div v-for="(v,i) in banana_drops" :key="i" class="absolute bottom-2" :style="`left: ${v.percent}%`">
          <div class="w-8 mx-auto -translate-x-1/2">
            <img src="~/assets/images/banana.png" alt="banna tree" class="img-full">
          </div>
          <div class="absolute left-0 -bottom-14 w-max -translate-x-1/2 text-lg font-semibold text-center text-yellow-600">{{v.quanitty}} | {{v.km}} km</div>
        </div>

        <!-- dot  -->
        <div class="absolute left-0 bottom-0 w-3 h-3 rounded-full bg-gray-300 overflow-hidden translate-y-1/2"></div>
        <div class="absolute right-0 bottom-0 w-3 h-3 rounded-full bg-gray-300 overflow-hidden translate-y-1/2"></div>
        <div 
          @mouseenter="show_tooltip = true"
          @mouseleave="show_tooltip = false"
          @mousemove="move_distance"
          @click="move_mission"
          class="absolute left-0 bottom-0 w-full h-1 bg-gray-300 translate-y-1/2 cursor-pointer"></div>

        <!-- tooltip -->
        <transition name="tooltip">
          <div 
            v-if="show_tooltip" 
            class="absolute min-w-[35px] bottom-4 p-1 text-center bg-blue-500 text-white rounded-full -translate-x-1/2"
            :style="`left: ${tooltip_distance/10}%`">
            <span class="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-500 rotate-45 -translate-x-1/2 translate-y-[35%]"></span>
            <span class="relative">{{tooltip_distance}}</span>
          </div>
        </transition>
      </div>

      <div class="flex-none">
        <p class="text-lg font-semibold text-center mb-4">{{banana_market}}</p>
        <div class="w-32 h-32">
          <img src="~/assets/images/market.png" alt="banna tree" class="img-full">
        </div>
      </div>
    </div>

    <div class="mt-14 rounded-lg bg-white shadow-sm overflow-hidden p-4 inline-flex flex-col space-y-4">
      <div class="flex space-x-4">
        <button @click.prevent="comeBack" class="px-8 py-2 rounded-md border bg-white hover:bg-gray-100 font-semibold text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="m4.431 12.822 13 9A1 1 0 0 0 19 21V3a1 1 0 0 0-1.569-.823l-13 9a1.003 1.003 0 0 0 0 1.645z"></path></svg>
        </button>
        <button @click.prevent="stop" class="px-8 py-2 rounded-md border bg-white hover:bg-gray-100 font-semibold text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M8 7h3v10H8zm5 0h3v10h-3z"></path></svg>
        </button>
        <button @click.prevent="letGo" class="px-8 py-2 rounded-md border bg-white hover:bg-gray-100 font-semibold text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z"></path></svg>
        </button>
      </div>
      <div class="flex space-x-4">
        <input v-model="pick_value" type="number" min="0" max="1000" class="flex-grow min-w-0 w-0 px-8 py-2 rounded-md border bg-gray-100 focus:bg-white font-semibold number-lg">
        <button @click.prevent="pick" class="flex-none px-8 py-2 rounded-md border bg-white hover:bg-gray-100 font-semibold text-lg">Pick</button>
      </div>
      <div class="flex space-x-4">
        <input v-model="drop_value" type="number" min="0" max="1000" class="flex-grow min-w-0 w-0 px-8 py-2 rounded-md border bg-gray-100 focus:bg-white font-semibold text-lg">
        <button @click.prevent="drop" class="flex-none px-8 py-2 rounded-md border bg-white hover:bg-gray-100 font-semibold text-lg">Drop</button>
      </div>
      <label class="text-lg font-semibold">Speed</label>
      <input type="range" v-model="speed" min="1" max="10" class="!mt-2">
      <!-- <select  name="speed" class="px-8 py-2 rounded-md border bg-white hover:bg-gray-100 font-semibold text-lg">
        <option v-for="(_,i) in new Array(10)" :value="i+1">{{i+1}}</option>
      </select> -->
    </div>
  </div>
</template>

<style>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.3s ease;
  transform: translate(-50%, 0);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, 50%) scale(0.5);
}
</style>