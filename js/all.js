

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

function jumpregister() {window.location.href = 'register.html'

}

function begin() {
    var login_data = ($('#login_form').serializeJson());
    if (login_data.username == undefined || login_data.password == undefined) {
        alert("用户名或密码不能为空");
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
                window.location.href = 'menu.html'
            };
        },
        error: function (res) {
            // $("#login_form").reset();
            alert("用户名或密码错误");
        }
    });
}

function exit() {
    window.location.href = "index.html"
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
            window.location.href = "menu.html";
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
            url: "http://api.revth.com/game/submit",
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
                    ), //提交的数据todo
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
                alert("AI失联...");
            }
        })

        demo.className = "submit_clicked";
        document.getElementById("AI").innerHTML = "返回";
    }
    else {
        window.location.href = "start.html";
    }

}
// arr=[1,""]

// count=0;
// function game() {
//     $.ajax({
//         headers: {
//             "X-Auth-Token": localStorage.token//此处放置请求到的用户token
//         },
//         type: "POST",
//         url: "https://api.shisanshui.rtxux.xyz/game/open",//请求url
//         contentType: "application/json;charset=UTF-8",
//         cacheontrol: "no-cache, no-store, max-age=0, must-revalidate",
//         success: (result) => {
//             var pai=new Array();
//             pai=changeData(result.data.card);
//             game_id=result.data.id;
//             dun=changeData1(main(pai));
//             arr[0]=result.data.id
//             count++;
//             submit();
//         },
//         error: (err) => {
//             submit();
//         }
//     })
// }

// function submit() {
    
            
//             $.ajax({
//                 headers: {
//                     "X-Auth-Token": localStorage.token//此处放置请求到的用户token
//                 },
//                 type: "POST",
//                 dataType: "json",
//                 url: "https://api.shisanshui.rtxux.xyz/game/submit",
//                 data: JSON.stringify(
//                     {
//                         "id": parseInt(arr[0]),
//                         "card": dun
//                     }
//                 ), //提交的数据todo
//                 contentType: "application/json;charset-UTF-8",
//                 success: function (res) {
//                     count++;
//                     if(count==10)
//                     setTimeout("game()",1000);
//                     else
//                     game();
//                 },
//                 error: function (res) {
//                     count++;
//                     if(count==10)
//                     setTimeout("game()",3000);
//                     else
//                     game();
//                 }
//             })

    
// }






////////    rank    ////////////////
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
    window.location.href = "history.html"
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


////////////////////////////////////////////////////////////////

function changeData(data){
    var pai=new Array();
    var num=0;
    for(var i=0;;){
        if(data[i+1]=='A')data[i+1]='>';
        if(data[i+1]=='J')data[i+1]=";";
        if(data[i+1]=='Q')data[i+1]='<';
        if(data[i+1]=='K')data[i+1]='=';
        for(var j=0;j<4;j++){
            if(data[i]=="$"&&data[i+1]=='1'&&data[i+2]=='0'){
                pai[num]=32;
                num+=1;
                i+=4;
                break;
            }else if(data[i]=="&"&&data[i+1]=='1'&&data[i+2]=='0'){
                pai[num]=33;
                num+=1;
                i+=4;
                break;
            }else if(data[i]=="*"&&data[i+1]=='1'&&data[i+2]=='0'){
                pai[num]=34;
                num+=1;
                i+=4;
                break;
            }else if(data[i]=="#"&&data[i+1]=='1'&&data[i+2]=='0'){
                pai[num]=35;
                num+=1;
                i+=4;
                break;
            }else if(data[i]=="$"){
                if(data[i+1]=='A')pai[num]=48;
                else if(data[i+1]=='J')pai[num]=36;
                else if(data[i+1]=='Q')pai[num]=40;
                else if(data[i+1]=='K')pai[num]=44;
                else pai[num]=(data[i+1]-2-'0')*4;
                num+=1;
                i+=3;
                break;
            }else if(data[i]=="&"){
                if(data[i+1]=='A')pai[num]=49;
                else if(data[i+1]=='J')pai[num]=37;
                else if(data[i+1]=='Q')pai[num]=41;
                else if(data[i+1]=='K')pai[num]=45;
                else pai[num]=(data[i+1]-2-'0')*4+1;
                num+=1;
                i+=3;
                break;
            }else if(data[i]=="*"){
                if(data[i+1]=='A')pai[num]=50;
                else if(data[i+1]=='J')pai[num]=38;
                else if(data[i+1]=='Q')pai[num]=42;
                else if(data[i+1]=='K')pai[num]=46;
                else pai[num]=(data[i+1]-2-'0')*4+2;
                num+=1;
                i+=3;
                break;
            }else if(data[i]=="#"){
                if(data[i+1]=='A')pai[num]=51;
                else if(data[i+1]=='J')pai[num]=39;
                else if(data[i+1]=='Q')pai[num]=43;
                else if(data[i+1]=='K')pai[num]=47;
                else pai[num]=(data[i+1]-2-'0')*4+3;
                num+=1;
                i+=3;
                break;
            }
        }
        if(num==13)break;
    }
    return pai;
}

