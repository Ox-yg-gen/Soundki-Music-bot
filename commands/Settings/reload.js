const { MessageEmbed, MessageButton } = require("discord.js");
const glob = require("glob");
const config = require("../../config");
module.exports = {
name: "reload",
category: "Settings",
aliases: ["setprefix"],
usage: "reload",
cooldown: 1,
description: "Reload all the commands for new changes.\nNote: Only my developer can use this command.",
memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
alloweduserids: ["696724053477556254", "709414462779687004"], //Only allow specific Users to execute a Command [OPTIONAL]
 run: async (client, message, args) => {
  try {
    let color = client.settings.get(message.guild.id, `color`);
    let emoji = client.settings.get(message.guild.id, `emoji`);
    let react = client.settings.get(message.guild.id, `react`);
    if (message.member.id !== config.Kotlin && config.Destroyer) {
        message.reply({
		embeds: [
		new MessageEmbed()
        .setColor(color)
        .setTitle(`${emoji} NO PERMISSION!`)
		.setDescription(`Oops sorry. (Only my owner can run this)`)
		],
		});
    } else {
        client.commands.sweep(() => true)
        glob(`${__dirname}/../**/*.js`, async(error, filePaths) =>{
            if(error) return console.log(err);
            filePaths.forEach((file) => {
                delete require.cache[require.resolve(file)];
                const pull = require(file);
                if(pull.name){
                    console.log(`Reloaded ${pull.name} (Command)`);
                    client.commands.set(pull.name, pull);
                }
                if(pull.aliases && Array.isArray(pull.aliases)){
                    pull.aliases.forEach((alias) => {
                        client.aliases.set(alias, pull.name)
                    });
                }
            })

        });
        message.react(react);
        message.reply({
		embeds: [
		new MessageEmbed()
        .setColor(color)
        .setTitle(`${emoji} CMD RELOADED!`)
		.setDescription(`Commands Reloaded Successfully`)
		],
		});
    }
  } catch (err) {
    console.log(err)
    message.reply({
    embeds: [
    new MessageEmbed()
    .setColor("#e63064")
    .setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
    .setDescription(`\`\`\`${err.stack.toString().substr(0, 800)}\`\`\``)
    .setFooter("Error in code: Report this error to kotlin0427 or _destroyer_#1574")
    ],
    });
  }
 },
};
