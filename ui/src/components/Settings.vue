<template>
  <div>
    <q-form @submit="handleSubmit" @reset="handleReset" class="q-gutter-md q-mt-md">
      <q-select
        v-model="$service.data.config.serialPort"
        :options="availableSerialPorts"
        :error="!$service.data.config.serialPort"
        emit-value
        outlined
        filled
        label="SerialPort"
        hint="An diesen Port ist der Analyzer-Sniffer angeschlossen."
      >
        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
            v-on="scope.itemEvents"
          >
            <q-item-section>
              <q-item-label>{{ scope.opt.value }}</q-item-label>
              <q-item-label caption>{{ scope.opt.manufacturer || '' }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-input
        v-model="$service.data.config.serialBaudRate"
        outlined
        filled
        type="number"
        label="BaudRate"
        hint="BaudRate des Serial-Ports."
      />
      <q-toggle
        v-model="$service.data.config.isCCU"
        label="Device-List Backend ist eine CCU"
      />
      <q-input
        v-model="$service.data.config.deviceListUrl"
        outlined
        filled
        type="string"
        :label="$service.data.config.isCCU ? 'CCU Adresse' : 'Device-List URL'"
        :hint="$service.data.config.isCCU ? 'IP oder Hostname der CCU' : 'URL der Device-List'"
      />
      <q-input
        v-model="settings.maxTelegrams"
        outlined
        filled
        type="number"
        min="20"
        label="Max.-Telegramme"
        hint="Maximale Anzahl an Telegrammen die vorgehalten werden."
      />
      <div class="q-mt-lg">
        <q-btn label="speichern und verbinden" type="submit" color="primary" icon="save"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm"/>
      </div>
    </q-form>

  </div>
</template>

<script>

  export default {
    name: 'Settings',

    data() {
      return {
        settings: { ...this.$root.settings },
      }
    },

    beforeMount() {
      this.$service.send('get config');
    },

    computed: {
      availableSerialPorts() {
        return this.$service.data.config.availableSerialPorts
          .map(port => ({
            value: `${ port.path }`,
            manufacturer: port.manufacturer
          }));
      }
    },

    methods: {
      handleSubmit() {
        localStorage.setItem('AskSinAnalyzer_Settings', JSON.stringify(this.settings));
        this.$root.settings = { ...this.$root.settings, ...this.settings};
        this.$service.data.errors = [];
        const cfg = {...this.$service.data.config};
        delete cfg.availableSerialPorts;
        this.$service.send('set config', cfg);
        this.$router.push('/');
      },
      handleReset() {
        localStorage.removeItem('AskSinAnalyzer_Settings');
        location.reload(true);
      }
    }
  }
</script>

<style scoped lang="stylus">
  form
    max-width 450px
</style>
