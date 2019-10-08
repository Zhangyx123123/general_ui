<template>
  <div>
    <h2>Release versions:</h2>
    <table>
      <thead>
        <tr>
          <th>模組</th>
          <th>版本</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mod in versions" :key="mod.name">
          <td>{{ mod.name }}</td>
          <td>{{ mod.version }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '@/api/system';

export default {
  name: 'version',
  api,
  data() {
    return {
      versions: {},
    };
  },
  mounted() {
    const that = this;
    that.$api.getVersionInfo()
    .then((data) => {
      that.versions = [];
      Object.keys(data).forEach((mod) => {
        that.versions.push({
          name: mod,
          version: data[mod],
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
  },
};
</script>

<style lang="scss" scoped>
table {
  color: #666666;
  border-collapse: collapse;
  td, th {
    border: 1px solid #333;
    padding: 10px;
  }
  thead {
    tr {
      background: #f7f7f7;
    }
  }
  tbody {
    tr:hover {
      background: #FCFCFC;
    }
  }
}
</style>
