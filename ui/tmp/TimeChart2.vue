<template>
  <div>
    <div ref="chart" style="height:200px"></div>
  </div>
</template>

<script>
  import Highcharts from 'highcharts';

  export default {
    name: "TimeChart2",
    props: {
      data: {
        type: Array,
        required: true
      }
    },

    watch: {
      data: {
        immediate: false,
        handler() {
          let m = new Map();
          this.data.forEach(t => {
            let cnt = m.get(t.tstamp) || 0;
            cnt++;
            m.set(t.tstamp, cnt);
          });
          let data = [];
          m.forEach((v, k) => data.push([k * 1000, v]));
          data = data.sort((a, b) => a[0] - b[0]);
          this.hightchart.series[0].setData(data, false);

          this.hightchart.redraw();
        }
      }
    },

    mounted() {
      const vm = this;
      this.hightchart = Highcharts.chart(this.$refs.chart, {
        chart: {
          zoomType: 'x',
          // panning: true,
          // panKey: 'shift',
          //https://stackoverflow.com/questions/47182434/catch-panning-event-in-highcharts
          events: {
            selection(ev) {
              if (ev.resetSelection) {
                vm.$emit('resetSelection');
              } else {
                vm.$emit('selection', { min: ev.xAxis[0].min, max: ev.xAxis[0].max });
              }
            },

          },
        },
        credits: { enabled: false },
        tooltip: { enabled: false },
        time: { useUTC: false },
        legend: { enabled: false },
        xAxis: { type: 'datetime' },
        yAxis: {
          max: 12,
          tickAmount: 4,
          title: {
            text: null
          },
        },

        title: { text: 'Telegramme' },
        series: [{
          name: 'Telegramme pro Sekunde',
          type: 'area',
          lineWidth: 1,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.2).get('rgba')]
            ]
          },
        }]
      });
    },

    data() {
      return {};
    },

    methods: {}
  }
</script>

<style lang="stylus" scoped>

</style>
