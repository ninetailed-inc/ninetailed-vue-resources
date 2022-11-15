<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <div>
      <Personalize
        :baseline="baseline"
        :variants="variants"
        :component="getRenderingComponent(false)"
        :loadingComponent="getRenderingComponent(true)"
      />
    </div>
  </div>
</template>

<script>
import Hero from './components/Hero.vue';
import Loading from './components/Loading.vue';
import { Personalize } from '@ninetailed/experience.js-vue';

export default {
  name: 'App',
  components: { Personalize },
  data(){
    return{
      variants: [{id: "1", audience: { id: "51AL1dMNXkvx1BkQd3wPR1" }, text: "Personalized"}],
      baseline: { text: 'Baseline' }
    }
  },
  methods:{
    getRenderingComponent(loadingComponent){
      if(loadingComponent) return Loading
      else return Hero
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  height: 1200px;
}
</style>