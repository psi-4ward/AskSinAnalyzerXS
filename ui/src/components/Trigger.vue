<template>
  <div class="trigger">
    <p>
      <q-toggle v-model="cfg.enabled" dense label="RSSI-Noise Trigger"/>
    </p>
    <div class="q-gutter-md row items-start items-center" v-if="cfg.enabled">
      <div>Wenn RSSI-Noise länger als</div>
      <q-input
        v-model.number="cfg.timeWindow"
        style="width: 70px"
        filled
        dense
        type="number"
        min="1"
      />
      <div>Sekunden höher als</div>
      <q-input
        v-model.number="cfg.value"
        style="width: 70px"
        min="-120"
        max="0"
        required
        filled
        dense
        type="number"
      />
      <div>dB ist, dann</div>
      <br/>
      <q-select
        filled
        dense
        emit-value
        map-options
        required
        v-model.number="cfg.action"
        :options="triggerOps"
        label="Aktion"
      />
      <div>auf</div>
      <q-input
        style="flex-grow: 1"
        v-model="cfg.actionOpts.url"
        placeholder="URL"
        type="url"
        required
        filled
        dense
      />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Trigger',

    data() {
      return {
        triggerOps: [
          { label: 'HTTP POST', value: 'httpPost' },
          { label: 'HTTP GET', value: 'httpGet' },
        ]
      }
    },

    computed: {
      cfg() {
        return this.$service.data.config.rssiNoiseTrigger;
      },
    },
  }
</script>

<style scoped lang="stylus">
  form
    max-width 450px
</style>