function changeData1(dun){
    var Dun=new Array();
    for(var i=0;i<3;i++){
        var a,b;
        var c="";
        for(var j=0;j<5;j++){
            a=dun[i][j]%4;
            b= Math.floor(dun[i][j] / 4)+2; 
            if(a==0){
                if(b==10)c+='$10';
                else if(b==11)c+='$J';
                else if(b==12)c+='$Q';
                else if(b==13)c+='$K';
                else if(b==14)c+='$A';
                else {
                    c+='$';
                    c+=b;
                }
            }
            if(a==1){
                if(b==10)c+='&10';
                else if(b==11)c+='&J';
                else if(b==12)c+='&Q';
                else if(b==13)c+='&K';
                else if(b==14)c+='&A';
                else {
                    c+='&';
                    c+=b;
                }
            }
            if(a==2){
                if(b==10)c+='*10';
                else if(b==11)c+='*J';
                else if(b==12)c+='*Q';
                else if(b==13)c+='*K';
                else if(b==14)c+='*A';
                else {
                    c+='*';
                    c+=b;
                }
            }
            if(a==3){
                if(b==10)c+='#10';
                else if(b==11)c+='#J';
                else if(b==12)c+='#Q';
                else if(b==13)c+='#K';
                else if(b==14)c+='#A';
                else {
                    c+='#';
                    c+=b;
                }
            }
            if(i==0&&j==2){
                Dun[i]=c;
                break;
            }else if(i!=0&&j==4){
                Dun[i]=c;
                break;
            }else{
                c+=" ";
            }
        }
    }
    return Dun;
}


// 返回对子
function getDuizi(cards){
    // @params: cards 为后台发回来的牌组
    // 长度判断，暂不做
    var result = [];
    var numbers = classifyCard(cards).numbers;
    // 得到对子
    numbers.forEach(function(data ,i){
        if( data.length == 2 ){
        // 表明有对子
        result.push( [ data[0]+4*i ,data[1]+4*i ] );
        }
        if( data.length == 3 ){
            result.push(
                [ data[0]+4*i ,data[2]+4*i ],
                [ data[0]+4*i ,data[1]+4*i ],
                [ data[1]+4*i ,data[2]+4*i ]
                );
        }
        if( data.length == 4 ){
            result.push(
                [ data[0]+4*i ,data[1]+4*i ],
                [ data[0]+4*i ,data[2]+4*i ],
                [ data[0]+4*i ,data[3]+4*i ],
                [ data[1]+4*i ,data[2]+4*i ],
                [ data[1]+4*i ,data[3]+4*i ],
                [ data[2]+4*i ,data[3]+4*i ]
                );
        }});
        var result1=[]
        for(var i=result.length-1;i>=0;i--)
        {
            result1.push(result[i]);
        }
    return result1;
}

//返回连对
function getliandui(cards){
    let result = [];
    duizi=getDuizi(cards);
    for(var i=0;i<duizi.length-1;i++){
        for(var j=i+1; j<duizi.length; j++){
            a1=Math.floor(duizi[i][0]/4) ;
            b=Math.floor( duizi[j][0]/4);
            if(a1 == b - 1){
                result.push([
                            duizi[i][0],
                            duizi[i][1],
                            duizi[j][0],
                            duizi[j][1]
                            ]);
        
                            }  
                        }
                         
        }
    return result;
}

// 返回三条
function getSantiao(cards){
    var result = [];
    var numbers = classifyCard(cards).numbers;
    numbers.forEach(function(data,i){
    if( data.length == 3 ){
        result.push( [ data[0]+4*i ,data[1]+4*i ,data[2]+4*i] );
    }
    if( data.length == 4){
        result.push(
            [ data[0]+4*i ,data[1]+4*i ,data[2]+4*i],
            [ data[3]+4*i ,data[1]+4*i ,data[2]+4*i],
            [ data[0]+4*i ,data[1]+4*i ,data[3]+4*i],
            [ data[0]+4*i ,data[2]+4*i ,data[3]+4*i])
        }
    })
    var result1=[]
        for(var i=result.length-1;i>=0;i--)
        {
            result1.push(result[i]);
        }
    return result;
}

