<template>
  <div class="">
    <q-table
      :dense="$q.screen.lt.md"
      title="CSV-Dateien"
      :data="files"
      :columns="columns"
      selection="multiple"
      :selected.sync="selected"
      :loading="loading"
      :pagination.sync="pagination"
      :filter="filter"
      row-key="name"
      :binary-state-sort="true"
    >
      <template v-slot:top>
        <q-btn color="primary"
          :disable="selected.length<1"
          label="CSV laden"
          @click="loadCSV"
          :loading="loadCsvLoading"
        />
        <q-btn class="q-ml-sm"
          color="red"
          :disable="selected.length<1"
          label="löschen"
          @click="deleteFiles"
          :loading="deleteLoading"
        />
        <q-space/>
        <q-input dense debounce="300" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search"/>
          </template>
        </q-input>
        <q-space/>
        <q-btn color="green"
          :disable="$service.data.liveData"
          label="Livedaten streamen"
          @click="enableLiveData()"
        />

      </template>
    </q-table>
  </div>
</template>

<script>
  export default {
    name: 'HistoryFileList',
    data() {
      return {
        loading: true,
        loadCsvLoading: false,
        deleteLoading: false,
        selected: [],
        pagination: {
          rowsPerPage: 10
        },
        filter: '',
        columns: [
          {
            name: 'name',
            label: 'Datei',
            align: 'left',
            field: row => row.name,
            sortable: true
          },
          {
            name: 'opts',
            label: '',
          }
        ],
        files: []
      };
    },

    async mounted() {
      this.loadFiles();
    },

    methods: {
      async loadFiles() {
        this.loading = true;
        this.files = (await this.$service.req('get csv-files'))
          .map(file => ({name: file}));
        this.loading = false;
      },

      async loadCSV() {
        this.loadCsvLoading = true;
        this.selected.forEach(async ({ name }) => {
          const csvData = await this.$service.req('get csv-content', name);
          await this.$service.loadCsvData(csvData);
        });
        this.loadCsvLoading = false;
        this.$router.push('/list');
      },

      async deleteFiles() {
        this.deleteLoading = true;
        if(!confirm('Die Dateien werden gelöscht!')) {
          this.deleteLoading = false;
          return;
        }
        this.selected.forEach(async ({name}) => {
          await this.$service.req('delete csv-file', name);
        });
        await this.loadFiles();
        this.deleteLoading = false;
      },

      enableLiveData() {
        this.$service.enableLiveData();
        this.$router.push('/list');
      }
    }
  }
</script>

<style lang="stylus">
  thead th
    border-bottom 1px solid black !important
    font-weight bold !important
</style>
