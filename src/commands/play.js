const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const { getOrCreatePlayer } = require('../music/player');
const play = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reda un URL sau cauta pe YouTube.'),
  category: 'music',
    .addStringOption((o) => o.setName('query').setDescription('URL sau cautare').setRequired(true)),
  async execute(interaction) {
    const member = interaction.member;
    if (!member?.voice?.channel) {
      await interaction.reply({ content: 'Intra intr-un canal vocal mai intai.', ephemeral: true });
      return;
    }
    const query = interaction.options.getString('query', true);
    const gmp = getOrCreatePlayer(interaction.guild);
    try {
      if (!gmp.isConnected) await gmp.connectTo(member);

      // YouTube playlist
      if (play.yt_validate(query) === 'playlist') {
        const playlist = await play.playlist_info(query, { incomplete: true });
        const videos = await playlist.all_videos();
        videos.slice(0, 50).forEach((v) => {
          gmp.enqueue({ url: v.url, title: v.title });
        });
        await interaction.reply(embeds.success(`Playlist adaugat: ${playlist.title} (${Math.min(videos.length, 50)} intrari)`, 'Music'));
        return;
      }

      // Spotify track / playlist -> map to YouTube
      const spType = (typeof play.sp_validate === 'function') ? play.sp_validate(query) : null;
      if (spType === 'track') {
        const sp = await play.spotify(query);
        const searchQ = `${sp.name} ${sp.artists?.[0]?.name || ''}`.trim();
        const results = await play.search(searchQ, { limit: 1, source: { youtube: 'video' } });
        if (!results.length) {
          await interaction.reply(embeds.error('Nu am gasit un video pentru acest track Spotify.', 'Music'));
          return;
        }
        const info = await play.video_basic_info(results[0].url);
        gmp.enqueue({ url: info.video_details.url, title: info.video_details.title });
        await interaction.reply(embeds.success(`Adaugat: ${info.video_details.title}`, 'Music'));
        return;
      }
      if (spType === 'playlist' || spType === 'album') {
        const sp = await play.spotify(query);
        const tracks = await sp.all_tracks();
        let added = 0;
        for (const t of tracks.slice(0, 50)) {
          const searchQ = `${t.name} ${t.artists?.[0]?.name || ''}`.trim();
          const results = await play.search(searchQ, { limit: 1, source: { youtube: 'video' } });
          if (results.length) {
            gmp.enqueue({ url: results[0].url, title: `${t.name} - ${t.artists?.[0]?.name || ''}`.trim() });
            added += 1;
          }
        }
        await interaction.reply({ content: `Playlist/album Spotify mapat la YouTube (${added} piese adaugate)`, ephemeral: true });
        return;
      }

      // Single video or search
      let videoUrl;
      if (play.yt_validate(query) === 'video') {
        videoUrl = query;
      } else {
        const results = await play.search(query, { limit: 1, source: { youtube: 'video' } });
        if (!results.length) {
          await interaction.reply(embeds.error('Nu am gasit rezultat.', 'Music'));
          return;
        }
        videoUrl = results[0].url;
      }
      const info = await play.video_basic_info(videoUrl);
      gmp.enqueue({ url: info.video_details.url, title: info.video_details.title });
      await interaction.reply(embeds.success(`Adaugat: ${info.video_details.title}`, 'Music'));
    } catch (e) {
      await interaction.reply(embeds.error(`Nu am putut reda piesa: ${e?.message || e}`, 'Music'));
    }
  },
};


