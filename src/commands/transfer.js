const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('transfer')
    .setDescription('Transferă coins către alt utilizator')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Utilizatorul către care vrei să transferi coins')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Cantitatea de coins de transferat')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    try {
      const senderId = interaction.user.id;
      const receiverId = interaction.options.getUser('user').id;
      const amount = interaction.options.getInteger('amount');
      const guildId = interaction.guild.id;

      // Verifică dacă nu încearcă să se transfere pe sine
      if (senderId === receiverId) {
        await interaction.reply({ 
          content: 'Nu poți să te transferi pe tine însuți!', 
          ephemeral: true 
        });
        return;
      }

      // Obține utilizatorii
      const sender = await getOrCreateUser(senderId, guildId, interaction.user.username);
      const receiver = await getOrCreateUser(receiverId, guildId, interaction.options.getUser('user').username);

      // Verifică dacă expeditorul are suficienți coins
      if (sender.coins < amount) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Fonduri insuficiente!')
          .setDescription(`Ai doar **${sender.coins} coins**, dar încerci să transferi **${amount} coins**.`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // Efectuează transferul
      await prisma.user.update({
        where: { id: sender.id },
        data: { coins: { decrement: amount } }
      });

      await prisma.user.update({
        where: { id: receiver.id },
        data: { coins: { increment: amount } }
      });

      // Adaugă tranzacțiile
      await addTransaction(sender.id, 'TRANSFER', -amount, `Transfer to ${receiver.username}`);
      await addTransaction(receiver.id, 'TRANSFER', amount, `Transfer from ${sender.username}`);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Transfer realizat cu succes!')
        .setDescription(`Ai transferat **${amount} coins** către **${receiver.username}**!`)
        .addFields(
          { name: '👤 De la', value: interaction.user.username, inline: true },
          { name: '👥 Către', value: receiver.username, inline: true },
          { name: '💰 Suma', value: `${amount} coins`, inline: true },
          { name: '🏦 Soldul tău nou', value: `${sender.coins - amount}`, inline: true },
          { name: '🏦 Soldul lui nou', value: `${receiver.coins + amount}`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in transfer command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la transferul de coins.', 
        ephemeral: true 
      });
    }
  },
};
