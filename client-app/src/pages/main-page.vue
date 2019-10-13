<template>
  <div class="main-page">
    <app-header/>

    <main class="app-page-content">
      <div class="centered">
        <p class="main-page__paragraph">Total Photos: {{ TOTAL_PHOTOS }}</p>
        <p class="main-page__paragraph">Total Users: {{ TOTAL_USERS }}</p>
      </div>
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
        TOTAL_PHOTOS: 'getTotalPhotos',
        TOTAL_USERS: 'getTotalUsers'
      })
    },

    methods: {
      ...mapActions({
        LOAD_TOTAL_PHOTOS: 'loadTotalPhotos',
        LOAD_TOTAL_USERS: 'loadTotalUsers'
      })
    },

    mounted () {
      this.LOAD_TOTAL_PHOTOS()
      this.LOAD_TOTAL_USERS()
    }
  }
</script>

<style>
  .main-page {

  }
</style>
