<script>
export default {
  data() {
    return {
      headerProps: {
        author: "Komyagin Dmitry",
        group: "P3232",
        varNum: "3223265"
      }
    }
  }
}


</script>

<template>
  <custom-header v-bind="headerProps"></custom-header>
  <RouterView/>
</template>

<style scoped>

</style>

<style scoped>

</style>
