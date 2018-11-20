<template>
    <div class="hello">Hello {{who}} {{vue}}
        <Button></Button>
    </div>
</template>
<script>
// Vue.component('button',vueload("./button.vue"));
var data = require("./data.js");
var data1 = require("./data1.js");
data.vue = data1.vue;
module.exports = {
  data: function() {
    return data;
  },
  components: {
    Button: vueload("./button.vue", "Button")
    //"url:./button.vue"
  }
};
</script>
<style>
.hello {
  background-color: #ffe;
}
</style>