<template>
    <div class="hello">Hello {{who}}
        <Button></Button>
    </div>
</template>

<script>
// Vue.component('login',vueload("./login.vue"));
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