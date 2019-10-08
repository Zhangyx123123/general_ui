/**
 * Created by mephisto on 17/1/19.
 */


!function (window, undefind) {

    var GLOBAL = {},
        w = window;

    GLOBAL = {
        goTop:function(num){

            var n = num || 0,
                MAX_WIDTH = 1025,
                WIN_WIDTH = $(window).width();
            if (WIN_WIDTH < MAX_WIDTH) {
                $(window).scrollTop(n);
            }
        },
        // 命名空间
        namespace: function (key) {
            var o = w, arr;

            if (typeof key == 'string' && key) {

                arr = key.split('.');

                for (var i = 0; i < arr.length; i++) {

                    if (o[arr[i]]) {
                        o[arr[i]] = o[arr[i]];
                        //对象是否存在 提示 上线时注释
                        console.warn('window\.' + arr[i] + ' is defined')
                    } else {
                        o[arr[i]] = {};

                    }
                    o = o[arr[i]];
                }
            }
            return o;
        },
        // 位数补足
        complementNumber: function (num, figures) {

            var n = num.toString(),
                len = n.length;
            if (len >= figures || !num) {
                return n;
            } else {

                for (var i = 0, max = figures - len; i < max; i++) {
                    n = '0' + n;
                }
                return n;
            }

        },
        //模板解析
        toTemplate: function (str, o) {
            return str.replace(/\{\{\s*\w+\s*\}\}/ig, function (str) {
                return filterXSS(o[$.trim(str.replace(/\{\{|\}\}/g, ''))]);
            })
        },
        //设置cookie
        setCookie: function (cname, cvalue, exdays) {

            // cname  cookie名
            // cvalue =  cookie值
            // exdays = cookie 过期时间(天)
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;

        },
        //获取cookie
        getCookie: function (cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];

                if (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }

                if (c.indexOf(name) != -1) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },
        //清除cookie
        clearCookie: function (cname) {
            this.setCookie(cname, "", -1);
        },
        setAlter:function(msg){
            UIkit.modal.alert(msg)
        },
        ajaxError:function(XMLHttpRequest,status, errorThrown){


            if(XMLHttpRequest.responseText.indexOf('<html>') != -1  && XMLHttpRequest.responseText.indexOf('注册') != -1){

                window.location.href = 'login.html'
            }else{
                UIkit.modal.alert('服务器暂时不可用,请稍后再试').then(function() {
                });
            }

        },
        //Ajax

        ajaxRes: function (res) {

            var num = res.RetCode,
                msg = res.RetShowMsg,
                bool = true;

            switch (num) {
                //接口执行警告
                case 2:
                    UIkit.modal.alert(msg).then(function() {
                    });
                    break;
                //接口返回空数据
                case 3:
                    UIkit.modal.alert(msg).then(function() {
                    });
                    break;
                //程序出错
                case 4:
                    UIkit.modal.alert(msg).then(function() {
                    });
                    break;
                //丢失用户信息，重新登陆
                case 5:
                    UIkit.modal.alert(msg).then(function() {
                    });
                    bool = false;
                    G.clearCookie('loginId');
                    break;
            }

            return bool;
        }, getErrorMsg: function(code) {
            var res = ERROR_CODE[code];
            return typeof res !== "undefined" ? res: "错误";
        }, isPersonal: function(type) {
          return ENTERPRISE_USER_TYPE.personal == this.getCookie("enterpriseType");
        }, isAdmin: function(type) {
          return ENTERPRISE_USER_TYPE.admin == this.getCookie("enterpriseType");
        }, isRoot: function() {
          return this.getCookie("enterpriseType") == ENTERPRISE_USER_TYPE.root;
        }, isMobile: function() {
          var browser = window.navigator.userAgent.toLocaleLowerCase(),
              os = /iphone|android|symbianos|windows\sphone/g;
          return os.test(browser);
        }, clearAllCookie: function() {
            var that = this;
            try {
                var cookies = document.cookie.split(';').map(function(ckey){return ckey.split('=')[0].trim()});
                cookies.forEach(function(c) {
                    that.clearCookie(c);
                });
            } catch(e) {
            }
        }, storeObject: function(key, object) {
          if (typeof key !== 'string') {
            return;
          }
          if (object && typeof object === 'object') {
            localStorage.setItem(key, JSON.stringify(object));
          }
        }, getObject: function(key) {
          if (typeof key !== 'string') {
            return;
          }
          try {
            return JSON.parse(localStorage.getItem(key));
          } catch(e) {
            return {};
          }
        }
    };

    window.GLOBAL = GLOBAL;
    window.G = GLOBAL;

    ENTERPRISE_USER_TYPE = {
      personal: 2,
      admin: 1,
      root: 0
    }

    ERROR_CODE = {
      10001:"输入的内容有sql注入",
      10002:"获取cmd错误",
      10003:"获取time错误或time为空",
      10004:"获取userid错误或userid为空",
      10005:"获取appid错误或appid为空",
      10006:"获取chk错误或chk为空",
      10007:"chk验证失败",
      10008:"AppId不存在或者已关闭，请确认后再试！",
      10009:"获取nickname错误或nickname为空！",
      10010:"获取非法用户",
      10011:"数据库连接失败",
      10012:"获取email错误或email为空",
      10013:"插入数据失败或获取数据失败",
      10014:"获取tb错误或tb为空，是对robot还是edit操作。",
      10015:"获取status错误或status为空",
      10016:"传入参数版本号不正确",
      10017:"此ApiKey尚未得到授权，请和竹间联系！",
      10018:"此微信公共号未关注",
      10019:"访问次数上限，明天请早！(默认访问次数为500)",
      10020:"获取text错误或text为空",
      10021:"档案大小超出限制，请查证后重新重新输入！(200~307200)",
      10022:"档案上传失败",
      10023:"传入参数版本号不正确",
      10024:"文档格式不正确",
      10025:"获取phone错误或phone为空！",
      10026:"status的状态不正确。",
      10027:'服务器不正常，请10分钟后再试!',
      10028: '操作符type错误或type为空',
      10029:'文件下载失败！',
      10030:'修改条件不正确！',
      10031:'导入sql脚本不存在！',
      10500:"获取uploadid错误或uploadid为空",
      10501:"获取imgid错误或imgid为空",
      10600:"获取city错误或city为空",
      10601:"获取imei错误或imei为空",
      10602:"获取androidVersion错误或androidVersion为空",
      10603:"获取phoneModel错误或phoneModel为空",
      10100:"获取data失败或data为空",
      10101:"data解密失败",
      10102:"注册数量达到上限",
      10200:"操作符type错误或type为空",
      10300:"翻页页码num错误或num为空",
      10301:"获取是content按照是按照那种条件搜索。（1：按照Q搜索；2：按照A搜索；3：按照QA搜索（默认))。",
      10302:"搜索条件content错误",
      10400:"获取q_id失败或q_id为空 问题编号，当为0时为新增，非0的情况要看cmd中是修改，还是删除。",
      10401:"获取问题数组，q_contents错误或q_contents为空",
      10402:"获取问题数组，a_contents错误或a_contents为空",
      10500:"图片验证失败！",
      10501:"图片验证码为空！",
      10502:"图片验证码不存在，检查是否存在！",
      10503:"获取password错误或password为空！",
      10504:"验证码已过期！",
      10505:"邮箱地址、用户昵称或手机号码重复！",
      10506:"验证码不存在！",
      10507:"请输入手机取得验证码",
      10508:"手机已注册请输入别的号码",
      10600:"获取企业账号错误或企业账号为空！",
      10601:"获取联系人错误或联系人为空！",
      10602:"获取联系人电话号码错误或联系人电话号码为空！",
      10603:"获取联系人邮箱错误或联系人邮箱为空！",
      10604:"输入旧密码不正确，请重新输入！",
      10605:"输入新密码和旧密码相同，请重新输入！",
      10700:"获取scenarioid错误或scenarioid为空！",
      10701:"返回task engine失败！",
      10800:"获取rolecode错误或rolecode为空！",
      10801:"获取rolename错误或rolename为空！",
      10802:"获取EnterpriseId错误或EnterpriseId为空！",
      10803:"角色删除失败，还有用户在此角色下！",
      10805: "角色已存在，请重新输入",
      10900:"获取modulename错误或modulename为空！",
      10901:"获取modulecode错误或modulecode为空！",
      10902:"获取moduleurl错误或moduleurl为空！",
      10903:"获取priname错误priname为空！",
      10904:"获取pricode错误或pricode为空",
      10905:"获取mpids错误或mpids为空",
      11000:"获取fname_en错误或fname_en为空！",
      11001:"获取fname_zh错误或fname_zh为空！",
      11002:"获取furl错误或furl为空！",
      11003:"获取fonoff错误或fonoff为空！",
      11004:"获取remark错误或remark为空！",
      11005:"获取fid错误或fid为空！",
      11006:"获取intent错误或intent为空！",
      11007:"获取tag错误或tag为空！",
      11008:"获取num错误或num为空！",
      11009:"获取type错误或type为空！",
      11010:"获取sample1错误或sample1为空！",
      11011:"获取sample2错误或sample2为空！",
      11012:"获取categories错误或categories为空！",
      11013:"新增成功！",
      11014:"新增失败！",
      11015:"修改成功！",
      11016:"修改失败！",
      11017:"删除成功！",
      11018:"删除失败！",
      11019:"共享成功！",
      11020:"共享失败！",
      11021:"删除共享成功！",
      11022:"删除共享失败！",
      11023:"名称已存在，请使用别的名称",
      11100:"获取分类错误或分类为空！",
      11101:"分类已经存在！",
      11102:"获取修改前分类错误或修改前分类为空！",
      11103:"获取id错误或id为空！",
      11104:"词语和同义词已经存在！",
      12000:'获取module错误或module为空！',
      12001:'获取tmp_appid错误或tmp_appid为空！',
      12002:'获取json_msg错误或json_msg为空！',
      12003:'获取json不正确！'

    }
}(window);


//
if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
        return -1;
    }
}
//自定义插件


$.fn.extend({
    //areatext
    MultiLineInput: function (params) {

        return $(this).each(function (i, val) {

            var defualt = {
                    min: $(this).height(),
                    strlen: $(this).attr('data-length')
                },
                opts = $.extend({}, defualt, params),
                methods = function (obj) {
                    obj.css('height', opts.min);
                    obj.scrollTop(obj[0].scrollHeight);
                    obj.css('height', obj.scrollTop() + opts.min);
                };

            //init
            methods($(this));
            $(this).on('keypress', function (event) {

                var val = $(this).val(),
                    l = val.length;



                if (l >= opts.strlen) {



                    $(this).val(val.substring(0, opts.strlen));

                  //if((event.keyCode!=8)|| (event.keyCode !=46)) {
                  //    event.returnValue=true;
                  //
                  //} else{
                  //    event.returnValue=false;
                  //}

                  //  alert('只能输入' + opts.strlen + '个字')
                }
                methods($(this));

            });

        });

    }

});
