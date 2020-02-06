<template>
  <div>
    <div class="row q-col-gutter-md items-stretch justify-center">
      <div class="col-12 col-md-8 col-xl-7">
        <q-card>
          <pie-chart :data="sentByDevice"/>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
  import PieChart from '@/components/PieChart.vue'


  export default {
    name: 'HomeView',
    components: {
      PieChart,
    },

    computed: {
      sentByDevice() {
        const sentByDevice = {};
        const { start, stop } = this.$root.timefilter;
        this.$root.data.telegrams.forEach(t => {
          const from = t.fromName || t.fromAddr;
          if (start && t.tstamp < start) return;
          if (stop && t.tstamp > stop) return;
          if (!sentByDevice[from]) {
            sentByDevice[from] = 1;
          } else {
            sentByDevice[from]++;
          }
        });
        return sentByDevice;
      }
    }
  }
</script>
