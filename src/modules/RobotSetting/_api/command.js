import qs from 'qs';

const COMMANDS_PATH = '/api/v1/bf/cmds';
const COMMAND_PATH = '/api/v1/bf/cmd';
const COMMAND_CLASS_PATH = '/api/v1/bf/cmd-class';

function getSingleCommandClass(id, layer) {
  return this.$reqGet(`${COMMAND_CLASS_PATH}/${id}`)
    .then((response) => {
      const rspCommand = response.data.result;

      if (rspCommand.children === null) {
        rspCommand.children = [];
      }
      if (rspCommand.cmds === null) {
        rspCommand.cmds = [];
      } else {
        rspCommand.cmds.forEach((cmd) => {
          if (cmd.labels === null) {
            cmd.labels = [];
          }
        });
      }

      rspCommand.deletable = true;
      rspCommand.editable = true;
      rspCommand.isActive = false;
      rspCommand.layer = layer;
      rspCommand.visible = true;

      return rspCommand;
    });
}

function editCommandClass(id, name) {
  const param = {
    name,
  };
  return this.$reqPut(`${COMMAND_CLASS_PATH}/${id}`, qs.stringify(param), {
    'Content-Type': 'application/x-www-form-urlencoded',
  });
}

function deleteCommandClass(id) {
  return this.$reqDelete(`${COMMAND_CLASS_PATH}/${id}`);
}

function addCommandClass(name, layer) {
  const param = {
    name,
  };
  return this.$reqPost(COMMAND_CLASS_PATH, qs.stringify(param), {
    'Content-Type': 'application/x-www-form-urlencoded',
  })
    .then((response) => {
      const rspCommand = response.data.result;
      if (rspCommand.children === null) {
        rspCommand.children = [];
      }
      if (rspCommand.cmds === null) {
        rspCommand.cmds = [];
      }

      rspCommand.deletable = true;
      rspCommand.editable = true;
      rspCommand.isActive = false;
      rspCommand.layer = layer;
      rspCommand.visible = true;

      return rspCommand;
    });
}

function moveToCategory(id, toCid) {
  const cid = toCid < 0 ? -1 : toCid;
  const param = {
    cid,
  };
  return this.$reqPut(`${COMMAND_PATH}/${id}/move`, qs.stringify(param));
}

function deleteRobotCommand(id) {
  return this.$reqDelete(`${COMMAND_PATH}/${id}`);
}

function addRobotCommand(cid, command) {
  const param = {
    name: command.name,
    rule: JSON.stringify(command.rule),
    target: command.target,
    answer: command.answer,
    response_type: command.response_type,
    status: command.status,
    labels: JSON.stringify(command.labels),
    begin_time: command.start_time,
    end_time: command.end_time,
  };

  param.cid = cid < 0 ? -1 : cid; // add to root or to cid

  return this.$reqPost(`${COMMAND_PATH}`, qs.stringify(param), {
    'Content-Type': 'application/x-www-form-urlencoded',
  }).then((response) => {
    const rspCommand = response.data.result;
    if (rspCommand.labels === null) {
      rspCommand.labels = [];
    }
    return rspCommand;
  });
}

function editRobotCommand(command) {
  // TODO: give parent id;
  const id = command.id;
  const param = {
    name: command.name,
    rule: JSON.stringify(command.rule),
    target: command.target,
    answer: command.answer,
    response_type: command.response_type,
    status: command.status,
    labels: JSON.stringify(command.labels),
    begin_time: command.begin_time,
    end_time: command.end_time,
  };
  return this.$reqPut(`${COMMAND_PATH}/${id}`, qs.stringify(param), {
    'Content-Type': 'application/x-www-form-urlencoded',
  }).then((response) => {
    const rspCommand = response.data.result;
    if (rspCommand.labels === null) {
      rspCommand.labels = [];
    }
    return rspCommand;
  });
}

function getSingleRobotCommand(id) {
  return this.$reqGet(`${COMMAND_PATH}/${id}`)
    .then((response) => {
      const command = response.data.result;
      return command;
    });
}

function parseCommands(commands) {
  commands.children.forEach((child) => {
    /** add attributes to display category */
    child.deletable = true;
    child.editable = true;
    child.isActive = false;
    child.layer = 1;
    child.visible = true;
    if (!child.children) {
      child.children = [];
    }
  });

  // put rules in no category
  const noCategory = {
    cid: -3,
    name: '未分类',
    cmds: commands.cmds,
    children: [],

    deletable: false,
    editable: false,
    isActive: false,
    layer: 1,
    visible: true,
  };

  commands.children.splice(0, 0, noCategory);
}

function getRobotCommands() {
  return this.$reqGet(COMMANDS_PATH)
    .then((response) => {
      const commands = response.data.result;
      parseCommands(commands);
      // parse commands add no category
      return commands;
    });
}

export default {
  getRobotCommands,
  getSingleRobotCommand,
  addRobotCommand,
  editRobotCommand,
  deleteRobotCommand,
  moveToCategory,
  getSingleCommandClass,
  editCommandClass,
  deleteCommandClass,
  addCommandClass,
};
