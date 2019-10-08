(function () {
    var BASE_URL = "/php/api/ApiKey/";
    var robotData = G.getCookie('robotDataJson')
    if (!robotData) {
        window.location.href = 'index.html';
        return;
    }
    var navbar = $(".navbar-bg").find("a");
    var robotDataJson = JSON.parse(robotData);
    var appId = robotDataJson.appid;

    var selectedScenarioTemplate = "0";
    function scenarioTemplateSelect(item) {
        $(".scenarioTemplates .icon").hide();
        $(item).find(".icon").show();
        selectedScenarioTemplate = $(item).attr('data-id');
    }

    function createScenario() {
        $('#importScenario').hide();
        $('#confirmScenario').show();
    }

    function importScenario() {
        $('#confirmScenario').hide();
        $('#importScenario').show();
    }

    function removeScenario(id, e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (confirm("删除此场景?")) {
            $.ajax(BASE_URL + 'task_engine_scenario.php', {
                type: 'POST',
                data: {
                    method: 'PUT',
                    scenarioid: id,
                    delete: 1
                },
                success: function (response) {
                    var json_object = JSON.parse(response);
                    location.reload();
                },
                error: function (err) {
                    toastr.warning('无法移除场景');
                    console.log('Get Scenario JSON error: ' + err);
                }
            });

        } else {
            // they clicked cancel
        }
        return false;
    }

    function userOperaPri() {
        //判断当前页面是否可查看
        var userpri = localStorage.getItem("userdata");
        userpri = JSON.parse(userpri);
        var modulecode = "task",
            priarr = [];
        if (userpri !== null && !G.isRoot()) {
            $.each(userpri, function (i, val) {
                if (val.modulecode == modulecode) {
                    priarr.push(val.pricode)
                }
            });
            var addpri = $.inArray("new", priarr),
                editpri = $.inArray("edit", priarr),
                deletepri = $.inArray("delete", priarr);
            if (addpri == -1) {
                //   当前用户没有新增权限；
                $(".page").find("#addnew").hide();
                $(".page").find("#importnew").hide();
            }
            if (editpri == -1) {
                //  没有修改权限；
                $(".page").find(".wb-edit").parent().hide();
                $(".page").find(".wb-upload").parent().hide();
                $("#taskContainer").find('a').removeAttr('href');
            }
            if (deletepri == -1) {
                //  没有删除权限；
                $(".page").find(".wb-trash").parent().hide();
            }
            if (editpri == -1 && deletepri == -1) {
                $(".page").find(".wb-edit").parent().hide();
                $(".page").find(".wb-upload").parent().hide();
                $("#taskContainer").find('a').removeAttr('href');
                $(".page").find("#delete-button").hide();
            }

        }
    }

    function initScenarios(data) {
        var container = $("#buttonContainer");
        var createHTML = '\
            <div class="col-md-4 col-sm-12">\
            <button type="button" onclick="createScenario()" data-target="#createScenario" \
                data-toggle="modal" class="btn deploymentMediums btn-default panel" \
                style="width:100%; padding:10px; height:80px; text-align:center; font-size:25px;" \
                id="addnew">+ 创建场景\
            </button>\
            </div>';
        container.append(createHTML);
        var importHTML = '\
            <div class="col-md-4 col-sm-12">\
            <button type="button" onclick="importScenario()" data-target="#createScenario" \
                data-toggle="modal" class="btn deploymentMediums btn-default panel" \
                style="width:100%; padding:10px; height:80px; text-align:center; font-size:25px;" \
                id="importnew">导入场景\
            </button>\
            </div>';
        container.append(importHTML);
        var exportAllHTML = '\
            <div class="col-md-4 col-sm-12">\
            <button type="button" onclick="exportAllScenariosToJSONfile()" class="btn deploymentMediums btn-default panel" \
                style="width:100%; padding:10px; height:80px; text-align:center; font-size:25px;">\
                导出全部场景\
            </button>\
            </div>';
        container.append(exportAllHTML);

        const tasks = data.msg;
        var container = $("#taskContainer");
        tasks.sort(function (a, b) { return a.scenarioName.localeCompare(b.scenarioName) });
        for (var i in tasks) {
            var task = tasks[i];
            if(task.version === '' || task.version === '1.0' || task.version === '1.1'){
                var taskHTML = $("#taskTemplate").val();
                container.append(taskHTML);
                var elt = container.children("div:last");
                elt.children(".id").attr("id", task.scenarioID);
                elt.find(".name").html(he.encode(task.scenarioName));
                elt.find(".badge").html(task.scenarioID);
                elt.find("a").attr("href", "index.html?id=" + task.scenarioID);
                elt.find("#delete-button").click(removeScenario.bind(null, task.scenarioID));
                elt.find("#deploy-button").click(publishScenario.bind(null, task.scenarioID, elt.find(".switch")));
                elt.find("#download-button").click(exportScenarioToJSONfile.bind(null, task.scenarioID));
                elt.find(".switch").bootstrapSwitch({
                    size:"small", 
                    state:task.enable,
                    onSwitchChange: function(scenarioID){
                        return function(event, state) {
                            $.ajax({
                                type: "POST",
                                url: BASE_URL + "task_engine_app.php",
                                cache: false,
                                dataType: 'json',
                                data: {
                                    method: 'POST',
                                    appid: appId,
                                    scenarioid: scenarioID,
                                    enable: state
                                },
                                success: function (res) {
                                    toastr.options = { "positionClass": "toast-bottom-right" };
                                    if(state){
                                        toastr.success('场景已启用');
                                    }else{
                                        toastr.success('场景已停用');
                                    }
                                },
                                error:G.ajaxError
                            });
                        }
                    }(task.scenarioID)
                });
            }
        }

        userOperaPri()
    }

    function exportScenarioToJSONfile(scenario_id) {
        $.when(loadScenario(scenario_id)).done(function (scenario_str) {
            var json_object = JSON.parse(scenario_str);
            var scenario = {
                "taskScenario": JSON.parse(json_object.result.editingContent),
                "taskLayouts": JSON.parse(json_object.result.editingLayout)
            }
            var scenario_name = scenario.taskScenario.metadata.scenario_name;
            var scenario_id = scenario.taskScenario.metadata.scenario_id;
            var jsonString = JSON.stringify(scenario, null, 4);
            var blobdata = new Blob([jsonString], { type: 'text/json' });
            if (navigator.appVersion.toString().indexOf('.NET') > 0) { // for IE browser
                window.navigator.msSaveBlob(blobdata, scenario_name + "_" + scenario_id + ".json");
            } else {
                var link = document.createElement("a");
                link.setAttribute("href", window.URL.createObjectURL(blobdata));
                link.setAttribute("download", scenario_name + "_" + scenario_id + ".json");
                document.body.appendChild(link);
                link.click();
            }
            audit('export', '导出场景：' + scenario_name);
        })
    }

    function exportAllScenariosToJSONfile() {
        var requests = [];
        $('.badge').each(function () {
            requests.push(loadScenario($(this).text()));
        });
        audit('export', '导出全部场景');
        $.when.apply(undefined, requests).done(function () {
            if (arguments.length == 0){
                return;
            }
            var scenarios = [];
            if (Array.isArray(arguments[0])) {
                for (var i = 0; i < arguments.length; i++) {
                    collectScenarios(scenarios, arguments[i][0])
                }
            } else {
                collectScenarios(scenarios, arguments[0])
            }
            var jsonString = JSON.stringify(scenarios, null, 4);
            var blobdata = new Blob([jsonString], { type: 'text/json' });
            if (navigator.appVersion.toString().indexOf('.NET') > 0) { // for IE browser
                window.navigator.msSaveBlob(blobdata, "全部场景_" + appId + ".json");
            } else {
                var link = document.createElement("a");
                link.setAttribute("href", window.URL.createObjectURL(blobdata));
                link.setAttribute("download", "全部场景_" + appId + ".json");
                document.body.appendChild(link);
                link.click();
            }
        });
    }

    function collectScenarios(scenarios, scenario_str) {
        var json_object = JSON.parse(scenario_str);
        var scenario = {
            "taskScenario": JSON.parse(json_object.result.editingContent),
            "taskLayouts": JSON.parse(json_object.result.editingLayout)
        }
        scenarios.push(scenario);
    }

    function audit(action, msg) {
        return $.ajax('/api/v1/task/audit', {
            type: 'POST',
            data: {
                action: action,
                msg: msg,
            },
        })
    }

    function loadScenario(id) {
        return $.ajax(BASE_URL + 'task_engine_scenario.php', {
            type: 'POST',
            data: {
                method: 'GET',
                scenarioid: id,
            }
        });
    }

    function publishScenario(scenario_id, switch_btn, e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        $.when(
            $.ajax(BASE_URL + 'task_engine_scenario.php', {
                type: 'POST',
                data: {
                    method: 'PUT',
                    scenarioid: scenario_id,
                    publish: 1,
                    appid: appId
                }
            }),
            $.ajax({
                type: "POST",
                url: BASE_URL + "task_engine_app.php",
                cache: false,
                dataType: 'json',
                data: {
                    'method': 'POST',
                    'appid': appId,
                    'scenarioid': scenario_id,
                    'enable': true
                }
            })
        ).done(function (response1, response2) {
            switch_btn.bootstrapSwitch('state', true);
            toastr.options = { "positionClass": "toast-bottom-right" };
            toastr.success('场景已发布');
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log('场景发布失败: ' + errorThrown);
        });
    }

    function getAllScenarioJson() {
        $.ajax(BASE_URL + 'task_engine_app.php?appid='+appId, {
            type: 'GET',
            success: function (response) {
                var json_object = JSON.parse(response);
                $('#taskContainerLoading').remove();
                initScenarios(json_object);
                toastr.options = { "positionClass": "toast-bottom-right" };
                toastr.success('已取得场景资讯');
            },
            error: function (err) {
                initScenarios({});
                console.log('Get Scenario JSON error: ' + err);
            }
        });
    }

    function getTemplateScenarios() {
        $.ajax(BASE_URL + 'task_engine_scenario.php', {
            type: 'POST',
            data: {
                method: 'GET',
                scenarioid: 'all',
                public: 1
            },
            success: function (response) {
                var json_object = JSON.parse(response);
                var num = json_object['result'].length;
                var templateScenariosHTML =
                    '<div style="height:250px; width:100%; overflow-x: scroll; overflow-y:hidden;">\
                <ul style="width:'+ ((num + 1) * 200) + 'px" class="blocks" id="exampleList" data-filterable="true">\
                    <li style="width:200px" data-id="0" onclick="scenarioTemplateSelect(this)">\
                    <div class="scenarioTemplates widget widget-shadow">\
                    <figure class="widget-header overlay-hover overlay">\
                    <img class="overlay-figure overlay-scale" src="./images/template/new.png" alt="...">\
                    <figcaption class="overlay-panel overlay-background overlay-fade overlay-icon">\
                    </figcaption>\
                    </figure>\
                    <h5 class="widget-title"><i class="icon wb-check-circle" style="display: inline-block;"></i>不使用范本</h5>\
                    </div>\
                    </li>';
                for (var i in json_object['result']) {
                    var img_url = './images/home-icon_01.png';
                    if(json_object['result'][i]['scenarioName'] == '时间地点节点范例'){
                        img_url = './images/template/time_place_nodes_demo.png';
                    }else if(json_object['result'][i]['scenarioName'] == '参数收集节点范例'){
                        img_url = './images/template/data_collecting_node_demo.png';
                    }else if(json_object['result'][i]['scenarioName'] == '设置提醒'){
                        img_url = './images/template/set_notification.png';
                    }else if(json_object['result'][i]['scenarioName'] == '订飞机票'){
                        img_url = './images/template/flight_booking.png';
                    }else if(json_object['result'][i]['scenarioName'] == '酒店预订'){
                        img_url = './images/template/hotel_booking.png';
                    }else if(json_object['result'][i]['scenarioName'] == '退货机器人'){
                        img_url = './images/template/refund_bot.png';
                    }else if(json_object['result'][i]['scenarioName'] == '打开退货页面'){
                        img_url = './images/template/refund.png';
                    }else if(json_object['result'][i]['scenarioName'] == '取消提醒'){
                        img_url = './images/template/cancel_notification.png';
                    }else if(json_object['result'][i]['scenarioName'] == '查看提醒'){
                        img_url = './images/template/check_notification.png';
                    }else if(json_object['result'][i]['scenarioName'] == '咨询，落户'){
                        img_url = './images/template/settle.png';
                    }
                    templateScenariosHTML +=
                        '<li style="width:200px" data-id="' + json_object['result'][i]['scenarioID'] + '" onclick="scenarioTemplateSelect(this)">\
                    <div class="scenarioTemplates widget widget-shadow">\
                    <figure class="widget-header overlay-hover overlay">\
                    <img class="overlay-figure overlay-scale" src="'+img_url+'" alt="...">\
                    <figcaption class="overlay-panel overlay-background overlay-fade overlay-icon">\
                    </figcaption>\
                    </figure>\
                    <h5 class="widget-title"><i class="icon wb-check-circle" style="display: none;"></i>'+ json_object['result'][i]['scenarioName'] + '</h5>\
                    </div>\
                </li>';
                }
                templateScenariosHTML += '</ul></div>';
                $('#templatesContainer').html(templateScenariosHTML);
            },
            error: function (err) {
                initScenarios({});
                console.log('Get Scenario JSON error: ' + err);
            }
        });
    }

    function newScenario() {
        var botName = $("#botName").val().trim();
        if (!botName || botName.length === 0) {
            toastr.warning('场景名称不得为空或空白');
        }else{
            $.when($.ajax(BASE_URL + 'task_engine_app.php?appid='+appId, {type: 'GET'})).done(function (scenario_str) {
                var scenario_object = JSON.parse(scenario_str);
                var tasks = scenario_object.msg;
                var exist = false;
                for(var i in tasks){
                    if(tasks[i].scenarioName === botName){
                        exist = true;
                        break;
                    }
                }
                if(exist){
                    toastr.warning('已有相同名称场景，请修改场景名称');
                }else{
                    var template = selectedScenarioTemplate == "0" ? '' : selectedScenarioTemplate;
                    $.ajax(BASE_URL + 'task_engine_scenario.php', {
                        type: 'POST',
                        data: {
                            method: 'POST',
                            scenarioName: botName,
                            template: template,
                            appid: appId
                        },
                        success: function (response) {
                            var json_object = JSON.parse(response);
                            if (json_object && json_object.hasOwnProperty('template') && json_object.template.hasOwnProperty('metadata')) {
                                var url = './index.html?id=' + json_object.template.metadata.scenario_id;
                                window.location.href = url;
                            } else {
                                toastr.warning('无法创建场景');
                            }
                        },
                        error: function (err) {
                            toastr.warning('无法创建场景');
                            console.log('Get Scenario JSON error: ' + err);
                        }
                    });
                }
            });
        }
    }

    function validateFilenameExtension(filename) {
        var f_ext = filename.split('.').pop();
        if (f_ext == 'json') {
            return true;
        } else {
            return false;
        }
    }

    function uploadData(useNewId, appId, file) {
        if (file == null) {
            alert("请选择上传文件");
            return;
        }
        if (file.size == 0) {
            alert("请确认文件是否存在");
            return;
        }
        if (file.size > 2485760) {
            alert("json文件请小于2M。");
            return;
        }
        if (!validateFilenameExtension(file.name)) {
            alert("请上传副档名为json的档案");
            return;
        }
        var form_data = new FormData();
        form_data.append("useNewId", useNewId);
        form_data.append("appid", appId);
        form_data.append("scenario_json", file);
        viewUtils.showProgress();
        $.ajax({
            type: "POST",
            url: BASE_URL + 'scenario_json_upload.php',
            data: form_data,
            crossDomain: true,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function (res) {
                viewUtils.hideProgress();
                viewUtils.resumeAllViews();
                try {
                    if (res.return == 0) {
                        $("#kg-upload-filepath").html('');
                        $("#kg-upload-input").replaceWith($("#kg-upload-input").val('').clone(true));
                        $('#createScenario').modal('hide');
                        var msg = res.error.replace(/\n/g, "<br>");
                        if(msg !== "Update success" && msg !== ""){
                            alert(msg);
                        }
                        location.reload();
                    } else if (res.return == -1) {
                        var msg = res.error.replace(/\n/g, "<br>");
                        alert(msg);
                    } else {
                        var msg = res.error.replace(/\n/g, "<br>");
                        alert(msg);
                    }
                } catch (e) {

                }
            },
            error: function (XMLHttpRequest, status, errorThrown) {
                viewUtils.hideProgress();
                viewUtils.resumeAllViews();
                G.ajaxError(XMLHttpRequest, status, errorThrown);
            }
        });
    }

    var viewUtils = {
        disableAllViews: function () {
            $('.kg-button').each(function () {
                $(this).prop("disabled", true);
            });
            $("#navbar-toggle").hide();
            $("#logout").hide();
            navbar.addClass("uk-disabled");
        },
        resumeAllViews: function () {
            $('.kg-button').each(function () {
                $(this).prop("disabled", false);
            });
            $("#navbar-toggle").show();
            $("#logout").show();
            navbar.removeClass("uk-disabled");
        },
        showProgress: function () {
            $(".kg-upload-pro").each(function () {
                $(this).prop("hidden", false);
            });
        },
        hideProgress: function () {
            $(".kg-upload-pro").each(function () {
                $(this).prop("hidden", true);
            });
        },
        showRightResult: function (msg) {
            $("#kg-upload-result-val").text(msg);
            $("#kg-upload-result-val").css("color", "green");
        },
        showErrorResult: function (msg) {
            $("#kg-upload-result-val").html(msg);
            $("#kg-upload-result-val").css("color", "red");
        },
    }

    $(document).ready(function () {
        getTemplateScenarios();
        getAllScenarioJson();
        $("#kg-button-browse").on("click", function () {
            $("#kg-upload-input").trigger("click");
        });
        $("#kg-upload-input").on("change", function () {
            var val = $(this).val(),
                arr = val.split('\\'),
                len = arr.length;
            $("#kg-upload-filepath").text(arr[len - 1]);
        })
        $("#kg-button-upload").on("click", function () {
            viewUtils.disableAllViews();

            var useNewId = $('#useNewId').is(':checked');
            var file_data = document.getElementById("kg-upload-input").files[0];
            $("#kg-upload-result-val").text("");
            uploadData(useNewId, appId, file_data);
        });
    });

    window.exportScenarioToJSONfile = exportScenarioToJSONfile;
    window.publishScenario = publishScenario;
    window.newScenario = newScenario;
    window.createScenario = createScenario;
    window.importScenario = importScenario;
    window.scenarioTemplateSelect = scenarioTemplateSelect;
    window.exportAllScenariosToJSONfile = exportAllScenariosToJSONfile;
})();
