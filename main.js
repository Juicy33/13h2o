const {app, BrowserWindow,Menu,shell} = require('electron')

const url = require('url');
const path = require('path');
const remote = require('electron').remote;
const ipc = require('electron').ipcMain;


function createWindow () {
    mainWindow = new BrowserWindow({width: 1024, height: 768});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes:true
    }));

    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {

        mainWindow = null;

    });
}


ipc.on('open-user-editor', (event,message) => {

    if (mainWindow) {
        mainWindow.hide();
    }

    if (userEditorWindow) {
        return;
    }
    //创建用户编辑窗口
    userEditorWindow = new BrowserWindow({
        frame: false,
        height: 600,
        //resizable:false,
        width: 500,
        //maximizable:true,
    });
    const user_edit_url = url.format({
        pathname: path.join(__dirname, 'app/showUser.html'),
        protocol: 'file',
        slashes: true
    });

    userEditorWindow.loadURL(user_edit_url);

    userEditorWindow.webContents.openDevTools();

    //接收用户登录成功之后传过来的用户对象，并发送到用户编辑窗口
    if(message!=undefined){
        userEditorWindow.webContents.on('did-finish-load', function () {
            userEditorWindow.webContents.send('loginUserData', message);
        });
    }

    userEditorWindow.on('closed', () => {
        userEditorWindow = null;
    });

});

//接收窗口最小化通信
ipc.on('mini-user-editor-window', () => {
    userEditorWindow.minimize();
});

//接收窗口变小（还原到原状态）通信
ipc.on('turn-small-user-editor', () => {
    userEditorWindow.unmaximize();
});

//接收窗口最大化通信
ipc.on('turn-big-user-editor', () => {
    userEditorWindow.maximize();
});

//用户编辑窗口点击关闭时通信
ipc.on('close-user-editor-window', () => {
    if (userEditorWindow) {
        userEditorWindow.close();
    }
    if (mainWindow) {
        mainWindow.destroy();
        app.quit();
    }

});

app.on('ready', createWindow);

//所有窗口关闭时，退出程序
app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow == null) {
        createWindow();
    }
//存放使用的api部分，没有调用
    (function (global) {

        var token = 'abc';

        global.token = token; // 将当前闭包内的某个变量绑定到全局环境

    })(this);

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
        }
        return "";
    }

    (function ($) {
        $.fn.serializeJson = function () {
            var serializeObj = {};
            var array = this.serializeArray();
            var str = this.serialize();
            $(array).each(function () {
                if (serializeObj[this.name]) {
                    if ($.isArray(serializeObj[this.name]) && this.value != "") {
                        serializeObj[this.name].push(this.value);
                    } else {
                        if (this.value != "") {
                            serializeObj[this.name] = [serializeObj[this.name], this.value];
                        }
                    }
                } else {
                    if (this.value != "") {
                        serializeObj[this.name] = this.value;
                    }
                }
            });
            return serializeObj;
        };
    })(jQuery);

    function register() {
        var reg_data = ($('#reg_form').serializeJson());
        if (reg_data.username == undefined || reg_data.password == undefined) {
            alert("用户名或密码不能为空");
            return;
        } else
        if (reg_data.student_number == undefined || reg_data.student_password == undefined) {
            alert("教务处学号或密码不能为空");
            return
        }
        else
        if (!$("input[type='checkbox']").is(':checked')) {
            alert("请阅读相关规定后，勾选");
            return;
        }
        console.log(JSON.stringify(reg_data));
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "http://api.revth.com/auth/register2",
            data: JSON.stringify(reg_data), //提交的数据
            contentType: "application/json;charset-UTF-8",
            success: function (result) { //todo
                console.log(result); //打印服务端返回的数据(调试用)
                if (result.status == 0) {
                    // alert("注册成功");
                    $('<div>').appendTo('body').addClass('alert alert-success').html('注册成功').show().delay(1500).fadeOut();
                    // window.location.href = './index.html'
                };
            },
            error: function () {
                alert("注册失败");

            }
        });
    }
    function begin() {
        var login_data = ($('#login_form').serializeJson());
        if (login_data.username == undefined || login_data.password == undefined) {
            alert("用户名或密码不能为空");
            return;
        }
        else
        if (!$("input[type='checkbox']").is(':checked')) {
            alert("请阅读相关规定后，勾选");
            return;
        }
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "http://api.revth.com/auth/login",
            data: JSON.stringify(login_data), //提交的数据
            contentType: "application/json;charset-UTF-8",
            success: function (result) {
                console.log(result); //打印服务端返回的数据(调试用)
                if (result.status == 0) {
                    localStorage.setItem('token', result.data.token)
                    // $.cookie('token',result.data.token,{ path: "/"})
                    // token=result.data.token;
                    // document.cookie="token="+token;
                    alert("登录成功");
                    window.location.href = './menu.html'
                };
            },
            error: function (res) {
                // $("#login_form").reset();
                alert("用户名或密码错误");
            }
        });
    }

    function exit() {
        window.location.href = "./index.html"
    }