// 返回顺子
function getShunzi(cards){
    // [4, 45, 37, 46, 6, 7, 47, 30, 13, 0, 34, 41, 5] 顺子测试集
    
    var numbers = classifyCard(cards).numbers;
    var _tempArr = [];// [[],[i ,len ]],i前的 len 个连在一起
    var len = 0;
    for(var i = 0;i<13;i++){
        if(numbers[i].length == 0){
            len > 4 ? _tempArr.push([i-1,len]):null;
            len = 0;
        }else{
            len++;
        }
        if( i==12 && len > 4 ){
            _tempArr.push([i,len]);
        }
    }
    // 第一层循环，所有连成片的
    var shunzi=[];
    var result=[];
    for(var i = 0 ;i<_tempArr.length; i++){
        // 第二层，单个连片的;每次取出
        for(var k=0;k<_tempArr[i][1]-4 ;k++){//每次取5个,j 表示分片起始位置
            var j = k+_tempArr[i][0]-_tempArr[i][1]+1;

            for(var k1=0;k1<numbers[j].length;k1++){
                
                shunzi.push(numbers[j][k1]+j*4);
                
                for(var k2=0;k2<numbers[j+1].length;k2++){
                    
                    shunzi.push(numbers[j+1][k2]+(j+1)*4);
                    
                    for(var k3=0;k3<numbers[j+2].length;k3++){
                        
                        shunzi.push(numbers[j+2][k3]+(j+2)*4);
                        
                        for(var k4=0;k4<numbers[j+3].length;k4++){
                            
                            shunzi.push(numbers[j+3][k4]+(j+3)*4);
                            
                            for(var k5=0;k5<numbers[j+4].length;k5++){
                                shunzi.push(numbers[j+4][k5]+(j+4)*4);
                                result.push([shunzi[0],shunzi[1],shunzi[2],shunzi[3],shunzi[4]]);
                                shunzi.splice(4,1);
                                
                            }
                            shunzi.splice(3,1);
                        }
                        shunzi.splice(2,1);
                    }
                    shunzi.splice(1,1);
                }
                shunzi.splice(0,1);
                
            }
        }
    }
    return result;
}

// 返回同花
function getTonghua(cards){
    // [18, 29, 24, 46, 41, 45, 51, 32, 23, 11, 20, 31, 30] 无
    // [46, 44, 35, 18, 28, 2, 34, 31, 13, 48, 22, 32, 20] 有
    var result = [];
    var colors = classifyCard(cards).colors;
    colors.forEach(function(data,i){
        if(data.length > 4){
            // 还原成点数
            var _tempData = data.map(function(a){ return a*4+i ;});
            // 排列组合 data ,并 push 到结果 result 中
            result.push( combination(_tempData ,5) );
        }
    });
    
    var result1=[];
    for(var i=0;i<result.length;i++){
        for(var j=0;j<result[i].length;j++){
            result1.push(result[i][j]);
        }
    }
    return result1;
}

// 返回葫芦
function getHulu(cards){
    // [39, 27, 30, 41, 47, 3, 31, 45, 13, 26, 29, 34, 21] 存在，且交叉
    var result = [];
    var sanTiao = this.getSantiao(cards);
    var duizi = this.getDuizi(cards);
    var _temp = [];
    // 如果三条和对子都存在
    if(sanTiao.length && duizi.length){
        _temp = combination2([sanTiao,duizi],2);
    }
    for(var i=0 ;i<_temp.length ;i++){
        if(Math.floor( _temp[i][0]/4 )!= Math.floor( _temp[i][3]/4 )){
            result.push(_temp[i]);
        }
    }
    var result1=[]
    for(var i=result.length-1;i>=0;i--)
     {
            result1.push(result[i]);
        }
    return result;
}

// 返回炸弹
function getZhadan(cards){
    var result = [];
    var numbers = classifyCard(cards).numbers;
    numbers.forEach(function(data,i){
        if( data.length == 4){
            result.push([ data[0]+i*4 ,data[1]+i*4 ,data[2]+i*4 ,data[3]+i*4]);
        }
    })
    return result;
}

