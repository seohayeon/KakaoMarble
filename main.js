/**Made By IMIS
*KakaoMable 1.0
**/
const scriptName = "카카오마블";
const version = "1.0";

importPackage(javax.net.ssl);
importPackage(java.lang);
importPackage(java.net);
importPackage(java.io);

importPackage(org.jsoup);


const { KakaoLinkClient } = require('kakaolink'); 
const Kakao = new KakaoLinkClient("JAVASCRIPT KEY", "URL") 
Kakao.login("EMAIL", "PASSWORD"); 
const goldKey = require("goldkey")

/* ---------------------------------------------------------------------------- */

let gamePlayerList = [],	// 플레이어 목록
    gamePlayerData = {},	// 플레이어 데이터
    gameStatus = "off",
    turn = 0,
    roomName = "보드게임",	//방설정
    boardImg = "/c_thumb,h_100,w_100,l_avatar1/fl_layer_apply,g_south_east,x_0,y_0/c_thumb,h_100,w_100,l_avatar1/fl_layer_apply,g_south_east,x_50,y_0/"
    isBuying = false,
    aiPower = false;

let boardLocation = []
let chkNum = /\d/ ; 
let welfare = 0;
let universeTrip = false;
let base_money = 5000000;

/* ---------------------------------------------------------------------------- */

let ImgLink;
let locationDB = Jsoup.connect("http://pocript.com/kakaomarble/country.json")
                 .userAgent("Mozilla")
                 .ignoreContentType(true)
                 .execute().body();
let location = JSON.parse(locationDB).country

let keyDB = Jsoup.connect("http://pocript.com/kakaomarble/goldkey.json")
.userAgent("Mozilla")
.ignoreContentType(true)
.execute().body();

let goldkey = JSON.parse(keyDB).goldkey

const Bot = {};