////////    begin加入战局    ////////////////
    function game() {//原生
        document.getElementsByClassName("btns")[0].style.display = "none";
        document.getElementsByClassName("loading")[0].style.display = "flex";
        $.ajax({
            headers: {
                "X-Auth-Token": localStorage.token//此处放置请求到的用户token
            },
            type: "POST",
            url: "http://api.revth.com/game/open",//请求url
            contentType: "application/json;charset=UTF-8",
            cacheontrol: "no-cache, no-store, max-age=0, must-revalidate",
            success: (data) => {
                document.getElementsByTagName("title")[0].innerText = '游戏中...等待出牌';
                localStorage.setItem('id', data.data.id);
                localStorage.setItem('card', data.data.card);
                window.location.href = "./game.html";
            },
            error: (err) => {
                alert("开局失败");
                console.log(err);
                document.getElementsByClassName("loading")[0].style.display = "none";
                document.getElementsByClassName("btns")[0].style.display = "flex";
            }
        })

    }

//////    submit    ////////////////

    function submit() {//原生
        var tao = "♠";//$
        var xin = "♥";//&
        var hua = "♣";//*
        var jiao = "♦";//#
        var card_map = { "$": "♣", "&": "♥", "*": "♣", "#": "♦" }
        var index;
        var demo = document.getElementById("AI");
        var cards=[3];
        if (demo.innerText == "AI分析出牌") {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "http://47.101.140.66:80/handle/hello2",
                contentType: "application/json;charset-UTF-8",
                data: JSON.stringify(
                    {
                        "id": parseInt(localStorage.id),
                        "card": localStorage.card
                    }
                ),
                success: function (result) {
                    console.log(JSON.stringify(result.card));
                    for(var i=0;i<3;i++)
                        cards[i]=result.card[i];
                    for (var i = 0; i < 3; i++) {
                        result.card[i] = result.card[i].split(" ");
                    }
                    y = -1;
                    document.getElementById("card").childNodes.forEach(element => {
                        index = 1; y += 1;
                        if (element.nodeType == 1) {
                            element.childNodes.forEach(res => {
                                index++;
                                if (res.nodeType == 1) {
                                    str = result.card[Math.floor(y / 2)][Math.floor(index / 2) - 1]
                                    fuhao = str[0]//符号
                                    shuzu = str.substring(1, str.length)//数字
                                    res.innerHTML = "&nbsp;" + shuzu + "<span>" + card_map[fuhao] + "</span>"
                                }
                            })
                        }
                    });
                    document.getElementById("card").className = "card_click";
                    $('<div>').appendTo('body').addClass('alert alert-success').html('AI分析完成').show().delay(1000).fadeOut();
                    $('<div>').appendTo('body').addClass('alert alert-info').html('出牌中，请稍候').show().delay(1500).fadeOut();
                    // console.log(JSON.stringify(
                    //     {
                    //         "id": parseInt(localStorage.id),
                    //         "card": cards
                    //     }
                    // ))
                    // console.log(cards)
                    $.ajax({
                        headers: {
                            "X-Auth-Token": localStorage.token//此处放置请求到的用户token
                        },
                        type: "POST",
                        dataType: "json",
                        url: "http://api.revth.com/game/submit",
                        // data: JSON.stringify(submit_data), //提交的数据todo
                        data: JSON.stringify(
                            {
                                "id": parseInt(localStorage.id),
                                "card": cards
                            }
                        ),
                        contentType: "application/json;charset-UTF-8",
                        success: function (res) {
                            if (res.status == 0) {
                                $('<div>').appendTo('body').addClass('alert alert-success').html('出牌成功').show().delay(1500).fadeOut();
                            };
                        },
                        error: function (res) {
                            console.log(res);
                            $('<div>').appendTo('body').addClass('alert alert-danger').html('出牌失败').show().delay(1500).fadeOut();
                        }
                    })
                },
                error: function (res) {
                    console.log(res);
                    alert("AI马没了");
                }
            })

            demo.className = "submit_clicked";
            document.getElementById("AI").innerHTML = "返回";
        }
        else {
            window.location.href = "./menu.html";
        }

    }

    function rank() {
        $.ajax({
            type: "GET",
            url: "http://api.revth.com/rank",
            contentType: "application/json;charset-UTF-8",
            success: function (result) {
                for (var i = 0; i < 5; i++) {
                    document.getElementById("name" + i).innerText = result[i].name;
                    document.getElementById("score" + i).innerText = result[i].score;
                }
                $('<div>').appendTo('body').addClass('alert alert-success').html('排行榜获取成功').show().delay(1500).fadeOut();
            },
            error: function (res) {
                console.log(res);
                alert("获取排行榜失败");
            }
        })
    }

