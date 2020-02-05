<template>
  <q-card>
    <q-card-section class="head">{{ data }}</q-card-section>
    <q-separator/>
    <q-card-section>
      {{msg}}
    </q-card-section>
  </q-card>
</template>

<script>
  import { QCard, QCardSection, QSeparator } from 'quasar';

  export default {
    name: "DeviceCard",
    components: {
      QCard, QCardSection, QSeparator
    },

    props: {
      data: {
        type: Object,
        required: true
      }
    },

    data() {
      return {
        msg: 'DeviceCard'
      };
    },

    methods: {}
  };
</script>


<style lang="stylus" scoped>
  .head
    font-weight bold
    background-color #F5F5F5
    color #616161
  .q-card__section
    padding-top 7px
    padding-bottom 7px
</style>
