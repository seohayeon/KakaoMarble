function KeyHandler(type,name){
    let slot = gamePlayerData[name]["card"]
    switch (type) { 
          case 0: 
            slot.push({"id":0,"name":"반액대매출"})
          break; 
          case 1: 
            slot.push({"id":1,"name":"무전기"})
          break; 
          case 2: 
            slot.push({"id":2,"name":"우대권"})
          break; 
          case 3: 
            let a = gamePlayerData[name]["location"]
            if(a < 2){
                gamePlayerData[name]["location"] = 32 - (2 - gamePlayerData[name]["location"])
            }else{
                gamePlayerData[name]["location"] = gamePlayerData[name]["location"] - 2
            }
          break; 
          case 4: 
             let b = gamePlayerData[name]["location"]
            if(b < 3){
                gamePlayerData[name]["location"] = 32 - (3 - gamePlayerData[name]["location"])
            }else{
                gamePlayerData[name]["location"] = gamePlayerData[name]["location"] - 3
            }
          break; 
          case 5: 
             Game.SetLocation(name,5)
          break; 
          case 6: 
             Game.SetLocation(name,31)
          break; 
          case 7: 
             Game.SetLocation(name,19)
          break; 
          case 8: 
             Game.SetLocation(name,8)
          break; 
          case 9: 
             Game.SetLocation(name,30)
             Game.GetMoney(name,15*10000);
             welfare = welfare + 150000
             Bot.reply("사회복지기금 15만원을 냈습니다.")
          break; 
          case 10: 
             Game.AddMoney(name,200000)
             Game.AddMoney(name,welfare)
             Bot.reply("월급 20만원과 사회복지기금 "+welfare+"원을 받았습니다.")
          break; 
          case 11: 
             Game.SetLocation(name,24)
             if(gamePlayerData[name]["location"] > 24){
                 Game.AddMoney(name,200000)
                 Bot.reply("월급 20만원을 받습니다.")
             }
          break; 
          case 12: 
             Game.SetLocation(name,0)
             Game.AddMoney(name,200000)
          break; 
          case 13: 
             Game.AddMoney(name,300000);
          break; 
          case 14: 
             Game.AddMoney(name,50000);
          break; 
          case 15: 
             Game.AddMoney(name,100000);
          break; 
          case 16: 
             Game.ForceGetMoney(name,100000);
          break; 
          case 17: 
             Game.ForceGetMoney(name,50000);
          break; 
          case 18: 
             Game.ForceGetMoney(name,50000);
          break; 
          case 19: 
             Game.AddMoney(name,10000*gamePlayerList.length);
             for (var key in gamePlayerData) {
                gamePlayerData[key]["money"] =  gamePlayerData[key]["money"] - 10000;
            }    
          break; 
          default: return; 
}
}

module.exports = KeyHandler