////////    history    ////////////////
    function history() {
        window.location.href = "./history.html"
    }
//用于判断当前列表是否已经打开
    var history_flag = {};
    for (var i = 1; i < 300; i++) history_flag[i] = 0;


    function test(obj) {
        var str = obj.parentNode.id;
        str = str.substring(7, str.length) //得到当前的序号
        if (history_flag[parseInt(str)] == 0) {
            $.ajax({
                headers: {
                    "X-Auth-Token": localStorage.token //此处放置请求到的用户token
                },
                type: "GET",
                url: "http://api.revth.com/history" + Math.floor(20000 * Math.random()),//todo
                contentType: "application/json;charset-UTF-8",
                success: function (result) {
                    var arr = result.data.detail
                    if (arr.length > 0) {
                        xxx = '<p>'
                        arr.forEach(element => {
                            xxx += "<span style='color:cadetblue'>name:</span>" + element.name + "   <span style='color:cadetblue'>card:</span>" +
                                element.card + "	<span style='color:cadetblue'>score:</span>" +
                                element
                                    .score + "<br>";
                        });
                        xxx += "</p>"
                    }
                    // document.getElementById("collapse5").childNodes[1].childNodes[1].innerText=JSON.stringify(result.data.detail);
                    // console.log(obj.childNodes[1].innerText[8]);

                    document.getElementById("collapse" + str).childNodes[1].innerHTML = xxx;
                },
                error: function (res) {
                    if (res.responseJSON.status == 3001)
                        $('<div>').appendTo('body').addClass('alert alert-danger').html('找不到战局或未结束').show().delay(1500).fadeOut();
                    else
                        $('<div>').appendTo('body').addClass('alert alert-danger').html('获取对战失败').show().delay(1500).fadeOut();

                }
            })
            history_flag[parseInt(str)] = 1;
        } else {
            history_flag[parseInt(str)] = 0;
        }
    }

});
