//本用户的一些信息
var userSelf = {};
//对方ID和名字
var toOneId;
var toOneName;
$(function(){
	//登录modal
	$('#myModal').modal({
		//backdrop: 'static',
		keyboard: false
	});

	//提示框方向选择
	Messenger.options = {
		extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
		theme: 'future'
	};

	$('.popover-dismiss').popover('show');

	//注册模块
	$('#btn-register').click(function(){
		var name = $('#username').val();
        var password = $('#password').val();
        var email = $('#email').val();
        var gender = $("input[name='gender']:checked").val();
		if((name.trim().length == 0)||(password.trim().length == 0)||(email.trim().length == 0)){
			$('#username').val('');$('#password').val('');$('#email').val('');
			document.getElementById('status').textContent = 'username/password can not be empty';
			$('#username').focus();
		}else if((name.trim().length <6)||(password.trim().length < 6)){
			$('#username').val('');$('#password').val('');
            document.getElementById('status').textContent = 'username has at least six character';
            $('#username').focus();
		}else if(email.indexOf("@")<1||(email.lastIndexOf(".")-email.indexOf("@"))<2){
			$('#email').val('');
            document.getElementById('status').textContent = 'wrong email format';
            $('#email').focus();
        }else{
			var imgList = ["/images/1.jpg","/images/2.jpg","/images/3.jpg"];
			var randomNum = Math.floor(Math.random()*5);
			//random user
			var img = imgList[randomNum];
			//package user
			var dataObj = {
				name:name,
				password:password,
				email:email,
				img:img,
				gender:gender
			};
			//信息发送到server
			socket.emit('register',dataObj);
			$('#username').val('');
			$('#password').val('');
			$('#email').val('');
		}
	});
    
    //登录模块
	$('#btn-login').click(function(){
		var name = $('#username2').val();
        var password = $('#password2').val();

		if((name.trim().length == 0)||(password.trim().length == 0)){
			$('#username2').val('');$('#password2').val('');
			document.getElementById('status2').textContent = 'username/password can not be empty';
			$('#username2').focus();
		}else if((name.trim().length <6)||(password.trim().length < 6)){
			$('#username2').val('');$('#password2').val('');
            document.getElementById('status2').textContent = 'username has at least six character';
            $('#username2').focus();
		}else{
			var imgList = ["/images/1.jpg","/images/2.jpg","/images/3.jpg"];
			var randomNum = Math.floor(Math.random()*5);
			//random user
			var img = imgList[randomNum];
			//package user
			var dataObj = {
				name:name,
				password:password,
				img:img
			};
			//信息发送到server
			socket.emit('login',dataObj);
			$('#username2').val('');
			$('#password2').val('');
		}
	});

    //查找好友icon
    $('#icon-search').click(function() {
    	$('#searchUser').modal();
        document.getElementById("addReason").style.display="none";
        document.getElementById("namelist").style.display="none";
        document.getElementById("addSendlabel").style.display="none";
	    $('#searchUserLabel').text("Search for friend");
    });
    
    //删除好友icon
    $('#icon-delete').click(function() {
    	$('#deleteUser').modal();
    	$('#deleteUserLabel').text("Delete friend");
    	socket.emit('listFriend',userSelf.name);
    });

    //好友申请icon
    $('#icon-accept').click(function() {
    	$('#acceptUser').modal();
    	$('#acceptUserLabel').text("Friend'application");
    	socket.emit('listRequest',userSelf.name);
    });
    
    //分组icon
    $('#icon-group').click(function() {
    	$('#groupUser').modal();
    	document.getElementById("toModify").style.display="none";
        document.getElementById("groupName").style.display="none";
        document.getElementById("groupSendlabel").style.display="none";
    	$('#groupUserLabel').text("Grouping");
    	socket.emit('listGroup',userSelf.name);
    });

    //搜索好友
    $('#btn-search').click(function() {
    	var searchUser = $('#input_searchUser').val();
    	if(searchUser.trim().length == 0){
            $('#input_searchUser').val('');
            document.getElementById('searchUserLabel').textContent = 'Cannot be empty';
    	}else{
    		socket.emit('searchUser',searchUser,userSelf.name);
    		$('#input_searchUser').val('');
    	}	
    });

	//发送信息
    $('#sendMsg').click(function(){
    var msg = $('#msg').val();
    if(msg==''){
      alert('Please enter the message content!');
      return;
    }
    var from = userSelf;
    var myDate = gettime();
    var msgObj = {
  		from:userSelf,
  		to:toOneId,
  		msg:msg,
  		time:myDate
  	};
    var msgObjSql = {
      from:from.name,
      to:toOneName,
      msg:msg,
      time:myDate
    };
    //放进sql
    socket.emit('putIntoSql',msgObjSql);
    //提示框，在线好友专享
    if(toOneId!=undefined){socket.emit('toOne',msgObj);}
    //自己的消息
    addMsgFromUser(msgObj,true);
    $('#msg').val('');
  });

});

