const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

module.exports = {
  data: new SlashCommandBuilder()
  category: 'fun',
    .setName('poll')
    .setDescription('Creeaza un sondaj simplu (2-5 optiuni).')
    .addStringOption((o) => o.setName('intrebare').setDescription('Intrebarea').setRequired(true))
    .addStringOption((o) => o.setName('opt1').setDescription('Optiunea 1').setRequired(true))
    .addStringOption((o) => o.setName('opt2').setDescription('Optiunea 2').setRequired(true))
    .addStringOption((o) => o.setName('opt3').setDescription('Optiunea 3 (opțională)').setRequired(false))
    .addStringOption((o) => o.setName('opt4').setDescription('Optiunea 4 (opțională)').setRequired(false))
    .addStringOption((o) => o.setName('opt5').setDescription('Optiunea 5 (opțională)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  async execute(interaction) {
    const q = interaction.options.getString('intrebare', true);
    const options = [1, 2, 3, 4, 5]
      .map((i) => interaction.options.getString(`opt${i}`))
      .filter((v) => Boolean(v));

    if (options.length < 2) {
      await interaction.reply({ content: 'Sunt necesare cel putin 2 optiuni.', ephemeral: true });
      return;
    }

    const lines = options.map((opt, idx) => `${EMOJIS[idx]} ${opt}`).join('\n');
    const message = await interaction.channel.send({ content: `📊 ${q}\n\n${lines}` });
    for (let i = 0; i < options.length; i += 1) {
      await message.react(EMOJIS[i]);
    }
    await interaction.reply({ content: 'Sondaj creat!' });
  },
};


