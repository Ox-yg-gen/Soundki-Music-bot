const PlayerMap = new Map();
const playerintervals = new Map();
const { KSoftClient } = require('@ksoft/api');
const chalk = require("chalk");
const config = require(`../botconfig/config.json`);
const ksoft = new KSoftClient(config.ksoftapi);
const settings = require(`../botconfig/settings.json`);
const { MessageButton, MessageActionRow, MessageEmbed, Permissions, MessageSelectMenu } = require(`discord.js`);
const { check_if_dj, delay, createBar } = require("./functions");
let songEditInterval = null;
module.exports = (client) => {
  try {
      /** * AUTO-RESUME-FUNCTION */
      const autoconnect = async () => {
        let guilds = client.autoresume.keyArray();
        console.log(chalk.bold(chalk.blue.bold(`[Autoresume]`)) + chalk.cyan.bold(`for All Guilds, to autoresume:`, guilds));
        if (!guilds || guilds.length == 0) return;
        for (const gId of guilds) {
          try {
            let guild = client.guilds.cache.get(gId);
            if (!guild) {
              client.autoresume.delete(gId);
              console.log(chalk.bold(chalk.blue.bold(`[Autoresume]`)) + chalk.cyan.bold(`The bot was kicked out of the Guild`));
              continue;
            }
            let data = client.autoresume.get(gId);
            let voiceChannel = guild.channels.cache.get(data.voiceChannel);
            if (!voiceChannel && data.voiceChannel) voiceChannel = await guild.channels.fetch(data.voiceChannel).catch(() => {}) || false;
            if (!voiceChannel || !voiceChannel.members || voiceChannel.members.filter(m => !m.user.bot && !m.voice.deaf && !m.voice.selfDeaf).size < 1) {
              client.autoresume.delete(gId);
              console.log(chalk.bold(chalk.blue.bold(`[Autoresume]`)) + chalk.cyan.bold(`Voice channel is either empty / no listeners / got deleted`));
              continue;
            }
            let textChannel = guild.channels.cache.get(data.textChannel);
            if (!textChannel) textChannel = await guild.channels.fetch(data.textChannel).catch(() => {}) || false;
            if (!textChannel) {
              client.autoresume.delete(gId);
              onsole.log(chalk.bold(chalk.blue.bold(`[Autoresume]`)) + chalk.cyan.bold(`Text channel was deleted`));
              continue;
            }
            let tracks = data.songs;
            if(!tracks || !tracks[0]){
              onsole.log(chalk.bold(chalk.blue.bold(`[Autoresume]`)) + chalk.cyan.bold(`Player was shutdown because there are no tracks to play`));
              continue;
            }
            const makeTrack = async track => {
              return new DisTube.Song(
                new DisTube.SearchResult({
                  duration: track.duration,
                  formattedDuration: track.formattedDuration,
                  id: track.id,
                  isLive: track.isLive,
                  name: track.name,
                  thumbnail: track.thumbnail,
                  type: "video",
                  uploader: track.uploader,
                  url: track.url,
                  views: track.views,
                }), guild.members.cache.get(track.memberId) || guild.me, track.source);
            };
            await client.distube.playVoiceChannel(voiceChannel, tracks[0].url, {
              member: guild.members.cache.get(tracks[0].memberId) || guild.me,
              textChannel: textChannel
            })
            let newQueue = client.distube.getQueue(guild.id);
            //tracks = tracks.map(track => makeTrack(track));
            //newQueue.songs = [newQueue.songs[0], ...tracks.slice(1)]
            for(const track of tracks.slice(1)){
              newQueue.songs.push(await makeTrack(track))
            }
            console.log(chalk.bold(chalk.blue.bold(`[Autoresume]`)) + chalk.cyan.bold(`Added ${newQueue.songs.length} Tracks on the QUEUE and started playing ${newQueue.songs[0].name} in ${guild.name}`));
            //ADJUST THE QUEUE SETTINGS
            await newQueue.setVolume(data.volume)
            if (data.repeatMode && data.repeatMode !== 0) {
              newQueue.setRepeatMode(data.repeatMode);
            }
            if (!data.playing) {
              newQueue.pause();
            }
            await newQueue.seek(data.currentTime);
            if(data.filters && data.filters.length > 0){
              await newQueue.setFilter(data.filters, true);
            }
            client.autoresume.delete(newQueue.id)
            console.log(chalk.bold(chalk.blue.bold(`[Autoresume]`)) + chalk.cyan.bold(`Changed autoresume track to queue adjustments + deleted the database entry`));
            if (!data.playing) {
              newQueue.pause();
            }
            await delay(settings["auto-resume-delay"] || 1000)
          } catch (e) {
            console.log(e)
          }
        }
      }
      client.on("ready", () => {
        setTimeout(() => autoconnect(), 2 * client.ws.ping)
      })
    client.distube
      .on(`playSong`, async (queue, track) => {
        try {
          if(!client.guilds.cache.get(queue.id).me.voice.deaf)
            client.guilds.cache.get(queue.id).me.voice.setDeaf(true).catch((e) => {})
        } catch (error) {
          console.log(error)
        }
        try {
          var newQueue = client.distube.getQueue(queue.id)
          updateMusicSystem(newQueue);
          var data = receiveQueueData(newQueue, track)
          if(queue.textChannel.id === client.settings.get(queue.id, `music.channel`)) return;
          //Send message with buttons
          let currentSongPlayMsg = await queue.textChannel.send(data).then(msg => {
            PlayerMap.set(`currentmsg`, msg.id);
            return msg;
          })
          //create a collector for the thing
          var collector = currentSongPlayMsg.createMessageComponentCollector({
            filter: (i) => i.isButton() && i.user && i.message.author.id == client.user.id,
            time: track.duration > 0 ? track.duration * 1000 : 600000
          }); //collector for 5 seconds
          //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
          let lastEdited = false;
          /**
           * @INFORMATION - EDIT THE SONG MESSAGE EVERY 10 SECONDS!
           */
          try{clearInterval(songEditInterval)}catch(e){}
          songEditInterval = setInterval(async () => {
            if (!lastEdited) {
              try{
                var newQueue = client.distube.getQueue(queue.id)
                var data = receiveQueueData(newQueue, newQueue.songs[0])
                await currentSongPlayMsg.edit(data).catch((e) => {})
              }catch (e){
                clearInterval(songEditInterval)
              }
            }
          }, 10000)

          collector.on('collect', async i => {
            let emoji = client.settings.get(i.guild.id, `emoji`);
            if(i.customId != `10` && check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])) {
              return i.reply({embeds: [new MessageEmbed()
                .setColor(client.settings.get(i.guild.id, `color`))
                .setTitle(`${emoji} NOT THE SONG AUTHOR!`)
                .setDescription(`
                Hmm... You don't seem to be a DJ or the song author
                You need this **dj roles:** ${check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])}
                `)
              ],
              ephemeral: true}).then(interaction => {
                if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
                  setTimeout(()=>{
                    try {
                      i.deleteReply().catch(console.log);
                    }catch(e){
                      console.log(e)
                    }
                  }, 3000)
                }
              })
            }
            lastEdited = true;
            setTimeout(() => {
              lastEdited = false
            }, 7000)
            //skip
            if (i.customId == `1`) {
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              const queue = client.distube.getQueue(i.guild.id);
              if (!queue || !newQueue.songs || newQueue.songs.length == 0) {
              return i.reply({ content: `${emoji} **There's currently nothing playing**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              }
              if (channel.id !== newQueue.voiceChannel.id)
             // if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id)
              return i.reply({ content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              if (newQueue.songs.length == 0) {
              return i.reply({ content: `${emoji} **Stopped playing and left the channel**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              clearInterval(songEditInterval);
              //edit the current song message
              await client.distube.stop(i.guild.id)
              return
              }
              //skip the track
              await client.distube.skip(i.guild.id)
              i.reply({
              content: `${emoji} **Skipped to the next song!**`,
              ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
            }
            //stop
            if (i.customId == `2`) {
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              if (channel.id !== newQueue.voiceChannel.id)
              return i.reply({ content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              //stop the track
              i.reply({
              embeds: [new MessageEmbed()
              .setColor(client.settings.get(member.guild.id, `color`))
              .setTitle("<:bluewaves:891379368037859409> MUSIC HAS STOPPED")
              .setDescription(`Stopped playing and left the channel`)
              ]
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              clearInterval(songEditInterval);
              //edit the current song message
              await client.distube.stop(i.guild.id)
            }
            //pause/resume
            if (i.customId == `3`) {
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              if (channel.id !== newQueue.voiceChannel.id)
              return i.reply({
              content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`,
              ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              if (newQueue.playing) {
                await client.distube.pause(i.guild.id);
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {

                })
                i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(client.settings.get(member.guild.id, `color`))
                  .setTitle(`${emoji} MUSIC PAUSED`)
                  .setDescription(`The music has been paused by DJ **${member.user.username}**`)
                ]
                })
                .then(interaction => {
                if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
                setTimeout(()=>{
                try {
                i.deleteReply().catch(console.log);
                }catch(e){
                console.log(e)
                }
                }, 3000)
                }
                })
              } else {
                //pause the player
                await client.distube.resume(i.guild.id);
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
                i.reply({
                  embeds: [new MessageEmbed()
                  .setColor(client.settings.get(member.guild.id, `color`))
                  .setTitle(`${emoji} MUSIC RESUMED`)
                  .setDescription(`The music was resumed by DJ **${member.user.username}**`)
                  ]
                })
                .then(interaction => {
                if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
                setTimeout(()=>{
                try {
                i.deleteReply().catch(console.log);
                }catch(e){
                console.log(e)
                }
                }, 3000)
                }
                })
              }
            }
            //autoplay
            if (i.customId == `4`) {
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              if (channel.id !== newQueue.voiceChannel.id)
              return i.reply({
              content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`,
              ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              //pause the player
              await newQueue.toggleAutoplay()
              if (newQueue.autoplay) {
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              } else {
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              }
              //Send Success Message
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(client.settings.get(member.guild.id, `color`))
                  .setDescription(`Autoplay is now **${newQueue.autoplay ? `Activated` :`Deactivated`}**`)
                  .setTitle(`${emoji} AUTOPLAY!`)
                ],
                ephemeral: true
                })
                .then(interaction => {
                if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
                setTimeout(()=>{
                try {
                i.deleteReply().catch(console.log);
                }catch(e){
                console.log(e)
                }
                }, 3000)
                }
                })
            }
            //Shuffle
            if(i.customId == `5`){
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              let color = client.settings.get(member.guild.id, `color`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
              return i.reply({
              content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`,
              ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
              //pause the player
              await newQueue.shuffle()
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(color)
                  .setTitle(`${emoji} SONG SHUFFLED!`)
                  .setDescription(`Successfully shuffled **\`${newQueue.songs.length}\`** songs!`)
                ],
                ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
            }
            //Songloop
            if(i.customId == `6`){
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
              return i.reply({
                content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`,
                ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              //Disable the Repeatmode
              if(newQueue.repeatMode == 1){
                await newQueue.setRepeatMode(0)
              } 
              //Enable it
              else {
                await newQueue.setRepeatMode(1)
              }
              i.reply({
                embeds: [new MessageEmbed()
                .setColor(client.settings.get(i.guild.id, `color`))
                .setTitle(`${emoji} SONG LOOP MODE!`)
                .setDescription(`${newQueue.repeatMode == 1 ? `Enabled song Loop Mode!` : `Disabled song Loop Mode!`}`)
                ],
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Queueloop
            if(i.customId == `7`){
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true });
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
              return i.reply({
                content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`,
                ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              //Disable the Repeatmode
              if(newQueue.repeatMode == 2){
                await newQueue.setRepeatMode(0)
              } 
              //Enable it
              else {
                await newQueue.setRepeatMode(2)
              }
              i.reply({
                embeds: [new MessageEmbed()
                .setColor(client.settings.get(i.guild.id, `color`))
                .setTitle(`${emoji} QUEUE LOOP MODE!`)
                .setDescription(`${newQueue.repeatMode == 2 ? `Enabled queue loop Mode!` : `Disabled queue loop Mode!`}`)
                ],
                })
                .then(interaction => {
                if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
                setTimeout(()=>{
                try {
                i.deleteReply().catch(console.log);
                }catch(e){
                console.log(e)
                }
                }, 3000)
                }
                })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Forward
            if(i.customId == `8`){
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
              return i.reply({
                content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`,
                ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              let seektime = newQueue.currentTime + 10;
              if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              i.reply({
                embeds: [new MessageEmbed()
                .setColor(client.settings.get(i.guild.id, `color`))
                .setTitle(`${emoji} SONG FORWARD!`)
                .setDescription(`Forwarded the song by \`10 seconds\``)
                ],
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Rewind
            if(i.customId == `9`){
              let { member } = i;
              const { channel } = member.voice
              let emoji = client.settings.get(member.guild.id, `emoji`);
              if (!channel)
              return i.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
              return i.reply({
                content: `${emoji} **You must be in the same voice channel as me <#${channel.id}>**`,
                ephemeral: true
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              let seektime = newQueue.currentTime - 10;
              if (seektime < 0) seektime = 0;
              if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              i.reply({
                embeds: [new MessageEmbed()
                .setColor(client.settings.get(i.guild.id, `color`))
                .setTitle(`${emoji} SONG FORWARD!`)
                .setDescription(`Rewinded the song by \`10 seconds\``)
                ],
              })
              .then(interaction => {
              if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
              setTimeout(()=>{
              try {
              i.deleteReply().catch(console.log);
              }catch(e){
              console.log(e)
              }
              }, 3000)
              }
              })
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Lyrics
            // if(i.customId == `10`){
            //   let emoji = client.settings.get(i.guild.id, `emoji`);
            //   return i.reply({
            //     content: `${emoji} **Lyrics are disabled!**\nDue to legal Reasons, Lyrics are disabled\nand won't work for an unknown amount of time!`,
            //     ephemeral: true
            //   })
            //   .then(interaction => {
            //   if(newQueue.textChannel.id === client.settings.get(newQueue.id, `music.channel`)){
            //   setTimeout(()=>{
            //   try {
            //   i.deleteReply().catch(console.log);
            //   }catch(e){
            //   console.log(e)
            //   }
            //   }, 3000)
            //   }
            //   })
            // }
          });
        } catch (error) {
          console.error(error)
        }
      })
      .on(`addSong`, (queue, song) => {
        updateMusicSystem(queue);
        queue.textChannel.send({
        embeds: [
          new MessageEmbed()
          .setColor(client.settings.get(queue.id, `color`))
          .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
          .setTitle(`${client.settings.get(queue.id, `emoji`)} SONG ADDED TO THE QUEUE`)
          .setDescription(`
          ${client.settings.get(queue.id, `pointer`)} **Song** - [\`${song.name}\`](${song.url})
          ${client.settings.get(queue.id, `pointer`)} **Duration** - \`${song.formattedDuration}\`
          ${client.settings.get(queue.id, `pointer`)} **Requested by** - ${song.user}
          ${client.settings.get(queue.id, `pointer`)} **Estimated Time** - \`${queue.songs.length - 1} song${queue.songs.length > 0 ? "s" : ""}\` - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(".", ":")}\`
          ${client.settings.get(queue.id, `pointer`)} **Queue duration** - \`${queue.formattedDuration}\`
          `)
          .setFooter(`Song For ${song.user.tag}`, song.user.displayAvatarURL({dynamic: true}))
        ]
      })
      .then(msg => {
          if(queue.textChannel.id === client.settings.get(queue.id, `music.channel`)){
            setTimeout(() =>{
              try{
                if(!msg.deleted){
                  msg.delete().catch(() => {});
                }
              }catch (e) {

              }
            }, 6000)
          }
        })
      })
      .on(`addList`, (queue, playlist) => {
        updateMusicSystem(queue);
        queue.textChannel.send({
        embeds: [
          new MessageEmbed()
          .setColor(client.settings.get(queue.id, `color`))
          .setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`)
          .setTitle(`${client.settings.get(queue.id, `emoji`)} PLAYLIST ADDED TO THE QUEUE`)
          .setDescription(`
          ${client.settings.get(queue.id, `pointer`)} **Playlist** - [\`${playlist.name}\`](${playlist.url ? playlist.url : ""}) - \`${playlist.songs.length} Song${playlist.songs.length > 0 ? "s" : ""}\`
          ${client.settings.get(queue.id, `pointer`)} **Duration** - \`${queue.formattedDuration}\`
          ${client.settings.get(queue.id, `pointer`)} **Requested by** - ${queue.songs[0].user ? queue.songs[0].user : "error"}
          ${client.settings.get(queue.id, `pointer`)} **Estimated Time** - \`${queue.songs.length - - playlist.songs.length} song${queue.songs.length > 0 ? "s" : ""}\` - \`${(Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(".", ":")}\`
          ${client.settings.get(queue.id, `pointer`)} **Queue duration** - \`${queue.formattedDuration}\`
          `)
          .setFooter(`Playlist For ${playlist.user.tag}`, playlist.user.displayAvatarURL({dynamic: true}))
        ]
      })
      .then(msg => {
        if(queue.textChannel.id === client.settings.get(queue.id, `music.channel`)){
          setTimeout(() =>{
            try{
              if(!msg.deleted){
                msg.delete().catch(() => {});
              }
            }catch (e) {

            }
          }, 3000)
        }
      })
    })
      // DisTubeOptions.searchSongs = true
      .on(`searchResult`, (message, result) => {
        let i = 0
        message.channel.send(`${client.settings.get(message.guild.id, `emoji`)} **Choose an option from below**\n${result.map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join(`\n`)}\nEnter anything else or wait 60 seconds to cancel`)
      })
      // DisTubeOptions.searchSongs = true
      .on(`searchCancel`, message => message.channel.send(`${client.settings.get(message.guild.id, `emoji`)} Searching canceled`).catch((e)=>console.log(e)))
      .on(`error`, (channel, e) => {
        channel.send(`${client.settings.get(channel.id, `emoji`)} **An error encountered:** \`${e}\``).catch((e)=>console.log(e))
        console.error(e)
      })
      .on(`empty`, channel => channel.send(`**Voice channel is empty! Leaving the channel...**`).catch((e)=>console.log(e)))
      .on(`searchNoResult`, message => message.channel.send(`${client.settings.get(message.guild.id, `emoji`)} **No result found!**`).catch((e)=>console.log(e)))
      .on(`finishSong`, (queue, song) => {
        let songtitle = song.name;
        let songName
        if (songtitle.length > 20) songName = songtitle.substr(0, 30) + "...";
        var embed = new MessageEmbed()
        .setColor(client.settings.get(queue.id, `color`))
        .setTitle(`${client.settings.get(queue.id, `emoji`)} ${songName}`)
        .setDescription(`
        **Finished Playing** - [${songName}](${song.url})
        Song Requested By  **${song.user.tag}**
        Liking ${client.user.username}? give us a vote at [top.gg](https://top.gg)
        `)
        .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
        queue.textChannel.messages.fetch(PlayerMap.get(`currentmsg`)).then(currentSongPlayMsg=>{
        currentSongPlayMsg.edit({ embeds: [embed] }).catch((e) => {
        console.log(e);
        })
        }).catch((e) => {
        console.log(e);
        })
      })
      .on(`deleteQueue`, queue => {
        if(!PlayerMap.has(`deleted-${queue.id}`)) {
          PlayerMap.set(`deleted-${queue.id}`, true);
          if(client.maps.has(`beforeshuffle-${queue.id}`)){
            client.maps.delete(`beforeshuffle-${newQueue.id}`);
          }
          try {
            //Delete the interval for the check relevant messages system so
            clearInterval(playerintervals.get(`checkrelevantinterval-${queue.id}`))
            playerintervals.delete(`checkrelevantinterval-${queue.id}`);
            // Delete the Interval for the autoresume saver
            clearInterval(playerintervals.get(`autoresumeinterval-${queue.id}`))
            if (client.autoresume.has(queue.id)) client.autoresume.delete(queue.id); //Delete the db if it's still in there
            playerintervals.delete(`autoresumeinterval-${queue.id}`);
            // Delete the interval for the Music Edit Embeds System
            clearInterval(playerintervals.get(`musicsystemeditinterval-${queue.id}`))
            playerintervals.delete(`musicsystemeditinterval-${queue.id}`);
          } catch(e){ console.log(e) }
          updateMusicSystem(queue, true);
          queue.textChannel.send({
            embeds: [
              new MessageEmbed()
              .setColor(client.settings.get(queue.id, `color`))
              .setTitle(`${client.settings.get(queue.id, `emoji`)} QUEUE GOT DELETED`)
              .setDescription("It would seem the queue got deleted")
            ]
          }).then(msg => {
            if(queue.textChannel.id === client.settings.get(queue.id, `music.channel`)){
              setTimeout(() =>{
                try{
                  if(!msg.deleted){
                    msg.delete().catch(() => {});
                  }
                }catch (e) {
  
                }
              })
            }
          }, 3000)
        }
      })
      // .on(`finish`, queue => {
      //   queue.textChannel.send({
      //     embeds: [
      //       new MessageEmbed()
      //       .setColor(client.settings.get(queue.id, `color`))
      //       .setTitle(`${client.settings.get(queue.id, `emoji`)} LEFT THE CHANNEL`)
      //       .setDescription("There are no more songs left to play")
      //     ]
      //   })
      // })
      .on(`initQueue`, queue => {
        try {
          if(PlayerMap.has(`deleted-${queue.id}`)) {
          PlayerMap.delete(`deleted-${queue.id}`)
          }
          let data = client.settings.get(queue.id)
          queue.autoplay = Boolean(data.defaultautoplay);
          queue.volume = Number(data.defaultvolume);
          queue.setFilter(data.defaultfilters);
          /**
          * Check-Relevant-Messages inside of the Music System Request Channel
          */
          var checkrelevantinterval = setInterval(async () => {
          if (client.settings.get(queue.id, `music.channel`) && client.settings.get(queue.id, `music.channel`).length > 5) {
          console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Music System - Relevant Checker... Checking for unrelevant Messages`));
          let messageId = client.settings.get(queue.id, `music.message`);
          //try to get the guild
          let guild = client.guilds.cache.get(queue.id);
          if (!guild) return console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Music System - Relevant Checker... Guild not found!`));
          //try to get the channel
          let channel = guild.channels.cache.get(client.settings.get(queue.id, `music.channel`));
          if (!channel) channel = await guild.channels.fetch(client.settings.get(queue.id, `music.channel`)).catch(() => {}) || false
          if (!channel) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Channel not found!`)
          if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.MANAGE_MESSAGES)) return console.log(`Music System - Relevant Checker`.brightCyan + ` - Missing Permissions`)
          //try to get the channel
          let messages = await channel.messages.fetch();
          if (messages.filter(m => m.id != messageId).size > 0) {
          channel.bulkDelete(messages.filter(m => m.id != messageId)).catch(() => {})
          .then(messages => console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Music System - Relevant Checker... Bulk deleted ${messages.size} messages`)))
          } else {
          console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Music System - Relevant Checker...No Relevant Messages`));
          }
          }
          }, settings["music-system-relevant-checker-delay"] || 60000);
          playerintervals.set(`checkrelevantinterval-${queue.id}`, checkrelevantinterval);
          /**
          * AUTO-RESUME-DATABASING
          */
          var autoresumeinterval = setInterval(async () => {
          var newQueue = client.distube.getQueue(queue.id);
          if (client.settings.get(newQueue.id, `autoresume`)) {
          const makeTrackData = track => {
          return {
          memberId: track.member.id, 
          source: track.source,
          duration: track.duration,
          formattedDuration: track.formattedDuration,
          id: track.id,
          isLive: track.isLive,
          name: track.name,
          thumbnail: track.thumbnail,
          type: "video",
          uploader: track.uploader,
          url: track.url,
          views: track.views,
          }
          }
          client.autoresume.ensure(newQueue.id, {
          guild: newQueue.id,
          voiceChannel: newQueue.voiceChannel ? newQueue.voiceChannel.id : null,
          textChannel: newQueue.textChannel ? newQueue.textChannel.id : null,
          songs: newQueue.songs && newQueue.songs.length > 0 ? [...newQueue.songs].map(track => makeTrackData(track)) : null,
          volume: newQueue.volume,
          repeatMode: newQueue.repeatMode,
          playing: newQueue.playing,
          currentTime: newQueue.currentTime,
          filters: [...newQueue.filters].filter(Boolean),
          autoplay: newQueue.autoplay,
          });
          let data = client.autoresume.get(newQueue.id);
          if (data.guild != newQueue.id) client.autoresume.set(newQueue.id, newQueue.id, `guild`)
          if (data.voiceChannel != newQueue.voiceChannel ? newQueue.voiceChannel.id : null) client.autoresume.set(newQueue.id, newQueue.voiceChannel ? newQueue.voiceChannel.id : null, `voiceChannel`)
          if (data.textChannel != newQueue.textChannel ? newQueue.textChannel.id : null) client.autoresume.set(newQueue.id, newQueue.textChannel ? newQueue.textChannel.id : null, `textChannel`)

          if (data.volume != newQueue.volume) client.autoresume.set(newQueue.id, pl.volume, `volume`)
          if (data.repeatMode != newQueue.repeatMode) client.autoresume.set(newQueue.id, newQueue.repeatMode, `repeatMode`)
          if (data.playing != newQueue.playing) client.autoresume.set(newQueue.id, newQueue.playing, `playing`)
          if (data.currentTime != newQueue.currentTime) client.autoresume.set(newQueue.id, newQueue.currentTime, `currentTime`)
          if (!arraysEqual([...data.filters].filter(Boolean), [...newQueue.filters].filter(Boolean))) client.autoresume.set(newQueue.id, [...newQueue.filters].filter(Boolean), `filters`)
          if (data.autoplay != newQueue.autoplay) client.autoresume.set(newQueue.id, newQueue.autoplay, `autoplay`)
          if (newQueue.songs && !arraysEqual(data.songs, [...newQueue.songs])) client.autoresume.set(newQueue.id, [...newQueue.songs].map(track => makeTrackData(track)), `songs`)

          function arraysEqual(a, b) {
          if (a === b) return true;
          if (a == null || b == null) return false;
          if (a.length !== b.length) return false;
          for (var i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
          }
          return true;
          }
          }
          }, settings["auto-resume-save-cooldown"] || 5000);
          playerintervals.set(`autoresumeinterval-${queue.id}`, autoresumeinterval);
          /**
          * Music System Edit Embeds
          */
          var musicsystemeditinterval = setInterval(async () => {
          if (client.settings.get(queue.id, `music.channel`) && client.settings.get(queue.id, `music.channel`).length > 5) {
          let messageId = client.settings.get(queue.id, `music.message`);
          //try to get the guild
          let guild = client.guilds.cache.get(queue.id);
          if (!guild) return console.log(`Music System Edit Embeds`.brightMagenta + ` - Music System - Guild not found!`)
          //try to get the channel
          let channel = guild.channels.cache.get(client.settings.get(queue.id, `music.channel`));
          if (!channel) channel = await guild.channels.fetch(client.settings.get(queue.id, `music.channel`)).catch(() => {}) || false
          if (!channel) return console.log(`Music System Edit Embeds`.brightMagenta + ` - Music System - Channel not found!`)
          if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) return console.log(`Music System - Missing Permissions`)
          //try to get the channel
          let message = channel.messages.cache.get(messageId);
          if (!message) message = await channel.messages.fetch(messageId).catch(() => {}) || false;
          if (!message) return console.log(`Music System Edit Embeds`.brightMagenta + ` - Music System - Message not found!`)
          if(!message.editedTimestamp) return console.log(`Music System Edit Embeds`.brightCyan + ` - Never Edited before!`)
          if(Date.now() - message.editedTimestamp > (settings["music-request-edit-delay"] || 7000) - 100)
          {
          var data = generateQueueEmbed(client, queue.id)
          message.edit(data).catch((e) => {
          console.log(e)
          }).then(m => {
          return;
          // console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Music System Edit Embeds - Edited the Music System Embed, because no other edit in the last ${Math.floor((settings["music-request-edit-delay"] || 7000) / 1000)} Seconds!`));
          })
          }
          }
          }, settings["music-request-edit-delay"] || 7000);
          playerintervals.set(`musicsystemeditinterval-${queue.id}`, musicsystemeditinterval);
        } catch (error) {
          console.error(error)
        }
      });
  } catch (e) {
    console.log(String(e.stack))
  }

  //for the music system requesting songs
  client.on(`messageCreate`, async (message) => {
    if(!message.guild) return;
    client.settings.ensure(message.guild.id, {
      prefix: config.prefix,
      music: {
        channel: "",
        message: "",
      }
    })
    let data = client.settings.get(message.guild.id, `music`);
    if(!data.channel || data.channel.length < 5) return;
    let textChannel = message.guild.channels.cache.get(data.channel) || await message.guild.channels.fetch(data.channel).catch(() => {}) || false;
    if(!textChannel) {
      client.settings.set(message.guild.id, "", "music.channel");
      client.settings.set(message.guild.id, "", "music.message");
      return;
    }
    if(message.channel.id != textChannel.id) return;
    if (message.author.id === client.user.id) {
    setTimeout(()=>{
        if (!message.deleted) {
          message.delete().catch((e) => {
            console.log(e)
          })
        }
      }, 3000)
    } else {
      if (!message.deleted) {
        message.delete().catch((e) => {
          console.log(e)
        })
      }
    }
    if(message.author.bot) return;
    var prefix = client.settings.get(message.guild.id, `prefix`);
    let emoji = client.settings.get(message.guild.id, `emoji`);
    let color = client.settings.get(message.guild.id, `color`);
    let pointer = client.settings.get(message.guild.id, `pointer`);
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    var args, cmd;
    if(prefixRegex.test(message.content)) {
    const [, matchedPrefix] = message.content.match(prefixRegex);
    args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    cmd = args.shift().toLowerCase();
    if (cmd || cmd.length === 0) return 
    var command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (command)
    {
    return 
    }
    }
    args = message.content.split(` `);
    const { channel } = message.member.voice;
    if (!channel) return message.reply({
    content: `${emoji} **You have to be in a voice channel first**`,
    })
    if (channel.userLimit != 0 && channel.full)
    return message.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} CHANNEL LIMIT REACHED`)
    .setTitle(`Your voice channel is full so I'm unable to join it`)
    ],
    });
    if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
    return message.reply({
    content: `**${emoji} Already playing music in another channel**`,
    });
    }
    const Text = args.join(` `)
    try {
    let queue = client.distube.getQueue(message.guild.id)
    let options = {
    member: message.member,
    }
    if (!queue) options.textChannel = message.guild.channels.cache.get(message.channel.id)
    await client.distube.playVoiceChannel(channel, Text, options)
    } catch (e) {
      console.log(e.stack ? e.stack : e)
      console.log(e)
      message.reply({
      embeds: [
      new MessageEmbed()
      .setColor("#e63064")
      .setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
      .setDescription(`\`\`\`${String(e.message ? e.message : e).substr(0, 2000)}\`\`\``)
      .setFooter("Error in code: Report this error to kotlin0427 or _destroyer_#1574")
      ],
      });
    } 
  })
  /////////
  //for the music system interaction buttonjs and meu
  client.on(`interactionCreate`, async (interaction) => {
    if (!interaction.isButton() && !interaction.isSelectMenu()) return;
    var { guild, message, channel, member, user } = interaction;
    if (!guild) guild = client.guilds.cache.get(interaction.guildId);
    if (!guild) return;
    var prefix = client.settings.get(guild.id);
    let emoji = client.settings.get(guild.id, `emoji`);
    let color = client.settings.get(guild.id, `color`);
    let pointer = client.settings.get(guild.id, `pointer`);
    var data = client.settings.get(guild.id, `music`);
    var musicChannelId = data.channel;
    var musicChannelMessage = data.message;
    //if not setupped yet, return
    if (!musicChannelId || musicChannelId.length < 5) return;
    if (!musicChannelMessage || musicChannelMessage.length < 5) return;
    //if the channel doesnt exist, try to get it and the return if still doesnt exist
    if (!channel) channel = guild.channels.cache.get(interaction.channelId);
    if (!channel) return;
    //if not the right channel return
    if (musicChannelId != channel.id) return;
    //if not the right message, return
    if (musicChannelMessage != message.id) return;
    if (!member) member = guild.members.cache.get(user.id);
    if (!member) member = await guild.members.fetch(user.id).catch(() => {});
    if (!member) return;
    //if the member is not connected to a vc, return
    if (!member.voice.channel) return interaction.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
    //now its time to start the music system
    if (!member.voice.channel)
    return interaction.reply({ content: `${emoji} **You have to be in a voice channel first**`, ephemeral: true })
    if (!member.voice.channel) return message.reply({
    content: `${emoji} **You must be in the same voice channel as me**`, ephemeral: true
		})
		if (member.voice.channel.userLimit != 0 && member.voice.channel.full)
		return interaction.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} CHANNEL LIMIT REACHED`)
    .setTitle(`Your voice channel is full so I'm unable to join it`)
    ],
    ephemeral: true
		});
		if (guild.me.voice.channel && guild.me.voice.channel.id != member.voice.channel.id) {
		return interaction.reply({
    content: `**${emoji} Already playing music in another channel**`,
    ephemeral: true
		});
		}
    let newQueue = client.distube.getQueue(guild.id);
    if (interaction.isButton()) {
    if (!newQueue || !newQueue.songs || !newQueue.songs[0]) {
    return interaction.reply({
    content: `${emoji} **There's currently nothing playing!**`,
    ephemeral: true
    })
    }
    //here i use my check_if_dj function to check if he is a dj if not then it returns true, and it shall stop!
    if (newQueue && interaction.customId != `Lyrics` && check_if_dj(client, member, newQueue.songs[0])) {
    return interaction.reply({
		embeds: [new MessageEmbed()
		.setColor(color)
		.setTitle(`${emoji} NOT THE SONG AUTHOR!`)
		.setDescription(`
		Hmm... You don't seem to be a DJ or the song author
		You need this **dj roles:** ${check_if_dj(client, member, newQueue.songs[0])}
		`)
		],
    ephemeral: true
    });
    }
    switch (interaction.customId) {
    case `Skip`: {
    if (newQueue.songs.length == 0) {
    interaction.reply({
    content: `${emoji} **Music stopped playing so I'v left the voice channel**`
    }).then(msg => {
      if(queue.textChannel.id === client.settings.get(queue.id, `music.channel`)){
        setTimeout(() =>{
          try{
            if(!msg.deleted){
              msg.delete().catch(() => {});
            }
          }catch (e) {

          }
        }, 3000)
      }
    })
    await newQueue.stop()
    return
    }
    //skip the track
    await newQueue.skip();
    interaction.reply({
    content: `${emoji} **Skipped to the next song!**`,
    })      
    }
    break;
    case `Stop`: {
    //Stop the player
    interaction.reply({
    content: `${emoji} **Music stopped playing so I'v left the voice channel**`
    })
    if (newQueue) {
    await newQueue.stop();
    }    
    }
    break;
    case `Pause`: {
    if (newQueue.paused) {
    newQueue.resume();
    interaction.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} MUSIC RESUMED`)
    .setDescription(`The music has been resumed`)
    ]
    })
    } else {
    //pause the player
    await newQueue.pause();
    interaction.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} MUSIC PAUSED`)
    .setDescription(`The music has been paused`)
    ]
    })
    } 
    }
    break;
    case `Autoplay`: {
    //pause the player
    newQueue.toggleAutoplay();
    interaction.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} ${client.user.username.toUpperCase()} AUTOPLAY!`)
    .setDescription(`Autoplay is now ${newQueue.autoplay ? `**Enabled**`: `**Disabled**`}`)
    ]
    })    
    }
    break;
    case `Shuffle`: {
    //set into the player instance an old Queue, before the shuffle...
    client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
    //shuffle the Queue
    await newQueue.shuffle();
    //Send Success Message
    interaction.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} SONG SHUFFLED!`)
    .setDescription(`Successfully shuffled **\`${newQueue.songs.length}\`** songs!`)
    ]
    })
    }
    break;
    case `Song`: {
    //if there is active queue loop, disable it + add embed information
    if (newQueue.repeatMode == 1) {
    await newQueue.setRepeatMode(0);
    } else {
    await newQueue.setRepeatMode(1);
    }
    interaction.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} SONG SHUFFLED!`)
    .setDescription(`Successfully ${newQueue.repeatMode == 1 ? `Enabled song loop`: `Disabled song loop`}`)
    ]
    })  
    }
    break;
    case `Queue`: {
    //if there is active queue loop, disable it + add embed information
    if (newQueue.repeatMode == 2) {
    await newQueue.setRepeatMode(0);
    } else {
    await newQueue.setRepeatMode(2);
    }
    interaction.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} ENABLED THE SONG LOOP MODE!`)
    .setDescription(`Successfully ${newQueue.repeatMode == 2 ? `Enabled the **\`queue\`**`: `Disabled the **\`queue\`**`} Loop Mode!`)
    ]
    })     
    }
    break;
    case `Forward`: {
    //get the seektime variable of the user input
		let seektime = newQueue.currentTime + 10;
		if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
    //seek to the new Seek position
    await newQueue.seek(seektime);
    interaction.reply({
    embeds: [new MessageEmbed()
		.setColor(color)
		.setTitle(`${emoji} SONG FORWARD!`)
		.setDescription(`Forwarded the song for **\`10 Seconds\`**`)]
    })   
    }
    break;
    case `Rewind`: {
		let seektime = newQueue.currentTime - 10;
		if (seektime < 0) seektime = 0;
		if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
    //seek to the new Seek position
    await newQueue.seek(seektime);
    interaction.reply({
    embeds: [new MessageEmbed()
		.setColor(color)
		.setTitle(`${emoji} SONG REWIND!`)
		.setDescription(`Rewinded the song by **\`10 seconds\`**`)
    ]
    })
    }
    break;
    case `Lyrics`: {
    //// ADD LYRICS LATER
    }
    break;
    }
    updateMusicSystem(newQueue);
    }
    if (interaction.isSelectMenu()) {
    let link = `https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj`;
    if (interaction.values[0]) {
    //ncs | no copyrighted music
    if (interaction.values[0].toLowerCase().startsWith(`n`)) link = `https://open.spotify.com/playlist/7sZbq8QGyMnhKPcLJvCUFD`;
    //pop
    if (interaction.values[0].toLowerCase().startsWith(`p`)) link = `https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj`;
    //default
    if (interaction.values[0].toLowerCase().startsWith(`d`)) link = `https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj`;
    //remixes from Magic Release
    if (interaction.values[0].toLowerCase().startsWith(`re`)) link = `https://www.youtube.com/watch?v=NX7BqdQ1KeU&list=PLYUn4YaogdahwfEkuu5V14gYtTqODx7R2`
    //rock
    if (interaction.values[0].toLowerCase().startsWith(`ro`)) link = `https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U`;
    //oldgaming
    if (interaction.values[0].toLowerCase().startsWith(`o`)) link = `https://www.youtube.com/watch?v=iFOAJ12lDDU&list=PLYUn4YaogdahPQPTnBGCrytV97h8ABEav`
    //gaming
    if (interaction.values[0].toLowerCase().startsWith(`g`)) link = `https://open.spotify.com/playlist/4a54P2VHy30WTi7gix0KW6`;
    //Charts
    if (interaction.values[0].toLowerCase().startsWith(`cha`)) link = `https://www.youtube.com/playlist?list=PLMC9KNkIncKvYin_USF1qoJQnIyMAfRxl`
    //Chill
    if (interaction.values[0].toLowerCase().startsWith(`chi`)) link = `https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6`;
    //Jazz
    if (interaction.values[0].toLowerCase().startsWith(`j`)) link = `https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt`;
    //blues
    if (interaction.values[0].toLowerCase().startsWith(`b`)) link = `https://open.spotify.com/playlist/37i9dQZF1DXd9rSDyQguIk`;
    //strange-fruits
    if (interaction.values[0].toLowerCase().startsWith(`s`)) link = `https://open.spotify.com/playlist/6xGLprv9fmlMgeAMpW0x51`;
    //magic-release
    if (interaction.values[0].toLowerCase().startsWith(`ma`)) link = `https://www.youtube.com/watch?v=WvMc5_RbQNc&list=PLYUn4Yaogdagvwe69dczceHTNm0K_ZG3P`
    //metal
    if (interaction.values[0].toLowerCase().startsWith(`me`)) link = `https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe`;
    //heavy metal
    if (interaction.values[0].toLowerCase().startsWith(`h`)) link = `https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe`;
    //Hollow Coves
    if (interaction.values[0].toLowerCase().startsWith(`h`)) link = `https://open.spotify.com/playlist/37i9dQZF1DX9qNs32fujYe`;
    }
    await interaction.reply({
		content: `**${emoji} Loading the \`${interaction.values[0]}\` Music Mix**`,
		});
		try {
		let options = {
		member: member,
		}
		if (!newQueue) options.textChannel = guild.channels.cache.get(channel.id)
		await client.distube.playVoiceChannel(member.voice.channel, link, options)
		//Edit the reply
		interaction.editReply({
		content: `**${newQueue?.songs?.length > 0 ? `${emoji} Loaded` : `${emoji} Now Playing`}: the \`${interaction.values[0]}\`**`,
		});
		} catch (e) {
		console.log(e.stack ? e.stack : e)
		interaction.editReply({
		embeds: [
		new MessageEmbed()
		.setColor("#e63064")
		.setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
		.setDescription(`\`\`\`${e.stack.toString().substr(0, 800)}\`\`\``)
		.setFooter("Error in code: Report this error to kotlin0427 or _destroyer_#1574")
    ],
    })
    }
    }
    });

    async function updateMusicSystem(queue, leave = false) {
    if(!queue) return;
    if (client.settings.get(queue.id, `music.channel`) && client.settings.get(queue.id, `music.channel`).length > 5) {
    let messageId = client.settings.get(queue.id, `music.message`);
    //try to get the guild
    let guild = client.guilds.cache.get(queue.id);
    if (!guild) return console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Update Music System - The Music System - Guild not found!`));
    //try to get the channel
    let channel = guild.channels.cache.get(client.settings.get(queue.id, `music.channel`));
    if (!channel) channel = await guild.channels.fetch(client.settings.get(queue.id, `music.channel`)).catch(() => {}) || false
    if (!channel) return console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Update Music System - The Music System - Channel not found!`));
    if (!channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) return console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Update Music System - The Music System - Missing Permissions`));
    //try to get the channel
    let message = channel.messages.cache.get(messageId);
    if (!message) message = await channel.messages.fetch(messageId).catch(() => {}) || false;
    if (!message) return console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Update Music System - The Music System - Message not found!`));
    //edit the message so that it's right!
    var data = generateQueueEmbed(client, queue.id, leave)
    message.edit(data).catch((e) => {
    console.log(e)
    }).then(m => {
    console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Update Music System - The Music System - Edited the message due to a User Interaction`));
    })
    }
    }

  //For the Music Request System
  function generateQueueEmbed(client, guildId, leave) {
    let guild = client.guilds.cache.get(guildId)
    if (!guild) return;
    let emoji = client.settings.get(guild.id, `emoji`);
    let color = client.settings.get(guild.id, `color`);
    let thumbnail = client.settings.get(guild.id, `thumbnail`);
    var embeds = [
    new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} ${guild.name.toUpperCase()} MUSIC QUEUE`)
    .setDescription(`There are currently \`0 songs\` in the queue\nadd music to the queue by typing the \`song name\``)
    .setThumbnail(guild.iconURL({ dynamic: true, format: "png", size: 2048 })),
    new MessageEmbed()
    .setColor(color)
    .setThumbnail(client.user.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }))
    .setFooter(guild.name, guild.iconURL({ dynamic: true, format: "png", size: 2048 }))
    .setImage(guild.banner ? guild.bannerURL({ size: 4096 }) : thumbnail)
    .setTitle(`${emoji} START LISTENING TO MUSIC`)
    .setDescription(`> **\`${client.user.username}\`** is ready to start streaming music\n> you can start listening to your favourite songs\n> by connecting to a \`voice channel\` and sending\n> the \`song link\` or \`song name\` in this channel!`)
    ]
    let newQueue = client.distube.getQueue(guild.id);
    let pointer = client.settings.get(guild.id, `pointer`);
    var djs = client.settings.get(guild.id, `djroles`);
    if(!djs || !Array.isArray(djs)) djs = [];
    else djs = djs.map(r => `<@&${r}>`);
    if(djs.length == 0 ) djs = `\`✖ not set\``;
    else djs.slice(0, 15).join(`, `);
    if (!leave && newQueue && newQueue.songs[0]) {
    delete embeds[1].title;
    delete embeds[1].description;
    delete embeds[1].thumbnail;
    embeds[1].setImage(`https://img.youtube.com/vi/${newQueue.songs[0].id}/mqdefault.jpg?width=851&height=613`)
    embeds[1].setAuthor(`${newQueue.songs[0].name.substr(0, 100) + "..."}`, `https://media.discordapp.net/attachments/711910361133219903/920434003239125022/Cd_Animated.gif`, newQueue.songs[0].url)
    embeds[1].setDescription(`
    ${pointer} **${newQueue.playing ? `Loop` : `\`✔ Paused\``}** - ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `\`✔ Queue\`` : `\`✔ Song\`` : `\`✖ Off\``} 
    ${pointer} **Volume** - \`${newQueue.volume}%\`
    ${pointer} **Filter${newQueue.filters.length > 0 ? `s`: ``}** - ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f=>`\`${f}\``).join(`, `)}` : `✖ Off`}
    ${pointer} **DJ-Role${client.settings.get(newQueue.id, `djroles`).length > 1 ? `s`: ``}** - ${djs}
    ${pointer} **Requested by** -  ${newQueue.songs[0].user}
    `)
    embeds[1].addField(`${pointer} Duration:`, `\`${newQueue.formattedCurrentTime}\` ${createBar(newQueue.songs[0].duration, newQueue.currentTime, 13)} \`${newQueue.songs[0].formattedDuration}\``)
    embeds[1].setFooter(`Music for ${newQueue.songs[0].user?.tag}`, newQueue.songs[0].user?.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }))
    const tracks = newQueue.songs;
    var maxTracks = 10;
    var songs = tracks.slice(0, maxTracks);
    embeds[0] = new MessageEmbed()
    .setTitle(`${emoji} ${guild.name.toUpperCase()} MUSIC QUEUE [ ${newQueue.songs.length} TRACKS ]`)
    .setColor(color)
    .setDescription(String(songs.map((track, index) => `> **\`${++index}.\` ${track.url ? `[${track.name.substr(0, 60).replace(/\[/igu, `\\[`).replace(/\]/igu, `\\]`)}](${track.url})` : track.name}** - \`${track.isStream ? `LIVE STREAM` : track.formattedDuration}\`\n> *\`Requested by: ${track.user?.tag}\`*`).join(`\n\n`)).substr(0, 2048));
    if(newQueue.songs.length > 10)
    embeds[0].addField(`> **\`N.\` *${newQueue.songs.length > maxTracks ? newQueue.songs.length - maxTracks : newQueue.songs.length} other Tracks ...***`, `\u200b`)
    embeds[0].addField(`> **\`0.\` PLAYING TRACK**`, `> **${newQueue.songs[0].url ? `[${newQueue.songs[0].name.substr(0, 60).replace(/\[/igu, `\\[`).replace(/\]/igu, `\\]`)}](${newQueue.songs[0].url})`:newQueue.songs[0].name}** - \`${newQueue.songs[0].isStream ? `LIVE STREAM` : newQueue.formattedCurrentTime}\`\n> *\`Requested by: ${newQueue.songs[0].user?.tag}\`*`)
    }
    var Emojis = [
      `0️⃣`,
      `1️⃣`,
      `2️⃣`,
      `3️⃣`,
      `4️⃣`,
      `5️⃣`,
      `6️⃣`,
      `7️⃣`,
      `8️⃣`,
      `9️⃣`,
      `🔟`,
      `🟥`,
      `🟧`,
      `🟨`,
      `🟩`,
      `🟦`,
      `🟪`,
      `🟫`,
    ]
    //now we add the components!
    var soundkiMenu = new MessageSelectMenu()
    .setCustomId(`MessageSelectMenu`)
    .addOptions([`Pop`, `Strange-Fruits`, `Gaming`, `Chill`, `Rock`, `Jazz`, `Blues`, `Metal`, `Magic-Release`, `NCS | No Copyright Music`, `Default`].map((t, index) => {
    return {
    label: t.substr(0, 25),
    value: t.substr(0, 25),
    description: `Load a Music-Playlist: '${t}'`.substr(0, 50),
    emoji: Emojis[index]
    }
    }))
    var stopbutton = new MessageButton().setStyle('DANGER').setCustomId('Stop').setLabel(`⏹ Stop`).setDisabled()
    var skipbutton = new MessageButton().setStyle('PRIMARY').setCustomId('Skip').setLabel(`⏩ Skip`).setDisabled();
    var shufflebutton = new MessageButton().setStyle('PRIMARY').setCustomId('Shuffle').setLabel(`🔀 Shuffle`).setDisabled();
    var pausebutton = new MessageButton().setStyle('SECONDARY').setCustomId('Pause').setLabel(`⏸ Pause`).setDisabled();
    var autoplaybutton = new MessageButton().setStyle('SUCCESS').setCustomId('Autoplay').setLabel(`🔁 Autoplay`).setDisabled();
    var songbutton = new MessageButton().setStyle('PRIMARY').setCustomId('Song').setLabel(`🔂 Repeat Song`).setDisabled();
    var queuebutton = new MessageButton().setStyle('PRIMARY').setCustomId('Queue').setLabel(`🔁 Repeat Queue`).setDisabled();
    var forwardbutton = new MessageButton().setStyle('PRIMARY').setCustomId('Forward').setLabel(`Forward +10s`).setDisabled();
    var rewindbutton = new MessageButton().setStyle('PRIMARY').setCustomId('Rewind').setLabel(`Rewind -10s`).setDisabled();
    if (!leave && newQueue && newQueue.songs[0]) {
    skipbutton = skipbutton.setDisabled(false);
    shufflebutton = shufflebutton.setDisabled(false);
    stopbutton = stopbutton.setDisabled(false);
    songbutton = songbutton.setDisabled(false);
    queuebutton = queuebutton.setDisabled(false);
    forwardbutton = forwardbutton.setDisabled(false);
    rewindbutton = rewindbutton.setDisabled(false);
    autoplaybutton = autoplaybutton.setDisabled(false)
    pausebutton = pausebutton.setDisabled(false)
    if (newQueue.autoplay) {
    autoplaybutton = autoplaybutton.setStyle('SECONDARY')
    }
    if (newQueue.paused) {
    pausebutton = pausebutton.setStyle('SUCCESS').setLabel(`▶ Resume`)
    }
    switch(newQueue.repeatMode) {
    default: { // == 0
    songbutton = songbutton.setStyle('SUCCESS')
    queuebutton = queuebutton.setStyle('SUCCESS')
    } break;
    case 1: {
    songbutton = songbutton.setStyle('SECONDARY')
    queuebutton = queuebutton.setStyle('SUCCESS')
    } break;
    case 2: {
    songbutton = songbutton.setStyle('SUCCESS')
    queuebutton = queuebutton.setStyle('SECONDARY')
    } break;
    }
    }
    //now we add the components!
    var components = [
    new MessageActionRow().addComponents([
    soundkiMenu
    ]),
    new MessageActionRow().addComponents([
    skipbutton,
    stopbutton,
    pausebutton,
    autoplaybutton,
    shufflebutton,
    ]),
    new MessageActionRow().addComponents([
    songbutton,
    queuebutton,
    forwardbutton,
    rewindbutton,
    ]),
    ]
    return {
    embeds,
    components
    }
  }


  // for normal tracks
  function receiveQueueData(newQueue, newTrack) {
    var djs = client.settings.get(newQueue.id, `djroles`);
    let color = client.settings.get(newQueue.id, `color`);
    let emoji = client.settings.get(newQueue.id, `emoji`);
    let pointer = client.settings.get(newQueue.id, `pointer`);
    if(!djs || !Array.isArray(djs)) djs = [];
    else djs = djs.map(r => `<@&${r}>`);
    if(djs.length == 0 ) djs = "`not setup`";
    else djs.slice(0, 15).join(", ");
    if(!newTrack) return message.channel.send(`${emoji} **No song found...**`)
    let songtitle = newTrack.name;
    let songName
    if (songtitle.length > 20) songName = songtitle.substr(0, 35) + "...";
    var embed = new MessageEmbed()
    .setAuthor(newTrack.user.tag.toUpperCase(), newTrack.user.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }))
    .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
    .setColor(color)
    .setDescription(`
    ${pointer} **PLAYING SONG**
    ${pointer} **Song** - \`${songName}\`
    ${pointer} **Loop** - ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `\`✔ Queue\`` : `\`✔ Song\`` : `\`✖ Off\``}
    ${pointer} **Duration** - \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\`
    ${pointer} **Queue** - \`${newQueue.songs.length} song(s)\` : \`${newQueue.formattedDuration}\`
    ${pointer} **Volume** - \`${newQueue.volume}%\`
    ${pointer} **Autoplay** -  ${newQueue.autoplay ? `\`✔ On\`` : `\`✖ Off\``}
    ${pointer} **Filter${newQueue.filters.length > 0 ? "s": ""}** - ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f=>`\`${f}\``).join(`, `)}` : `\`✖ Off\``}
    ${pointer} **DJ-Role${client.settings.get(newQueue.id, "djroles").length > 1 ? "s": ""}** - ${djs}
    ${pointer} **Requested by** -  ${newTrack.user}
    ${pointer} **Download Song** - [\`Click here\`](${newTrack.streamURL})
    ${pointer} **Watch Music Video** - [\`Watch here\`](${newTrack.url})
    `)
    let skip = new MessageButton().setStyle('PRIMARY').setCustomId('1').setLabel(`⏩ Skip`)
    let stop = new MessageButton().setStyle('DANGER').setCustomId('2').setLabel(`⏹ Stop`)
    let pause = new MessageButton().setStyle('SECONDARY').setCustomId('3').setLabel(`⏸ Pause`)
    let autoplay = new MessageButton().setStyle('SUCCESS').setCustomId('4').setLabel(`🔁 Autoplay`)
    let shuffle = new MessageButton().setStyle('PRIMARY').setCustomId('5').setLabel(`🔀 Shuffle`)
    if (!newQueue.playing) {
      pause = pause.setStyle('SUCCESS').setLabel(`▶️ Resume`)
    }
    if (newQueue.autoplay) {
      autoplay = autoplay.setStyle('SECONDARY')
    }
    let songloop = new MessageButton().setStyle('PRIMARY').setCustomId('6').setLabel(`🔂 Repeat Song`)
    let queueloop = new MessageButton().setStyle('PRIMARY').setCustomId('7').setLabel(`🔁 Repeat Queue`)
    let forward = new MessageButton().setStyle('PRIMARY').setCustomId('8').setLabel(`Forward +10s`)
    let rewind = new MessageButton().setStyle('PRIMARY').setCustomId('9').setLabel(`Rewind -10s`)
    if (newQueue.repeatMode === 0) {
      songloop = songloop.setStyle('PRIMARY')
      queueloop = queueloop.setStyle('PRIMARY')
    }
    if (newQueue.repeatMode === 1) {
      songloop = songloop.setStyle('SECONDARY')
      queueloop = queueloop.setStyle('SUCCESS')
    }
    if (newQueue.repeatMode === 2) {
      songloop = songloop.setStyle('SUCCESS')
      queueloop = queueloop.setStyle('SECONDARY')
    }
    if (Math.floor(newQueue.currentTime) < 10) {
      rewind = rewind.setDisabled()
    } else {
      rewind = rewind.setDisabled(false)
    }
    if (Math.floor((newTrack.duration - newQueue.currentTime)) <= 10) {
      forward = forward.setDisabled()
    } else {
      forward = forward.setDisabled(false)
    }
    const row = new MessageActionRow().addComponents([skip, stop, pause, autoplay, shuffle]);
    const row2 = new MessageActionRow().addComponents([songloop, queueloop, forward, rewind]);
    return {
      embeds: [embed],
      components: [row, row2]
    };
  }
};
function escapeRegex(str) {
  try {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  } catch {
    return str
  }
}