//向panel添加历史信息
function addMsgFromUserPre(msgObj,isSelf){
	$('.msg-content').append(msgObj.time);
	var msgType = isSelf?"message-reply":"message-receive";
	var msgHtml = $('<div><div class="message-info"><div class="user-info"><img src="/images/1.jpg" class="user-avatar img-thumbnail"></div><div class="message-content-box"><div class="arrow"></div><div class="message-content">test</div></div></div></div>');
	msgHtml.addClass(msgType);
	//msgHtml.children('.message-info').children('.user-info').children('.user-avatar').attr('src',msgObj.from.img);
	msgHtml.children('.message-info').children('.user-info').children('.user-avatar').attr('title',msgObj.name);
	msgHtml.children('.message-info').children('.message-content-box').children('.message-content').text(msgObj.content);
	$('.msg-content').append(msgHtml);
	//滚动条一直在最底
	$(".msg-content").scrollTop($(".msg-content")[0].scrollHeight);
}

//向panel添加当前信息
function addMsgFromUser(msgObj,isSelf){
	$('.msg-content').append(msgObj.time);
	var msgType = isSelf?"message-reply":"message-receive";
	var msgHtml = $('<div><div class="message-info"><div class="user-info"><img src="/images/1.jpg" class="user-avatar img-thumbnail"></div><div class="message-content-box"><div class="arrow"></div><div class="message-content">test</div></div></div></div>');
	msgHtml.addClass(msgType);
	msgHtml.children('.message-info').children('.user-info').children('.user-avatar').attr('src',msgObj.from.img);
	msgHtml.children('.message-info').children('.user-info').children('.user-avatar').attr('title',msgObj.from.name);
	msgHtml.children('.message-info').children('.message-content-box').children('.message-content').text(msgObj.msg);
	$('.msg-content').append(msgHtml);
	//滚动条一直在最底
	$(".msg-content").scrollTop($(".msg-content")[0].scrollHeight);
}

//系统信息
function addMsgFromSys(msg){
	$.scojs_message(msg, $.scojs_message.TYPE_OK);
}

//在线好友定位到panel
function focusOnPanelOnline(name,id){
	$('#chatTitle').text("Send to "+name);
	$('#msgcontent').text('');
	toOneName = name;
	toOneId = id;
	var msgObj = {
  		from:userSelf.name,
  		frompic:userSelf.img,
  		to:toOneName,
  		toId:toOneId,
  		msg:msg
  	};
	socket.emit('selectChat',msgObj);
    $('#msg').focus();
}

//离线好友定位到panel
function focusOnPanelOffline(name){
	$('#chatTitle').text("Send to "+name);
	$('#msgcontent').text('');
	toOneName = name;
	toOneId = undefined;
	var msgObj = {
  		from:userSelf.name,
  		frompic:userSelf.img,
  		to:toOneName,
  		msg:msg
  	};
	socket.emit('selectChat',msgObj);
    $('#msg').focus();
}

//发送好友申请
function addFriendRequest(fromName,toName){
	var reason=$('#addReason').val();
    var addmsg={
    	from:fromName,
    	to:toName,
    	reason:reason
    };
	socket.emit('addFriendRequest',addmsg);
}

