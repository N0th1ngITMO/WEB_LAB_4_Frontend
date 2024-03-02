<script>
export default {
  name: "custom-header",
  props: {
    author: {
      type: String,
      default: ""
    },
    group: {
      type: String,
      default: ""
    },
    varNum: {
      type: String,
      default: ""
    }
  }
}
</script>

<template>
  <section className="header">
    <div>{{ author }}</div>
    <div class="a">{{ group }}</div>
    <div class="a">v: {{ varNum }}</div>
  </section>
</template>

<style scoped>
.header {
  border: 2px solid black;
  font: small-caps bold 3vw/1 sans-serif;
  border: solid 1px black;
  background-color: antiquewhite;
  border-radius: 10px;
  display: flex;
  justify-items: center;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
}

.a{
  padding-left: 10%;
}
</style>
