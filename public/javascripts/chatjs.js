//connection to host and port
// var socket = io();
// var socket = io.connect('http://localhost');
var socket = io.connect();

//登入登出信息发给系统，顺便更新好友列表
socket.on('loginInfo',function(msg){
  refreshFriend();
	addMsgFromSys(msg);
  Messenger().post({
    message: "<a href=javascript:refreshFriend()>"+msg,
    showCloseButton: true
  });
});

//更新好友列表
socket.on('refreshFriend',function(){
  refreshFriend();
});

//用户名或邮箱已存在
socket.on('userExisted', function() {
  alert('User Exist');
  return;
});

//查无此人
socket.on('userNotExist', function() {
  alert("user doesn't exist");
  return;
});

//查无此人或已经是你的好友
socket.on('friendNotExist', function() {
  alert('The user has been your friend');
  return;
});

//添加在线好友到列表
socket.on('onlineList',function(userList){
	//modify user count
	//modifyUserCount(userList.length);
  addUserOn(userList);
});

//添加离线好友到列表
socket.on('offlineList',function(userList){
  //modify user count
  //modifyUserCount(userList.length);
  addUserOff(userList);
});

//登录成功后的一些操作
socket.on('userInfo',function(userObj){
      $('#myModal').modal('hide');
      $('#username').val('');
      $('#password').val('');
      $('#email').val('');
      $('#msg').focus();
  //should be use cookie or session
	userSelf = userObj;
  $('#spanuser').text('Welcome！'+userObj.name);
});

//接收信息
socket.on('toOne',function(msgObj){
  Messenger().post({
    message: "<a href=\"javascript:focusOnPanelOnline(\'"+msgObj.from.name+"\',\'"+msgObj.from.id+"\');\">"+msgObj.from.name + " send to you:"+ msgObj.msg+"</a>",
    showCloseButton: true
  });
  if(toOneName==msgObj.from.name){
  addMsgFromUser(msgObj,false);}
});

//显示消息到面板
socket.on('sendToPanelUs',function(msgObj){
  addMsgFromUserPre(msgObj,true);
});

//显示消息到面板
socket.on('sendToPanelYou',function(msgObj){
  addMsgFromUserPre(msgObj,false);
});

//搜索用户结果
socket.on('searchResult',function(result){
  $('#namelist').text('username：'+result.name+' gender：'+result.gender+' More Info：');
  document.getElementById("addReason").style.display="inline";
  document.getElementById("namelist").style.display="inline";
  document.getElementById("addSendlabel").style.display="inline";
  $('#addSendlabel').text('');
  $('#addSendlabel').append("<a href=\"javascript:addFriendRequest(\'"+userSelf.name+"\',\'"+result.name+"\');\">"+'Send');
});

//发送好友申请成功
socket.on('requestSuccess',function(){
  alert('Ok');
  $('#searchUser').modal('hide');
  return;
});

//待处理的申请信息
socket.on('requestResult',function(result){
  $('#accnamelist').text('');
  for(var i=0;i<result.length;i++){
    $('#accnamelist').append('username：'+result[i].fromname+"<a href=\"javascript:acceptRequest(\'"+result[i].fromname+"\',\'"+userSelf.name+"\');\">"+'   accept'+"<a href=\"javascript:rejectRequest(\'"+result[i].fromname+"\',\'"+userSelf.name+"\');\">"+'   reject');
    $('#accnamelist').append(document.createElement("br"));
    $('#accnamelist').append('More Info: '+result[i].reason);
    $('#accnamelist').append(document.createElement("br"));
    $('#accnamelist').append(document.createElement("br"));
  }
});

//列出好友列表准备删除
socket.on('friendResult',function(result){
  $('#delnamelist').text('');
  for(var i=0;i<result.length;i++){
    $('#delnamelist').append('username：'+result[i].friend+"<a href=\"javascript:delFriendRequest(\'"+userSelf.name+"\',\'"+result[i].friend+"\');\">"+'   Delete');
    $('#delnamelist').append(document.createElement("br"));
  }
});

//列出好友列表准备分组
socket.on('groupResult',function(result){
  document.getElementById("groupnamelist").style.display="inline";
  $('#groupnamelist').text('');
  for(var i=0;i<result.length;i++){
    $('#groupnamelist').append('username：'+result[i].friend+'   Group：'+result[i].state+"<a href=\"javascript:showGroupModify(\'"+userSelf.name+"\',\'"+result[i].friend+"\',\'"+result[i].state+"\');\">"+'   Change Group');
    $('#groupnamelist').append(document.createElement("br"));
  }
});

//删除成功
socket.on('deleteSuccess',function(){
  refreshFriend();
  alert('Delete Succeeded');
  $('#deleteUser').modal('hide');
  $('#msgcontent').text('');
  $('#chatTitle').text('聊天室');
  return;
});

//修改分组成功
socket.on('updateSuccess',function(){
  refreshFriend();
  alert('Grouping Finished');
  $('#groupUser').modal('hide');
  return;
});

//通过好友申请
socket.on('acceptSuccess',function(){
  refreshFriend();
  alert('OK');
  $('#acceptUser').modal('hide');
  return;
});

//拒绝好友申请
socket.on('clearSuccess',function(){
  alert('OK');
  $('#acceptUser').modal('hide');
  return;
});
