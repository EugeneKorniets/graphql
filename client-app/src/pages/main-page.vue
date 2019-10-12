<template>
  <div class="main-page">
    <img alt="Vue logo" src="../assets/logo.png">

    <app-header/>

    <main>
      <p>Total Photos: {{ TOTAL_PHOTOS }}</p>
    </main>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import AppHeader from '../components/app-header'

  export default {
    name: 'main-page',

    components: {
      AppHeader
    },

    computed: {
      ...mapGetters({
        TOTAL_PHOTOS: 'getTotalPhotos'
      })
    },

    methods: {
      ...mapActions({
        LOAD_TOTAL_PHOTOS: 'loadTotalPhotos'
      })
    },

    mounted () {
      this.LOAD_TOTAL_PHOTOS()
    }
  }
</script>

<style>

</style>
