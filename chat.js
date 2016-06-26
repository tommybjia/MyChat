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

	socket.on('register',function(user){
		console.log('register is called');
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

		socket.emit('userInfo',user);
		socket.broadcast.emit('loginInfo',user.name+"上线了。");
           
	}
		});
	});

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
	        	socket.emit('userInfo',user);
	           	socket.broadcast.emit('loginInfo',user.name+"上线了。");     
	        }
	        console.log(userList);        
        });

        console.log('myfindFriend is called ');
		var selectSQL1 = "select * from relation where "
                  + " user= '" + user.name + "';"
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
    
	socket.on('disconnect',function(){
		var user = _.findWhere(userList,{id:socket.id});
		if(user){
			userList = _.without(userList,user);
			socket.broadcast.emit('loginInfo',user.name+"下线了。");
		}
	});

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
    
    socket.on('addFriendRequest',function(addmsg){
        console.log('addFriendRequest is called');
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
    
    socket.on('accFriendRequest',function(accmsg){
        console.log('accFriendRequest is called');
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
            }
            });
    });
    
    socket.on('rejFriendRequest',function(rejmsg){
        console.log('rejFriendRequest is called');
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


    socket.on('delFriendRequest',function(delmsg){
        console.log('delFriendRequest is called');
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

    socket.on('groupModifyRequest',function(groupmsg){
        console.log('groupModifyRequest is called');
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

    socket.on('putIntoSql',function(msgObj){
		console.log('putIntoSql is called');
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
 
    socket.on('selectChat',function(msgObj){
    	console.log('selectChat is called');
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


	socket.on('toOne',function(msgObj){

		var toSocket = _.findWhere(io.sockets.sockets,{id:msgObj.to});
		console.log(toSocket);
		toSocket.emit('toOne', msgObj);
	});
});


exports.listen = function(_server){
	io.listen(_server);
};