<template>
    <div class="hello">Hello {{who}}
        <Button></Button>
    </div>
</template>
<script>
// Vue.component('button',vueload("./button.vue"));
module.exports = {
  data: function() {
    return {
      who: "world"
    };
  },
  components: {
    "Button": vueload("./button.vue", "Button")    
  }
};
</script>
<style>
.hello {
  background-color: #ffe;
}
</style>