<template>
  <div class="page">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <h2>Einstellungen</h2>
            <settings/>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <h2>Version</h2>
            develop <small>v0.0.0</small>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
  import Settings from '@/components/Settings.vue';

  export default {
    name: 'EinstellungenView',
    components: {
      Settings,
    },
  }
</script>

<style scoped lang="stylus">
</style>
