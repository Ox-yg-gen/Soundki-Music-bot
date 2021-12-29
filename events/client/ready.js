const chalk = require("chalk");
module.exports = client => {
  //SETTING ALL GUILD DATA FOR THE DJ ONLY COMMANDS for the DEFAULT
  //client.guilds.cache.forEach(guild=>client.settings.set(guild.id, ["autoplay", "clearqueue", "forward", "loop", "jump", "loopqueue", "loopsong", "move", "pause", "resume", "removetrack", "removedupe", "restart", "rewind", "seek", "shuffle", "skip", "stop", "volume"], "djonlycmds"))
  try{
    try{
      const stringlength = 69;
      console.log("\n")
      console.log(chalk.bold(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`))
      console.log(chalk.bold(`     ┃ `.bold + " ".repeat(-1+stringlength-` ┃ `.length)+ "┃"))
      console.log(chalk.bold(`     ┃ `.bold + `${client.user.username} is now online!`.bold + " ".repeat(-1+stringlength-` ┃ `.length-`${client.user.username} is online!`.length)+ "┃"))
      console.log(chalk.bold(`     ┃ `.bold + ` /--/ ${client.user.tag} /--/ `.bold+ " ".repeat(-1+stringlength-` ┃ `.length-` /--/ ${client.user.tag} /--/ `.length)+ "┃"))
      console.log(chalk.bold(`     ┃ `.bold + " ".repeat(-1+stringlength-` ┃ `.length)+ "┃"))
      console.log(chalk.bold(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`))
    }catch{ /* */ }
    function change_status(client) {
      client.user.setActivity(`+help | 24/7 Online Music`,
        {     
          type: "PLAYING",
          status: "online"
        }
      );
    }
    //loop through the status per each 10 minutes
    setInterval(()=>{
      change_status(client);
    }, 15 * 1000);
  
  } catch (e){
    console.log(String(e.stack))
  }
}