//修改分组申请
function groupModifyRequest(fromName,toName){
	var groupName=$('#groupName').val();
	if(groupName.trim().length == 0){
		groupName='unGroup';
	}
    var groupmsg={
    	from:fromName,
    	to:toName,
    	group:groupName
    };
	socket.emit('groupModifyRequest',groupmsg);
}

//显示好友用于分组
function showGroupModify(fromName,toName,groupName){
  document.getElementById("groupnamelist").style.display="none";
  document.getElementById("toModify").style.display="inline";
  document.getElementById("groupName").style.display="inline";
  document.getElementById("groupSendlabel").style.display="inline";
  $('#toModify').text('username：'+toName+' Group：'+groupName+' Grouping to：');
  $('#groupSendlabel').text('');
  $('#groupSendlabel').append("<a href=\"javascript:groupModifyRequest(\'"+fromName+"\',\'"+toName+"\');\">"+'OK');
}

//删除好友申请
function delFriendRequest(fromName,toName){
    var delmsg={
    	from:fromName,
    	to:toName,
    };
	socket.emit('delFriendRequest',delmsg);
}

//接受好友申请
function acceptRequest(fromName,toName){
    var accmsg={
    	from:fromName,
    	to:toName,
    };
	socket.emit('accFriendRequest',accmsg);
}
//拒绝好友申请
function rejectRequest(fromName,toName){
    var rejmsg={
    	from:fromName,
    	to:toName,
    };
	socket.emit('rejFriendRequest',rejmsg);
}

//在线好友列表
function addUserOn(userList){
	var parentUl = $('.user-contentOn').children('ul');
	var cloneLi = parentUl.children('li:first').clone();
	parentUl.html('');
	parentUl.append(cloneLi);
	for(var i in userList){
		var cloneLi = parentUl.children('li:first').clone();
		cloneLi.children('a').attr('href',"javascript:focusOnPanelOnline('"+userList[i].name+"','"+userList[i].id+"');");
		cloneLi.children('a').children('img').attr('src',userList[i].img);
		cloneLi.children('a').children('span').text(userList[i].name+'   ('+userList[i].state+')');
		cloneLi.show();
		parentUl.append(cloneLi);
	}
}

//离线好友列表
function addUserOff(userList){
	var parentUl = $('.user-contentOff').children('ul');
	var cloneLi = parentUl.children('li:first').clone();
	parentUl.html('');
	parentUl.append(cloneLi);
	for(var i in userList){
		var imgList = ["/images/1.jpg","/images/2.jpg","/images/3.jpg"];
		var randomNum = Math.floor(Math.random()*5);
		//random user
		var img = imgList[randomNum];

		var cloneLi = parentUl.children('li:first').clone();
		cloneLi.children('a').attr('href',"javascript:focusOnPanelOffline('"+userList[i].name+"');");
		cloneLi.children('a').children('img').attr('src',img);
		cloneLi.children('a').children('span').text(userList[i].name+'   ('+userList[i].state+')');
		cloneLi.show();
		parentUl.append(cloneLi);
	}
}

//send message enter function
function keywordsMsg(e){
	var event1 = e || window.event;
	if(event1.keyCode == 13){
		$('#sendMsg').click();
	}
}

//set name enter function
function keywordsName(e){
	var event1 = e || window.event;
	if(event1.keyCode == 13){
		$('#btn-register').click();
	}
}
//send to one enter function

function keywordsName1(e){
	var event1 = e || window.event;
	if(event1.keyCode == 13){
		$('#password2').focus();
	}
}
function keywordsName2(e){
	var event1 = e || window.event;
	if(event1.keyCode == 13){
		$('#btn-login').click();
	}
}

//刷新好友
function refreshFriend(){
	socket.emit('findFriend',userSelf);
}

//时间函数
function gettime(){
    var year = new Date().getFullYear();       //年
    var month = new Date().getMonth()+1;         //月
    var day = new Date().getDate();            //日
    var hh = new Date().getHours();            //时
    var mm = new Date().getMinutes();          //分 
    var ss = new Date().getSeconds();
    return(year+'-'+month+'-'+day+' '+hh+':'+mm+':'+ss);
}
