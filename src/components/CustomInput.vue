<script>
export default {
  name: "custom-input",
  props: {
    label: {
      type: String,
      default: ""
    },
    inputValue: {
      type: [Number, String],
      default: ""
    },
    inputType: {
      type: String,
      default: 'text'
    },
    placeholderText: {
      type: String,
      default: ''
    }
  }
}
</script>

<template>
  <div class="input-wrap">
    <label>{{ label }}</label>
    <input
        class="input"
        :value="inputValue"
        :placeholder="placeholderText"
        :type="inputType"
        @input="$emit('update:inputValue', $event.target.value.trim())"
    >
  </div>
</template>

<style scoped>
input {
  background: aliceblue;
	border: none;
	padding: 12px 15px;
	margin: 8px 0;
	width: 100%;
}
</style>