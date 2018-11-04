//button.vue
<template>
    <div class="button-warp">
        <button class="button">{{text}}</button>
    </div>
</template>
<script>
module.exports = {
  data: function() {
    return {
      text: "world"
    };
  }
//   ,
//   components: {
//     "my-button": vueload("./button.vue", "my-button")
//   }
};
</script>
<style scoped>
    .button-warp{
        display:inline-block;
    }
    .button{
        padding: 5px 10px;
        font-size: 12px;
        border-radus: 2px;
    }
</style>
