const { MessageEmbed, MessageButton } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "forward",
	category: "Song",
	usage: "forward <20>",
	aliases: ["fwd"],
	description: "Forward for by Seconds",
	cooldown: 2,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	run: async (client, message, args) => {
		try {
			const { member, guildId } = message;
			const { guild } = member;
			const { channel } = member.voice;
			let color = client.settings.get(message.guild.id, `color`);
			let emoji = client.settings.get(message.guild.id, `emoji`);
			let react = client.settings.get(message.guild.id, `react`);
			if (!channel){
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You have to be in a voice channel to use this command!`)
			.setTitle(`${emoji} NOT IN A VOICE CHANNEL!`)
			],
			});
			}
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
			if (!newQueue || !newQueue.songs || newQueue.songs.length == 0){
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`There's currently nothing playing right now`)
			.setTitle(`${emoji} NOTHING PLAYING!`)
			],
			});
			}
			if (!args[0]) {
			return message.reply({
			embeds: [
			new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ADD A DURATION!`)
			.setDescription(`**Usage:** \`${client.settings.get(guild.id, "prefix")}forward <30>\`\nAnd that would forward 30s of the song`)
			],
			});
			}
			let seekNumber = Number(args[0])
			let seektime = newQueue.currentTime + seekNumber;
			if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
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
			message.react(react);
			await newQueue.seek(seektime);
			message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} SONG FORWARD!`)
			.setDescription(`Forwarded the song for \`${seekNumber} Seconds\``)]
			})
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
			});
			}
		} catch (e) {
			console.log(String(e.stack))
		}
	}
}