<template>
  <div class="page" style="padding-bottom: 0">
    <q-banner class="text-white bg-red" inline-actions v-for="[key, err] in $root.data.beErrors" :key="key">
      <template v-slot:avatar>
        <q-icon name="error_outline" color="white"/>
      </template>
      <span class="text-bold">{{ err }}</span>
      <template v-slot:action>
        <q-btn flat icon="clear" @click="removeBeError(key)"/>
      </template>
    </q-banner>
    <q-banner class="text-white bg-red" inline-actions v-for="(err, i) in $root.data.feErrors" :key="i">
      <template v-slot:avatar>
        <q-icon name="error_outline" color="white"/>
      </template>
      <span class="text-bold">{{ err }}</span>
<!--      <template v-slot:action>-->
<!--        <q-btn flat icon="clear" @click="removeFeError(i)"/>-->
<!--      </template>-->
    </q-banner>
  </div>
</template>

<script>
  export default {
    name: 'Errors',

    methods: {
      removeBeError(key) {
        this.$service.send('delete error', key);
      },
      removeFeError(i) {
        this.$root.data.feErrors.splice(i, 1);
      }
    }
  }
</script>