// 返回同花顺
function getTonghuashun(cards){
    // [46, 44, 35, 18, 33, 2, 34, 31, 13, 48, 22, 32, 20] 有
    // [18, 29, 24, 46, 41, 45, 51, 32, 23, 11, 20, 31, 30] 无
    var result = [];
    // 判断是否为顺子
    var isShunzi = function(arr){
    // 测试成功 isShunzi([1,2,3,4,18]); isShunzi([1,2,3,4,6])
    if(arr.length < 5){
        // 之前的BUG 出现在这里。运行时传入的参数为 [[31,32,33,34,35]]
        arr = arr[0];
    }
    var flag = true;
    var _temp = [];
    for(var i = 0 ; i<arr.length ;i++){
        // _temp.push( arr[i] % 13 );
        _temp.push( Math.floor( arr[i] / 4) );
    }
    _temp.sort(function(a,b){return a-b;})
        .forEach(function(a,b){ a == _temp[0]+b ? null : flag=false;});
    // 补充 A2345 这种特殊情况
    
        // if( (_temp[0]+1 == _temp[1]) &&(_temp[0]+2 == _temp[2]) &&(_temp[0]+3 == _temp[3]) &&(_temp[0]+4 == _temp[4]));顺子的判断方法一
        return flag;
    }


    var _tempResult = this.getTonghua(cards);
    if(_tempResult==0)
    {
        return result;
    }
    for(var i = 0; i< _tempResult.length ;i++){
        var _aa = _tempResult[i];

        // 此处有问题，需要再考虑仔细，运行不通，无法判断 -- 已解决，见 @line 175
        
        if( isShunzi( _aa ) ){
            result.push( _tempResult[i]);
        }
    }
    return result;
}

// 对牌进行分类
function classifyCard(cards){
    // 将牌进行排序分类
    // color 花色
    var colors = [
    // "黑":[],
    // "红":[],
    // "梅":[],
    // "方":[],
    // "0":[],"1":[],"2":[],"3":[]
    [],[],[],[]
    ];
    // number 点数
    var numbers = [
    // "0":[],"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[]
    // 0,1,2,3,4,5,6,7,8,9,10,11,12
    [],[],[],[],[],[],[],[],[],[],[],[],[]
    ];
    // 将牌分类;
    cards.forEach(function(card){
        // 获取花色 : 0-13 为同一花色做法
        // var _color = Math.floor( card / 13 );
        // // 获取点数
        // var _num = (card % 13);
        // 0-4 为一个点数写法
        var _color = card % 4;
        var _num = Math.floor( card / 4 );
        colors[_color].push( _num );
        numbers[_num].push(_color);
    });

    // 还原成牌的大小; 0-13 为同一花色的写法
    // colors[i][j] : card = i*13 + j;
    // numbers[i][j] : card = j*13 + i;
    // 还原成牌的大小; 0-4 为同一点数的写法
    // colors[i][j] : card = j*4 + i;
    // numbers[i][j] : card = i*4 + j;
    return {"colors":colors,"numbers":numbers};
}

// 排列组合
function combination(arr, num){
    var r=[];
    (function f(t,a,n){
        if (n==0)
        {
            return r.push(t);
        }
        for (var i=0,l=a.length; i<=l-n; i++)
        {
            f(t.concat(a[i]), a.slice(i+1), n-1);
        }
    })([],arr,num);
    return r;
}

// 畸形排列组合 --- 用于找顺子后的排列，包含同一点数不同花数
function combination2(arr, num){
    var r=[];
    (function f(t,a,n)
    {
        if (n==0)
        {
            return r.push(t);
        }
        for (var i=0,l=a.length; i<=l-n; i++)
        {
            for(var j=0;j<a[i].length ;j++){
                f(t.concat(a[i][j]), a.slice(i+1), n-1);
            }
        }

    })([],arr,num);
    return r;
}

// 将牌排序 -- 舍弃
function sortCards(cards){
    var result = [];
    // 鸽巢法
    var allSort = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // 每个位置 i 代表的牌数为 (51 - i)
    for(var i = 0 ;i<cards.length ;i++){
        allSort[51-cards[i]] = 1;
    }

    for(var i = 51 ;i>=0 ;i--){
        if(allSort[i]){
            result.push( 51 - i );
        }
    }
    return result;
}

function sortCardsmax(cards){
    var result = [];
    // 鸽巢法
    var allSort = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // 每个位置 i 代表的牌数为 (51 - i)
    for(var i = 0 ;i<cards.length ;i++){
        allSort[51-cards[i]] = 1;
    }

    for(var i = 0 ;i<52 ;i++){
        if(allSort[i]){
            result.push(51-i);
        }
    }
    return result;
}

