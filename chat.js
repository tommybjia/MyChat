var io = require('socket.io')();
var _ = require('underscore');
var moment = require('moment');
var mysql = require('mysql');
var sqlconn= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aidanchat',
    port: 3306
  });
var userList = [];


io.on('connection',function(socket){

	//注册用户
	socket.on('register',function(user){
		console.log('register is called');
        //将此用户写入数据库
        var insertSQL = 'insert into user values(';
            insertSQL+= '\'' + user.name + '\',';
            insertSQL+= '\'' + user.password + '\',';
            insertSQL+= '\'' + user.email + '\',';
            insertSQL+= '\'' + user.gender + '\')';
            sqlconn.query(insertSQL, function (err1, res1) {
                if (err1) {console.log(err1);socket.emit('userExisted');}
                else{
                console.log("INSERT Return ==> ");
                console.log(res1);

		user.id = socket.id;
		console.log('user.id: '+user.id);
		userList.push(user);

		//用户信息发给系统
		socket.emit('userInfo',user);
		//告诉全世界
		socket.broadcast.emit('loginInfo',user.name+"上线了。");
           
	}
		});
	});

	//用户登录
	socket.on('login',function(user){
		console.log('login is called');
        var selectSQL = "select * from user where "
                  + " name=  '" + user.name + "' "
                  + " and password=  '" + user.password + "'";
        sqlconn.query(selectSQL, function (err, res) {
            if (res[0]==undefined) {socket.emit('userNotExist');}
            else{
                console.log("SELECT Return ==> ");
                console.log(res);

		        user.id = socket.id;
		        console.log('user.id: '+user.id);
		        userList.push(user);
		        //用户信息发给系统
	        	socket.emit('userInfo',user);
	          	//告诉全世界
	           	socket.broadcast.emit('loginInfo',user.name+"上线了。");     
	        }
	        console.log(userList);        
        });

        //将好友列表列出来
        console.log('myfindFriend is called ');
		var selectSQL1 = "select * from relation where "
                  + " user= '" + user.name + "';"
        sqlconn.query(selectSQL1, function (err1, res1) {
            if (err1) {console.log(err1);}
            else{
            	var onlineList=[];
                var offlineList=[];
                for (var i=0;i<res1.length;i++){
                    //看这好友是否在线，findwhere函数很有用
                    var findUser = _.findWhere(userList,{name:res1[i].friend});
                    console.log(findUser);
                    console.log(res1[i]);
                    if(findUser){console.log('online called');
                        findUser.state=res1[i].state;
                    	onlineList.push(findUser);}
                    else{console.log('offline called');
                    var offuser={
                        name:res1[i].friend,
                        state:res1[i].state};
                    	offlineList.push(offuser);}
                }
            //按属性排序
            onlineList=onlineList.sort(function(x, y){
                return x.state > y.state ? 1:-1;
            });
            offlineList=offlineList.sort(function(x, y){
                return x.state > y.state ? 1:-1;
            });
            //在线与离线好友分别发送
            socket.emit('onlineList',onlineList); 
            socket.emit('offlineList',offlineList);
            
            }
        }); 
	});
    
    //其他好友的更新列表
    socket.on('findFriend',function(userSelf){
    	console.log('findFriend is called ');	
		var selectSQL1 = "select * from relation where "
                  + " user= '" + userSelf.name + "';"
        sqlconn.query(selectSQL1, function (err1, res1) {
            if (err1) {console.log(err1);}
            else{
            	var onlineList=[];
                var offlineList=[];
                for (var i=0;i<res1.length;i++){
                    var findUser = _.findWhere(userList,{name:res1[i].friend});
                    console.log(findUser);
                    console.log(res1[i]);
                    if(findUser){console.log('online called');
                        findUser.state=res1[i].state;
                    	onlineList.push(findUser);}
                    else{console.log('offline called');
                        var offuser={
                        name:res1[i].friend,
                        state:res1[i].state};
                    	offlineList.push(offuser);}
                }
            onlineList=onlineList.sort(function(x, y){
                return x.state > y.state ? 1:-1;
            });
            offlineList=offlineList.sort(function(x, y){
                return x.state > y.state ? 1:-1;
            });
            socket.emit('onlineList',onlineList); 
            socket.emit('offlineList',offlineList);
           
            }
        });
    });
    
	//登出
	socket.on('disconnect',function(){
		var user = _.findWhere(userList,{id:socket.id});
		if(user){
			userList = _.without(userList,user);
			socket.broadcast.emit('loginInfo',user.name+"下线了。");
		}
	});

    //搜索用户
    socket.on('searchUser',function(toUser,fromUser){
        console.log('searchUser');
            console.log(toUser);
        var selectSQL = "select * from user where name='" + toUser + "' and name not in(select friend from relation where user='"+ fromUser+"') and name not in(select name from user where name='"+ fromUser+"');";
         sqlconn.query(selectSQL,function(err,res){ 
            console.log(res[0]);
            if (res[0]==undefined){socket.emit('friendNotExist');}
            else{
                socket.emit('searchResult',res[0]);
            }
        });
    });

    //列出申请添加好友列表
    socket.on('listRequest',function(userName){
        var selectSQL = "select * from friendRequest where toname='" + userName + "';";
        sqlconn.query(selectSQL,function(err,res){ 
            if (err){console.log(err);}
            else{
                console.log('requestlist');
                console.log(res);
                if(res)socket.emit('requestResult',res);
                }
        });
    });
  
    //列出好友列表用于删除
    socket.on('listFriend',function(userName){
        var selectSQL = "select * from relation where user='" + userName + "';";
        sqlconn.query(selectSQL,function(err,res){ 
            if (err){console.log(err);}
            else{
                console.log('friendlist');
                console.log(res);
                if(res)socket.emit('friendResult',res);
                }
        });
    });
    
    //列出好友列表用于分组
    socket.on('listGroup',function(userName){
        var selectSQL = "select * from relation where user='" + userName + "';";
        sqlconn.query(selectSQL,function(err,res){ 
            if (err){console.log(err);}
            else{
                console.log('grouplist');
                console.log(res);
                if(res)socket.emit('groupResult',res);
                }
        });
    });
    
    //发送好友申请
    socket.on('addFriendRequest',function(addmsg){
        console.log('addFriendRequest is called');
        /*
            format:{
                from:fromName,
                to:toName,
                reason:reason
            }
        */
        var insertSQL = 'insert into friendRequest values(';
            insertSQL+= '\'' + addmsg.from + '\',';
            insertSQL+= '\'' + addmsg.to + '\',';
            insertSQL+= '\'' + addmsg.reason + '\')';
            sqlconn.query(insertSQL, function (err, res) {
                if (err) {console.log(err);}
                else{
                console.log("INSERT Return ==> ");
                console.log(res);
                socket.emit('requestSuccess');
            }
            });
    });
    
    //接受好友申请
    socket.on('accFriendRequest',function(accmsg){
        console.log('accFriendRequest is called');
        /*
            format:{
                from:fromName,
                to:toName
            }
        */
        var insertSQL = 'insert into relation values(';
            insertSQL+= '\'' + accmsg.from + '\',';
            insertSQL+= '\'' + accmsg.to + '\',';
            insertSQL+= '"未分组")';
            sqlconn.query(insertSQL, function (err, res) {
                if (err) {console.log(err);}
                else{
                console.log("INSERT Return ==> ");
                console.log(res);
            }
            });
        var insertSQL1 = 'insert into relation values(';
            insertSQL1+= '\'' + accmsg.to + '\',';
            insertSQL1+= '\'' + accmsg.from + '\',';
            insertSQL1+= '"未分组")';
            sqlconn.query(insertSQL1, function (err1, res1) {
                if (err1) {console.log(err1);}
                else{
                console.log("INSERT Return ==> ");
                console.log(res1);
            }
            });
        var deleteSQL = "delete from friendRequest where "
                  + " fromname=  '" + accmsg.from + "' "
                  + " and toname=  '" + accmsg.to + "';";
            sqlconn.query(deleteSQL, function (err2, res2) {
                if (err2) {console.log(err2);}
                else{
                console.log("DELETE Return ==> ");
                console.log(res2);
                socket.emit('acceptSuccess');
                socket.broadcast.emit('refreshFriend');
            }
            });
        var deleteSQL = "delete from friendRequest where "
                  + " fromname=  '" + accmsg.to + "' "
                  + " and toname=  '" + accmsg.from + "';";
            sqlconn.query(deleteSQL, function (err3, res3) {
                if (err3) {console.log(err3);}
                else{
                console.log("DELETE Return ==> ");
                console.log(res3);
                //socket.emit('acceptSuccess');
                //socket.broadcast.emit('refreshFriend');
            }
            });
    });
    
    //拒绝好友申请
    socket.on('rejFriendRequest',function(rejmsg){
        console.log('rejFriendRequest is called');
        /*
            format:{
                from:fromName,
                to:toName
            }
        */
       var deleteSQL = "delete from friendRequest where "
                  + " fromname=  '" + rejmsg.from + "' "
                  + " and toname=  '" + rejmsg.to + "';";
            sqlconn.query(deleteSQL, function (err, res) {
                if (err) {console.log(err);}
                else{
                console.log("DELETE Return ==> ");
                console.log(res);
                socket.emit('clearSuccess');
            }
            });
    });


    //删除好友
    socket.on('delFriendRequest',function(delmsg){
        console.log('delFriendRequest is called');
        /*
            format:{
                from:fromName,
                to:toName
            }
        */
       var deleteSQL1 = "delete from message where "
                  + " (fromuser=  '" + delmsg.from + "' "
                  + " and touser=  '" + delmsg.to + "')or"
                  + " (fromuser=  '" + delmsg.to + "' "
                  + " and touser=  '" + delmsg.from + "');";

            sqlconn.query(deleteSQL1, function (err1, res1) {
                if (err1) {console.log(err1);}
                else{
                console.log("DELETE Return ==> ");
                console.log(res1);
            }
            });

       var deleteSQL = "delete from relation where "
                  + " (user=  '" + delmsg.from + "' "
                  + " and friend=  '" + delmsg.to + "')or"
                  + " (user=  '" + delmsg.to + "' "
                  + " and friend=  '" + delmsg.from + "');";

            sqlconn.query(deleteSQL, function (err, res) {
                if (err) {console.log(err);}
                else{
                console.log("DELETE Return ==> ");
                console.log(res);
                socket.emit('deleteSuccess');
                socket.broadcast.emit('refreshFriend');
            }
            });
    });

    //修改好友分组
    socket.on('groupModifyRequest',function(groupmsg){
        console.log('groupModifyRequest is called');
       /* var groupmsg={
        from:fromName,
        to:toName,
        group:groupName
    };*/
        var updateSQL ='update relation set state=';
        updateSQL +='\'' + groupmsg.group + '\'';
        updateSQL +='where user="'+groupmsg.from+'"and ';
        updateSQL +='friend="'+groupmsg.to+'";';

        sqlconn.query(updateSQL, function (err, res) {
                if (err) {console.log(err);}
                else{
                console.log("UPDATE Return ==> ");
                console.log(res);
                socket.emit('updateSuccess');
            }
            });
    });

    //聊天内容放进mysql
    socket.on('putIntoSql',function(msgObj){
		/*
			format:{
				from:from.name,
                to:toOneName,
                msg:msg,
                time:myDate
			}
		*/
		console.log('putIntoSql is called');
        //将信息写入数据库
        var insertSQL = 'insert into message values(';
            insertSQL+= '\'' + msgObj.from + '\',';
            insertSQL+= '\'' + msgObj.to + '\',';
            insertSQL+= '\'' + msgObj.msg + '\',';
            insertSQL+= '\'' + msgObj.time + '\')';

            sqlconn.query(insertSQL, function (err1, res1) {
                if (err1) {console.log(err1);}
                else{
                console.log("INSERT Return ==> ");
                console.log(res1);}
            });
	});
 
    //选择聊天内容
    socket.on('selectChat',function(msgObj){
    	console.log('selectChat is called');
        /*
			format:{
			from:userSelf.name,
  		    to:toOneName,
  		    toId:toOneId,
  		    msg:msg
			}
	  	*/
	    var selectSQL = "select * from message where "
                  + " (fromuser=  '" + msgObj.from + "' "
                  + " and touser=  '" + msgObj.to + "') or"
                  + " (fromuser=  '" + msgObj.to + "' "
                  + " and touser=  '" + msgObj.from + "') "
                  + "order by dayandtime;";
        sqlconn.query(selectSQL, function (err, res) { 
            if (err){console.log(err);}
            else{
            	for (var i=0;i<res.length;i++){
        	        if(res[i].fromuser==msgObj.from){
        	        	var resultname=res[i].fromuser;
        	        	var resultcontent=res[i].content;
                        //规范格式
                        var resulttime=moment(res[i].dayandtime).format('YYYY-MM-DD HH:mm:ss');
                        console.log(resulttime);
        	        	var result={
        	        		name:resultname,
        	        		content:resultcontent,
                            time:resulttime
        	        	};
        	        	socket.emit('sendToPanelUs',result);
        	        	console.log("执行1");
                    }
                    else{
                        var resultname=res[i].name;
        	        	var resultcontent=res[i].content;
                        //规范格式
                        var resulttime=moment(res[i].dayandtime).format('YYYY-MM-DD HH:mm:ss');
                        console.log(resulttime);
        	        	var result={
        	        		name:resultname,
        	        		content:resultcontent,
                            time:resulttime
        	        	};
        	        	socket.emit('sendToPanelYou',result);
        	        	console.log("执行2");
                    }
                console.log("SELECT Return ==> ");
                console.log(res);
                    }
                }
            });
    });


	//发送消息提示框
	socket.on('toOne',function(msgObj){
		/*
			format:{
				from:{
					name:"",
					img:"",
					id:""
				},
				to:"",  //socketid
				msg:""
			}
		*/
		//var toSocket = _.findWhere(socketList,{id:msgObj.to});
		var toSocket = _.findWhere(io.sockets.sockets,{id:msgObj.to});
		console.log(toSocket);
		toSocket.emit('toOne', msgObj);
	});
});
//var jj=[{4:1,2:1,3:1},2,3,4,5];
//qqq=_.findWhere(jj,1);
//qqq.state='state';
//console.log(qqq);

//var test=[{name:'bidan',age:18},{name:'aidan',age:17},{name:'1',age:16}];
//test=test.sort(function(x, y){
//    return x.name > y.name ? 1:-1;
//});
//console.log(test);

exports.listen = function(_server){
	io.listen(_server);
};