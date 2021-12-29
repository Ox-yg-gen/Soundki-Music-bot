const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "mix",
	description: "Plays a defined mix songs",
	cooldown: 2,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	options: [{
		"StringChoices": {
			name: "mix",
			description: "What Mix do you want?",
			required: true,
			choices: [
				["Blues"],
				["Charts"],
				["Chill"],
				["Default"],
				["Heavymetal"],
				["Gaming"],
				["Jazz"],
				["Metal"],
				["Magic"],
				["NCS"],
				["No_copyright"],
				["Ooldgaming"],
				["Pop"],
				["Remixes"],
				["Rock"],
				["Strange_fruits"],
			]
		}
	}, ],
	run: async (client, interaction) => {
		try {
			const { member, channelId, guildId } = interaction;
			const { guild } = member;
			const { channel } = member.voice;
			let color = client.settings.get(guild.id, `color`);
			let emoji = client.settings.get(guild.id, `emoji`);
			if (!channel) {
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You have to be in a voice channel to use this command!`)
			.setTitle(`${emoji} NOT IN A VOICE CHANNEL!`)
			],
			ephemeral: true
			});
			}
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You must be in the same voice channel as me - <#${guild.me.voice.channel.id}>`)
			.setTitle(`${emoji} NOT IN SAME VOICE!`)
			],
			ephemeral: true
			});
			}
			if (channel.userLimit != 0 && channel.full)
			return interaction.reply({
			embeds: [new MessageEmbed()
		    .setColor(color)
			.setTitle(`${emoji} VOICE CHANNEL LIMIT!`)
			.setDescription(`Your Voice Channel is full and I'm unable to join!`)
			],
			ephemeral: true
			});
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
			return interaction.reply({
		    embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ALREADY IN A VOICE CHANNEL!`)
			.setDescription(`Oops it seems I'm already connected to another channel`)
			],
			ephemeral: true
			});
			}
			let link = "https://open.spotify.com/playlist/37i9dQZF1DXc6IFF23C9jj";
			let args = [interaction.options.getString("mix")]
			if (args[0]) {
			//ncs | no copyrighted music
			if (args[0].toLowerCase().startsWith("n")) link = "https://open.spotify.com/playlist/7sZbq8QGyMnhKPcLJvCUFD";
			//pop
			if (args[0].toLowerCase().startsWith("p")) link = "https://open.spotify.com/playlist/37i9dQZF1DXc6IFF23C9jj";
			//default
			if (args[0].toLowerCase().startsWith("d")) link = "https://open.spotify.com/playlist/37i9dQZF1DXc6IFF23C9jj";
			//remixes from Magic Release
			if (args[0].toLowerCase().startsWith("re")) link = "https://www.youtube.com/watch?v=NX7BqdQ1KeU&list=PLYUn4YaogdahwfEkuu5V14gYtTqODx7R2"
			//rock
			if (args[0].toLowerCase().startsWith("ro")) link = "https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U";
			//oldgaming
			if (args[0].toLowerCase().startsWith("o")) link = "https://www.youtube.com/watch?v=iFOAJ12lDDU&list=PLYUn4YaogdahPQPTnBGCrytV97h8ABEav"
			//gaming
			if (args[0].toLowerCase().startsWith("g")) link = "https://open.spotify.com/playlist/4a54P2VHy30WTi7gix0KW6";
			//Charts
			if (args[0].toLowerCase().startsWith("cha")) link = "https://www.youtube.com/playlist?list=PLMC9KNkIncKvYin_USF1qoJQnIyMAfRxl"
			//Chill
			if (args[0].toLowerCase().startsWith("chi")) link = "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6";
			//Jazz
			if (args[0].toLowerCase().startsWith("j")) link = "https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt";
			//blues
			if (args[0].toLowerCase().startsWith("b")) link = "https://open.spotify.com/playlist/37i9dQZF1DXd9rSDyQguIk";
			//strange-fruits
			if (args[0].toLowerCase().startsWith("s")) link = "https://open.spotify.com/playlist/6xGLprv9fmlMgeAMpW0x51";
			//magic-release
			if (args[0].toLowerCase().startsWith("ma")) link = "https://www.youtube.com/watch?v=WvMc5_RbQNc&list=PLYUn4Yaogdagvwe69dczceHTNm0K_ZG3P"
			//metal
			if (args[0].toLowerCase().startsWith("me")) link = "https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe";
			//heavy metal
			if (args[0].toLowerCase().startsWith("h")) link = "https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe";
			} //update it without a response!
			await interaction.reply({ content: `${emoji} **Loading... \`${args[0] ? args[0] : "Default"}\` Music Mix**`, ephemeral: true });
			try {
			let queue = client.distube.getQueue(guildId)
			let options = { member: member }
			if (!queue) options.textChannel = guild.channels.cache.get(channelId)
			await client.distube.playVoiceChannel(channel, link, options)
			//Edit the reply
			interaction.editReply({ content: `${queue?.songs?.length > 0 ? " " + emoji + " **Loaded**" : " " + emoji + " **Now Playing**"}: the \`${args[0] ? args[0] : "Default"}\` Mix`, ephemeral: true });
			} catch (e) {
			console.log(e.stack ? e.stack : e)
			interaction.editReply({
			embeds: [
			new MessageEmbed()
			.setColor("#e63064")
			.setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
			.setDescription(`\`\`\`${e.stack.toString().substr(0, 800)}\`\`\``)
			.setFooter("Error in code: Report this error to kotlin0427")
			],
			ephemeral: true
			});
			}
		} catch (e) {
			console.log(String(e.stack))
		}
	}
}