import qs from 'qs';

const V3_PREFIX = '/auth/v3';
const BF_PREFIX = '/api/v1/bf/role';

function getRolesURL(enterpriseID) {
  return `${V3_PREFIX}/enterprise/${enterpriseID}/roles`;
}
function getRoleURL(enterpriseID) {
  return `${V3_PREFIX}/enterprise/${enterpriseID}/role`;
}

function getEnterpriseRoles(enterprise) {
  const rolesURL = getRolesURL(enterprise);
  return this.$reqGet(rolesURL).then(rsp => rsp.data.result);
}
function getEnterpriseRole(enterprise, id) {
  const roleURL = getRoleURL(enterprise);
  return this.$reqGet(`${roleURL}/${id}`).then(rsp => rsp.data.result);
}
function updateEnterpriseRole(enterprise, id, role) {
  const roleURL = getRoleURL(enterprise);
  const options = {
    name: role.name,
    privilege: JSON.stringify(role.privileges),
  };

  return this.$reqPut(`${roleURL}/${id}`, qs.stringify(options), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then((rsp) => {
    let commands = [];
    if (role.privileges.ssm !== undefined && role.privileges.ssm.length > 0) {
      commands = role.privileges.ssm;
    }
    const bfOptions = {
      commands: commands.join(','),
    };
    return this.$reqPut(`${BF_PREFIX}/${id}`, qs.stringify(bfOptions), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(() => rsp.data);
  });
}
function addEnterpriseRole(enterprise, role) {
  const roleURL = getRoleURL(enterprise);
  const options = {
    name: role.name,
    privilege: JSON.stringify(role.privileges),
  };
  let uuid = '';

  return this.$reqPost(`${roleURL}`, qs.stringify(options), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then((rsp) => {
    uuid = rsp.data.result.uuid;
    return rsp.data;
  }).then((data) => {
    let commands = '';
    if (role.privileges.ssm !== undefined && role.privileges.ssm.length > 0) {
      commands = role.privileges.ssm.join(',');
    }
    const bfOptions = {
      id: uuid,
      commands,
    };
    return this.$reqPost(`${BF_PREFIX}`, qs.stringify(bfOptions), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(() => data);
  });
}
function deleteEnterpriseRole(enterprise, id) {
  const roleURL = getRoleURL(enterprise);
  return this.$reqDelete(`${roleURL}/${id}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then((rsp) => {
    this.$reqDelete(`${BF_PREFIX}/${id}`)
    .catch((err) => {
      console.log(err);
    })
    .then(() => rsp.data);
  });
}

export default {
  getEnterpriseRoles,
  getEnterpriseRole,
  updateEnterpriseRole,
  addEnterpriseRole,
  deleteEnterpriseRole,
};