//从数组中删去
function cut(needcut,cards){
    if(needcut==[] ||needcut==undefined){
        return cards;
    }
    var result = [];
    // 鸽巢法
    var allSort = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // 每个位置 i 代表的牌数为 (51 - i)
    
    for(var i = 0 ;i<cards.length ;i++){
        allSort[51-cards[i]] = 1;
    }
    if(needcut.length==1){
            for(var i=0 ;i<needcut[0].length ;i++)
        {
            allSort[51-needcut[0][i]]=0;
            
        }
    }
    else{
            for(var i=0 ;i<needcut.length ;i++)
        {
            allSort[51-needcut[i]]=0;
        }
    }
    
    
    for(var i = 51 ;i>=0 ;i--){
        if(allSort[i]){
            result.push( 51 - i );
        }
    }
    return result;
}

//取尾墩
function one(cards)
{
    var result = [];
    result=getTonghuashun(cards);
    if(result.length!=0){
        return result;
    }
    result=getZhadan(cards);
    if(result.length!=0){
        return result;
    }
    result=getHulu(cards);
    if(result.length!=0){
        return result;
    }
    result=getTonghua(cards);
    if(result.length!=0){
        return result;
    }
    result=getShunzi(cards);
    if(result.length!=0){
        return result;
    }
    result=getSantiao(cards);
    if(result.length!=0){
        return result;
    }
    result=getliandui(cards);
    if(result.length!=0){
        return result;
    }
    result=getDuizi(cards);
    if(result.length!=0){
        return result;
    }
    return result;
}
function two(cards){
    var result=[];
    result=getTonghuashun(cards);
    if(result.length!=0){
        return 8;
    }
    result=getZhadan(cards);
    if(result.length!=0){
        return result;
    }
    result=getHulu(cards);
    if(result.length!=0){
        return 6;
    }
    result=getTonghua(cards);
    if(result.length!=0){
        return 5;
    }
    result=getShunzi(cards);
    if(result.length!=0){
        return 4;
    }
    result=getSantiao(cards);
    if(result.length!=0){
        return 3;
    }
    result=getliandui(cards);
    if(result.length!=0){
        return 2;
        
    }
    result=getDuizi(cards);
    if(result.length!=0){
        return 1;
       
    }
    return 0;
} 
function onechoose(needcut,cards){
    jiacards=cards;
    if(needcut.length==1 ||needcut==0)
    {
        return needcut;
    }
    var max=-1;
    
    for(var i=0 ;i<needcut.length;i++){
        if(max <two( cut( needcut[i],jiacards)) ){
            var maxone=i;
            max=two( cut( needcut[i],jiacards))
        }
    }
    return needcut[maxone];
}

//取中墩
function main(a)
{
    var b1=one(a);
    dun=[];
    needcut1=onechoose(b1,a);
    dun[2]=needcut1;
    a=cut(needcut1,a);
    
    var b2=one(a);
    needcut2=onechoose(b2,a);
    dun[1]=needcut2;
    a=cut(needcut2,a);
    
    var b3=one(a);
    needcut3=onechoose(b3,a);
    dun[0]=needcut3;
    a=cut(needcut3,a);
    sortCards(a);
    
    //调整数组
    
    for(var i=0;i<dun.length;i++){
        var ex=[]
        if( dun[i].length==1 ){
            for(var j=0;j<dun[i][0].length;j++){
                ex.push(dun[i][0][j]);
            }
            dun[i]=ex;
        }
        
    }
    var qq=0
    for(var w=2;w>0;w--){
        if(dun[w].length==0){
            dun[w].push(a[a.length-1]);
            a.splice(a.length-1,1)
        }
        if(dun[w].length!=5){
            for(var j=0;j<5-dun[w].length;i++){
                dun[w].push(a[0]);
                qq=j;
                a.splice(0,1);
            }
        }
    }
    
    for(var i=0;i<a.length;i++){
        dun[0].push(a[i]);
    }
    x1=two(dun[2]);
    x2=two(dun[1]);
    x3=dun[2];
    x4=dun[1];
    if(x1<x2){
        var t1=dun[1];
        dun[1]=dun[2];
        dun[2]=t1;
    }
    if(x1==5 || x1==4 || x1==8){
        x3=sortCardsmax(dun[2]);
        x4=sortCardsmax(dun[1]);
        if(x1==x2){
            for(var i=0;i < 5;i++)
            {
                if(Math.floor(x3[i]/4)>Math.floor(x4[i]/4)){
                    i=5;
                    break;
                }
                if(Math.floor(x3[i]/4)<Math.floor(x4[i]/4)){
                    var t=dun[1];
                    dun[1]=dun[2];
                    dun[2]=t;
                    i=5;
                    break;
                }
            }   
            }
    }
    else{
        if(x1==x2){
                if(Math.floor(x3[0]/4)<Math.floor(x4[0]/4)){
                    var t=dun[1];
                    dun[1]=dun[2];
                    dun[2]=t;
                }
            }
                
            
    }
    
    
    return dun;
}