const Game = {
  main:function(room, message, sender){
          let isCommand = message.charAt(0) == "/";
            //(isCommand) ? Game.command(room, message, sender) : "";
            Game.command(room, message, sender)
    },
  command : function(room, message, sender){
      if(message=="/보드게임 생성"){
          if (gameStatus == "produce") Bot.reply("이미 생성된방이 존재합니다./보드게임 참여 를 입력해주세요.") 
           else{
             Game.PlayerAdd(sender);
             Bot.reply(sender+"님이 게임을 생성하셨습니다. 참여하실분은 /보드게임 참여 를 입력해주세요.");
             gameStatus = "produce";
            }
      }else if(message == "/도움말"){
        Bot.reply("카카오마블 " + version + "도움말\n"+
                  "/보드게임 생성: 게임을 생성합니다.\n" +
                  "/보드게임 참여: 생성된 게임에 참여합니다.\n" +
                  "/보드게임 시작: 게임을 시작합니다.\n" +
                  "/보드게임 종료: 게임을 종료합니다.\n" +
                  "/도움말: 게임도움말을 봅니다.");
      }else if(message == "/보드게임 종료"){
        Bot.reply("보드게임이 종료되었습니다.");
        Game.PowerOff();
      }else if(message=="/보드게임 참여"&&gameStatus == "produce"){
        if (Game.CheckPlayerNick(sender))  Bot.reply("이미 동일한 닉네임이 게임에 존재합니다.닉네임을 바꿔주세요.");
        else{
          Game.PlayerAdd(sender);
          Bot.reply(sender+"님이 게임에 참여하셨습니다.\n현재 참여자:"+ gamePlayerList.join("\n"));
        }
      }else if(message=="/보드게임 시작"){
        if(gamePlayerList.length<2){
          Bot.reply(sender+"최소 두명의 플레이어가 참여해야합니다.");
        }else{
          gameStatus = "start";
          Bot.reply("보드게임을 시작합니다. 순서는 "+gamePlayerList.join(" -> ")+" 입니다.\n"+Game.WhoIsTurn()+"님 /주사위를 입력해주세요.");
        }
      }
      
      if(gameStatus != "start") return;
      
      if(message == "1" || message == "2" || message == "3" || message == "4" || message == "5"){
        if(sender != gamePlayerList[turn] || !isBuying) return;
        let type = message
        let mySpot = Game.WhereIsAvatar(sender)
        
        switch (type) { 
          case "1": 
            Bot.reply("땅 구매를 취소했습니다.");
            Timer.stopTimer()
            Game.ChangeTurn()
          break; 
          case "2": 
            Bot.reply("땅을 구매했습니다."); 
            mySpot.owner = {};
            mySpot.owner.name = sender;
            mySpot.owner.toll = mySpot.toll.ground;
            let price1 = mySpot.price.ground;
            Game.GetMoney(sender,price1*10000)
            Timer.stopTimer()
            Game.ChangeTurn()
          break; 
          case "3": 
            if(!mySpot.price.hotel) return;
            Bot.reply("호텔을 지었습니다."); 
            mySpot.owner = {};
            mySpot.owner.name = sender;
            mySpot.owner.toll = mySpot.toll.hotel;
            let price2 = mySpot.price.hotel;
            Game.GetMoney(sender,price2*10000)
            Timer.stopTimer()
            Game.ChangeTurn()
          break; 
          case "4": 
            if(!mySpot.price.hotel) return;
            Bot.reply("빌딩을 지었습니다."); 
            mySpot.owner = {};
            mySpot.owner.name = sender;
            mySpot.owner.toll = mySpot.toll.building;
            let price3 = mySpot.price.building;
            Game.GetMoney(sender,price3*10000)
            Timer.stopTimer()
            Game.ChangeTurn()
          break; 
          case "5": 
            if(!mySpot.price.hotel) return;
            Bot.reply("별장을 지었습니다."); 
            mySpot.owner = {};
            mySpot.owner.name = sender;
            mySpot.owner.toll = mySpot.toll.villa;
            let price4 = mySpot.price.villa;
            Game.GetMoney(sender,price4*10000)
            Timer.stopTimer()
            Game.ChangeTurn()
          break; 
          default: return; 
          }
      }else if(message&&universeTrip&&sender == gamePlayerList[turn]){
        Game.ChangeLocation(message,sender);
        universeTrip = false;
        Game.ChangeTurn();
      }else if(message == "/지갑"){
        Bot.reply(sender+"님의 지갑\n"+gamePlayerData[sender]["money"]+"원")
      }else if(message == "/주사위"){
        if(sender!=Game.WhoIsTurn()) return;
        Timer.diceStopTimer();
        let dice = Game.RandomDice(sender)
        if(!dice.shape) {
          Bot.reply(dice);
          Game.ChangeTurn();
          return;
        }
        Bot.reply(dice.shape);
        Game.MoveAvatar(sender,dice.number)
        Game.SetBoard()

        Kakao.sendLink(roomName, {
           template_id: 69609, 
           template_args: {
             board: "http://pocript.com/kakaomarble/board.php"+Game.MakeBoard()
           } 
           }, 'custom');
        
        let mySpot = Game.WhereIsAvatar(sender)
        
        if(mySpot.name == "황금열쇠"){
          let randomtype = Math.floor(Math.random()*18); 
          goldKey(randomtype,sender)
          Bot.reply("황금열쇠를 뽑았습니다.\n\n"+goldkey[randomtype].name+"\n"+goldkey[randomtype].desc);
          Game.ChangeTurn()
        }else if(mySpot.name == "출발"){
          Game.ChangeTurn()
        }else if(mySpot.name == "무인도"){
          Bot.reply("무인도에 도착했습니다. 3번 쉽니다.\n더블 주사위가 나오면 탈출 할 수 있습니다.");
          Game.ChangeTurn()
        }else if(mySpot.name == "사회복지기금"){
          Bot.reply("그동안 모인 사회복지기금 "+welfare+"원을 모두 가져갑니다.");
          Game.AddMoney(sender,welfare)
          Game.ChangeTurn()
        }else if(mySpot.name == "복지기금 접수처"){
          Game.ForceGetMoney(sender,15*10000);
          welfare = welfare + 150000
          Bot.reply("사회복지기금 15만원을 지불합니다.");
          Game.ChangeTurn()
        }else if(mySpot.name == "우주여행"){
          Bot.reply("우주여행칸에 도착했습니다. 이동할 나라를 입력해주세요.");
          universeTrip = true;
        }else{
          let ment = mySpot.name+"에 도착했습니다."
          if(mySpot.owner){
            if(mySpot.owner.name  != sender){
            ment=ment+mySpot.owner.name+"의 땅에 걸려 통행료 "+ mySpot.owner.toll+"만원을 냅니다"
            Bot.reply(ment);
            Game.ForceGetMoney(sender,mySpot.owner.toll*10000)
            Game.AddMoney(mySpot.owner.name,mySpot.owner.toll*10000)
            Game.ChangeTurn()
            }else{
              Bot.reply("본인 땅에 걸렸습니다.");
              Game.ChangeTurn()
            }
          }else{
            ment = ment + "땅을 구입하시겠습니까?\n\n1.구입안함\n2.대지료: "+mySpot.price.ground+"만원, 통행료: "+mySpot.toll.ground+"만원"
          if(mySpot.price.hotel) ment = ment + "\n3.호텔: "+mySpot.price.hotel+"만원, 통행료: "+mySpot.toll.hotel+"만원\n4.빌딩: "+mySpot.price.building+"만원, 통행료: "+mySpot.toll.building+"만원\n5.별장: "+mySpot.price.villa+"만원, 통행료: "+mySpot.toll.villa+"만원"
          Bot.reply(ment);
          isBuying = true;
          Timer.startTimer()
          }
          
        }
        
        
        
      }
      
  },
  PlayerAdd : function(sender){
    gamePlayerList.push(sender);
    gamePlayerData[sender] = {};
    gamePlayerData[sender]["location"] = 0;
    gamePlayerData[sender]["money"] = base_money;
    gamePlayerData[sender]["card"] = [];
    gamePlayerData[sender]["uninhabited"] = 0;
  },
  CheckPlayerNick : function(sender){
    if (gamePlayerList.indexOf(sender)!=-1) return true;
    else return false;
  },
  ChangeTurn: function(){
    if (turn + 1 >= gamePlayerList.length) turn=0
          else turn++
          Bot.reply("다음차례는 "+gamePlayerList[turn] +"입니다.");
          Timer.diceStartTimer();
  },
  WhoIsTurn: function(){
    return gamePlayerList[turn];
  },
  RandomDice: function(name){
    var a = [{shape:"⚀",number:1},
             {shape:"⚁",number:2},
             {shape:"⚂",number:3},
             {shape:"⚃",number:4},
             {shape:"⚄",number:5},
             {shape:"⚅",number:6}];
​    let random1 = Math.floor(Math.random()*6);  
    let random2 = Math.floor(Math.random()*6);  
    
    if(gamePlayerData[name]["location"]==8&&gamePlayerData[name]["uninhabited"] != 3){
      gamePlayerData[name]["uninhabited"] ++;      
        if(random1 != random2){
          Bot.reply("무인도 탈출에 실패했습니다.");
          return a[random1].shape+a[random2].shape;
        }else{
          gamePlayerData[name]["uninhabited"] = 0;
        }
      }
    
    return {shape:a[random1].shape+a[random2].shape,number:a[random1].number+a[random2].number};
  },
  MoveAvatar: function(sender,dice){
    if(gamePlayerData[sender]["location"] + dice > 31) {
      gamePlayerData[sender]["location"] = dice - ( 31 - gamePlayerData[sender]["location"]) - 1;
      Bot.reply("한바퀴를 돌아 월급을 받습니다.");
      Game.AddMoney(sender,200000)
      }
    else gamePlayerData[sender]["location"] = gamePlayerData[sender]["location"] + dice;
  },
  SetBoard : function(){
    boardLocation = [];
    for (var key in gamePlayerData) {
      let location = gamePlayerData[key]["location"];
      boardLocation.push(location);
    }    
  },
  MakeBoard : function(){
    var link = "";
    for (var i = 0; i<boardLocation.length; i++) {
      let index = boardLocation[i]
      link = link+"/avatar"+Number(i+1)+".png/"+location[index].x+","+location[index].y
    }    
    return link;
  },
  WhereIsAvatar : function(name){
    let index =  gamePlayerData[name]["location"]
    return location[index]
  },
  AddMoney : function(name,money){
    gamePlayerData[name]["money"] = gamePlayerData[name]["money"] + money;
  },
  GetMoney : function(name,money){
    if(gamePlayerData[name]["money"] - money < 0){
      Bot.reply("돈이 부족합니다.");
      return;
    }
    gamePlayerData[name]["money"] = gamePlayerData[name]["money"] - money;
  },
  ForceGetMoney : function(name,money){
    if(gamePlayerData[name]["money"] - money < 0){
      Bot.reply("돈이 부족해서 파산했습니다.\n게임 플레이어 목록에서 제외됩니다.");
      
      for(var i = 0; i < gamePlayerList.length; i++){
        if (gamePlayerList[i] == name) {
          gamePlayerList.splice(i, 1); 
          i--; 
          } 
        } 
        
    if(gamePlayerList.length < 2){
      Bot.reply("게임이 종료되었습니다. 우승자는 '"+ gamePlayerList[0] + "'님 입니다");
    }
      
      return;
    }
    gamePlayerData[name]["money"] = gamePlayerData[name]["money"] - money;
  },
  ChangeLocation : function(name,sender){
    let a = location.findIndex(e => e.name == name)
    Bot.reply(a)
    if(a == -1){
      Bot.reply("존재하지 않는 위치입니다.");
      return;
    }else if(name == "황금열쇠"){
      Bot.reply("황금열쇠로는 이동할 수 없습니다.");
    }else{
      Bot.reply(name+"(으)로 이동했습니다.");
      gamePlayerData[sender]["location"] = a;
    }
  },
  SetLocation : function(name,location){
    gamePlayerData[name]["location"] = location;
  },
  PowerOff : function(){
    gamePlayerList = [];
    gamePlayerData = {};
    gameStatus = "off";
    turn = 0;
    isBuying = false;
    aiPower = false;
    boardLocation = [];
    welfare = 0;
    universeTrip = false;
    Timer.diceStopTimer();
    Timer.stopTimer();
  }
}


