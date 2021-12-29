const { MessageEmbed, Message } = require("discord.js");
module.exports = {
	name: "play",
	category: "Music",
	aliases: ["p"],
	usage: "play <search> or <link>",
	description: "Play any music from youtube or spotify",
	cooldown: 2,
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
			//if user is not in a voice channel
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
			//if no arge send tell them to add a song
			if (!args[0]) {
			return message.channel.send({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`${pointer} **Youtube** \`${prefix}play\` <youtube link | youtube video name | youtube playlist>\n${pointer} **Spotify** \`${prefix}play\` <spotify song link> | spotify playlist **coming soon**`)
			.setTitle(`${emoji} ADD A MUSIC TO PLAY!`)
			],
			});
			}
            //if not allowed to CONNECT to the CHANNEL
			if (!message.guild.me.permissionsIn(message.member.voice.channel).has("CONNECT")) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`I am not allowed to \`join\` your channel\nYou can give me permission or use another channel`)
			.setTitle(`${emoji} NOT ABLE TO JOIN!`)
			],
			});
			} 
			//if not allowed to CONNECT to the CHANNEL
			if (!message.guild.me.permissionsIn(message.member.voice.channel).has("SPEAK")) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`I am not allowed to \`speak\` in your channel\nYou can give me permission or use another channel`)
			.setTitle(`${emoji} NOT ABLE TO SPEAK!`)
			],
			});
			}
			//if voice channel has a limiter and it's currently full
			if (message.member.voice.userLimit != 0 && message.member.voice.full) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`Your voice channel is full, I'm not able to join it!`)
			.setTitle(`${emoji} VOICE CHANNEL LIMIT!`)
			],
			});
			}
			const Text = args.join(" ") //same as in StringChoices //RETURNS STRING 
			//If all is well send send searching message
			message.react(react);
			let Msearch = await message.reply({ content: `${emoji} **Searching...** \`${Text}\`` }).catch(e => { console.log(e) })
			try {
			const { member, channelId, guildId  } = message;
			const { guild } = member;
			const { channel } = member.voice;
			let queue = client.distube.getQueue(guildId)
			let options = { member: member }
			if (!queue) options.textChannel = guild.channels.cache.get(channelId)
			await client.distube.playVoiceChannel(channel, Text, options)
			//Edit the reply
			Msearch.edit({content: `${queue?.songs?.length > 0 ? " " + emoji + " **Added:**" : " " + emoji + " **Now Playing:**"} \`${Text}\``}).catch(e => {console.log(e)})
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