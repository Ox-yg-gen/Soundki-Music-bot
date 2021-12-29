const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "loop",
	category: "Queue",
	aliases: ["repeat", "repeatmode", "l"],
	usage: "loop <song/queue/off>",
	description: "Enable/Disable the Song- / Queue-Loop",
	cooldown: 5,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	run: async (client, message, args) => {
		try {
			let prefix = client.settings.get(message.guild.id, "prefix");
			let color = client.settings.get(message.guild.id, `color`);
			let emoji = client.settings.get(message.guild.id, `emoji`);
			let react = client.settings.get(message.guild.id, `react`);
			let pointer = client.settings.get(message.guild.id, `pointer`);
			const { member, guildId, guild } = message;
			const { channel } = member.voice;
			if (!channel) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You have to be in a voice channel to use this command!`)
			.setTitle(`${emoji} NOT IN A VOICE CHANNEL!`)
			],
			});
			}
			//if user is not in the same voice channel as the bot
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You must be in the same voice channel as me - <#${guild.me.voice.channel.id}>`)
			.setTitle(`${emoji} NOT IN SAME VOICE!`)
			],
			});
			}
			try {
			let newQueue = client.distube.getQueue(guildId);
			if(!newQueue)
			if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`There's currently nothing playing right now`)
			.setTitle(`${emoji} NOTHING PLAYING!`)
			],
			});
			}
			if (check_if_dj(client, member, newQueue.songs[0])) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} NOT THE SONG AUTHOR!`)
			.setDescription(`
			Hmm... You don't seem to be a DJ or the song author
			You need this **dj roles:** ${check_if_dj(client, member, newQueue.songs[0])}
			`)
			],
			});
			}
			if (!args[0]) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ADD A LOOP STYLE OPTION!`)
			.setDescription(`
			${pointer} **Options Off** \`off\` loop is off
			${pointer} **Options Song** \`song\` loop the song.
			${pointer} **Options Queue** \`queue\` loop the queue
			`)
			],
			});
			}
			let loop = String(args[0])
			if (!["off", "song", "queue"].includes(loop.toLowerCase())) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ADD A LOOP STYLE OPTION!`)
			.setDescription(`
			${pointer} **Options Off** \`off\` loop is off
			${pointer} **Options Song** \`song\` loop the song.
			${pointer} **Options Queue** \`queue\` loop the queue
			`)
			],
			});
			}
			if (loop.toLowerCase() == "off") loop = 0;
			else if (loop.toLowerCase() == "song") loop = 1;
			else if (loop.toLowerCase() == "queue") loop = 2;
			message.react(react);
			await newQueue.setRepeatMode(loop);
			if (newQueue.repeatMode == 0) {
			message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} DISABLED THE LOOP MODE!`)
			.setDescription(`Successfully Disabled the Loop Mode!`)
			]
			});
			} else if (newQueue.repeatMode == 1) {
			message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ENABLED THE SONG LOOP MODE!`)
			.setDescription(`Successfully Enabled the \`song\` Loop Mode!`)
			]
			});
			} else {
			message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ENABLED THE QUEUE LOOP MODE!`)
			.setDescription(`Successfully Enabled the \`queue\` Loop Mode!\nThe \`song\` loop mode has been disabled`)
			]
			});
			}
			} catch (e) {
			console.log(e.stack ? e.stack : e)
			message.reply({
			embeds: [
			new MessageEmbed()
			.setColor("#e63064")
			.setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
			.setDescription(`\`\`\`${e.stack.toString().substr(0, 800)}\`\`\``)
			.setFooter("Error in code: Report this error to kotlin0427 or _destroyer_#1574")
			],
			})
			}
		} catch (e) {
			console.log(String(e.stack))
		}
	}
}
