const {
  joinVoiceChannel,
  createAudioPlayer,
  NoSubscriberBehavior,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');
const { GuildMember } = require('discord.js');
const play = require('play-dl');
let ytdl = require('ytdl-core');
try {
  // Prefer @distube/ytdl-core if available
  // eslint-disable-next-line global-require
  ytdl = require('@distube/ytdl-core');
} catch {}

class GuildMusicPlayer {
  constructor(guild) {
    this.guild = guild;
    this.connection = null;
    this.player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
    });
    this.queue = [];
    this.current = null;

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.playNext();
    });
    this.player.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Audio player error:', err.message);
      this.playNext();
    });
  }

  get isConnected() {
    return Boolean(this.connection);
  }

  async connectTo(member) {
    if (!(member instanceof GuildMember) || !member.voice.channel) {
      throw new Error('Membrul nu este intr-un canal vocal.');
    }
    const channel = member.voice.channel;
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
    });
    await entersState(this.connection, VoiceConnectionStatus.Ready, 15_000);
    this.connection.subscribe(this.player);
  }

  enqueue(track) {
    this.queue.push(track);
    if (this.player.state.status === AudioPlayerStatus.Idle) {
      this.playNext();
    }
  }

  async playNext() {
    const next = this.queue.shift();
    if (!next) {
      this.current = null;
      return;
    }
    try {
      let url = next.url;
      if (!url || typeof url !== 'string') {
        if (next.title) {
          const results = await play.search(next.title, { limit: 1, source: { youtube: 'video' } });
          if (results && results[0]?.url) url = results[0].url;
        }
      }
      if (!url) throw new Error('Invalid URL');

      // Prefer ytdl-core for YouTube
      if (ytdl.validateURL(url)) {
        const stream = ytdl(url, {
          filter: 'audioonly',
          quality: 'highestaudio',
          highWaterMark: 1 << 25,
          requestOptions: {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          },
        });
        const resource = createAudioResource(stream);
        this.current = { ...next, url };
        this.player.play(resource);
        return;
      }

      // Fallback to play-dl for non-YouTube sources
      const pstream = await play.stream(url);
      const resource = createAudioResource(pstream.stream, { inputType: pstream.type });
      this.current = { ...next, url };
      this.player.play(resource);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Stream error, skipping:', e?.message || e);
      this.playNext();
    }
  }

  pause() {
    return this.player.pause();
  }

  resume() {
    return this.player.unpause();
  }

  stop() {
    this.queue = [];
    return this.player.stop(true);
  }

  skip() {
    return this.player.stop(true);
  }

  disconnect() {
    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }
  }
}

const guildIdToPlayer = new Map();

function getOrCreatePlayer(guild) {
  let player = guildIdToPlayer.get(guild.id);
  if (!player) {
    player = new GuildMusicPlayer(guild);
    guildIdToPlayer.set(guild.id, player);
  }
  return player;
}

module.exports = { GuildMusicPlayer, getOrCreatePlayer };


