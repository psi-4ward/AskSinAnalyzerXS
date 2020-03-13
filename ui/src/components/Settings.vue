<template>
  <q-form @submit="handleSubmit" @reset="handleReset" class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <q-card>
        <q-card-section class="q-gutter-md">
          <h2>Einstellungen</h2>
          <q-select
            v-model="cfg.serialPort"
            :options="availableSerialPorts"
            :error="!cfg.serialPort"
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
            v-model="cfg.serialBaudRate"
            outlined
            filled
            type="number"
            label="BaudRate"
            hint="BaudRate des Serial-Ports."
          />
          <q-toggle
            v-model="cfg.isCCU"
            label="Device-List Backend ist eine CCU"
          />
          <q-input
            v-model="cfg.deviceListUrl"
            outlined
            filled
            type="string"
            :label="cfg.isCCU ? 'CCU Adresse' : 'Device-List URL'"
            :hint="cfg.isCCU ? 'IP oder Hostname der CCU' : 'URL der Device-List'"
          />
          <q-input
            v-model="cfg.maxTelegrams"
            outlined
            filled
            type="number"
            min="20"
            label="Max.-Telegramme"
            hint="Maximale Anzahl an Telegrammen die vorgehalten werden."
          />
          <q-toggle
            v-model="cfg.animations"
            label="Animationen verwenden"
          />
          <div class="q-field__bottom" style="margin-top: 0; padding-top: 0">
            <div class="q-field__messages">
              Animationen benötigen zusätzliche Rechenleistung.
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-md-6">
      <q-card>
        <q-card-section class="q-gutter-md">
          <h2>Persistente Datenspeicherung</h2>
          <div>
            <p>
              Einstellungen für die persistente Speicherung der empfangen Telegramme auf der Festplatte.
            </p>
            <p>
              Pro Tag wird eine CSV-Datei im Format yyyy-mm-dd.csv angelegt.
            </p>
          </div>
          <q-toggle
            v-model="cfg.persistentStorage.enabled"
            label="Persistente Datenspeicherung verwenden"
          />
          <q-input
            v-model="cfg.persistentStorage.keepFiles"
            outlined
            filled
            type="number"
            min="1"
            label="Max.-Dateien"
            hint="Maximale Anzahl an CSV Dateien die vorgehalten werden. Ältere werden gelöscht."
          />
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12">
      <div class="q-mt-sm">
        <q-btn label="speichern und verbinden" type="submit" color="primary" icon="save"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm"/>
      </div>
    </div>
  </q-form>
</template>

<script>

  export default {
    name: 'Settings',

    beforeMount() {
      this.$service.send('get config');
    },

    computed: {
      cfg() {
        return this.$service.data.config;
      },
      availableSerialPorts() {
        return this.cfg.availableSerialPorts
          .map(port => ({
            value: `${ port.path }`,
            manufacturer: port.manufacturer
          }));
      }
    },

    methods: {
      handleSubmit() {
        const cfg = { ...this.cfg };
        delete cfg.availableSerialPorts;
        delete cfg._appPath;
        this.$service.send('set config', cfg);
        this.$router.push('/');
      },
      handleReset() {
        location.reload(true);
      }
    }
  }
</script>

<style scoped lang="stylus">
  form
    max-width 450px
</style>
