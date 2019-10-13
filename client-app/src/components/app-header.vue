<template>
  <header class="app-header">
    <div class="centered app-header__container">
      <img class="app-header__logo" alt="Vue logo" src="../assets/logo.png">
      <h1 class="app-header__heading">Client Application with GraphQL API</h1>
    </div>
  </header>
</template>

<script>
  export default {
    name: 'app-header'
  }
</script>

<style lang="scss">
  .app-header {

    &__container {
      display: flex;
      align-items: center;
      padding: 20px 0;
    }

    &__logo {
      display: block;
      width: 6%;
      height: auto;
    }

    &__heading {
      margin: 0 20px;
    }
  }
</style>
