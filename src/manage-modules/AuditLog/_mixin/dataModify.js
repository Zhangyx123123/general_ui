import formatUtil from '@/utils/js/format';

const transform = {
  methods: {
    rowDataModify(rows) {
      rows.forEach((row) => {
        row.create_time = formatUtil.datetimeToString(row.create_time);
      });
    },
  },
};

export default transform;
