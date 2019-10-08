const STATS_EXPORT_AUDIT_LOG = '/api/v1/ui/export-log';

function auditExportLog(input) {
  const params = new URLSearchParams();
  params.append('module', input.module);
  params.append('filename', input.filename);
  if (input.info) {
    params.append('info', input.info);
  }

  return this.$reqPost(STATS_EXPORT_AUDIT_LOG, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
export default {
  auditExportLog,
};