function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  
  Bot.reply = (cmd) => { replier.reply(cmd); };
	 Bot.replyRoom = (cmd) => { (msg) ? Api.replyRoom(roomName, cmd) : null; };
 
	 Game.main(room, msg, sender);
  
}

var GAME_TIMER_OUT = 30;
var DICE_TIMER_OUT = 20;

let gameTimerCount = 0,
    gameTimerPower = false;
    
let diceTimerCount = 0,
    diceTimerPower = false;

const Timer = {
   startTimer: function(){
     gameTimerPower = true;
      new Thread
      ({
      run: function() {
      try {
while (gameTimerPower) {
Thread.sleep(1000);
if (gameTimerCount >= GAME_TIMER_OUT) {
Bot.reply("시간초과");
        gameTimerCount = 0;
		      gameTimerPower = false;
        isBuying = false;
        Game.ChangeTurn();
return;
}
else {
gameTimerCount++;
((GAME_TIMER_OUT-gameTimerCount ) == 20) ? Bot.reply("20초 남았습니다."):
((GAME_TIMER_OUT-gameTimerCount ) == 10) ? Bot.reply("10초 남았습니다.") : null;
}
}
}
catch (e) {
Bot.reply(e);
}
}
}).start();
},
  stopTimer: function(){
    gameTimerCount = 0;
		  gameTimerPower = false;
    isBuying = false;
  },
  diceStartTimer: function(){
    diceTimerPower = true;
      new Thread
      ({
      run: function() {
      try {
while (diceTimerPower) {
Thread.sleep(1000);
if (diceTimerCount >= DICE_TIMER_OUT) {
Bot.reply("시간초과");
        diceTimerCount = 0;
		      diceTimerPower = false;
        Game.ChangeTurn();
return;
}
else {
diceTimerCount++;
((DICE_TIMER_OUT-diceTimerCount ) == 10) ? Bot.reply("10초 남았습니다."): null;
}
}
}
catch (e) {
Bot.reply(e);
}
}
}).start();
  },
  diceStopTimer: function(){
    diceTimerCount = 0;
		  diceTimerPower = false;
  }
}

function onStartCompile()
{
	Timer.stopTimer();
	Timer.diceStopTimer();
};

