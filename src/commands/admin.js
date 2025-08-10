const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'admin',
    .setName('admin')
    .setDescription('Comenzi administrative pentru economy (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('addcoins')
        .setDescription('Adaugă coins unui utilizator')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('Utilizatorul căruia să i se adauge coins')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Cantitatea de coins de adăugat')
            .setRequired(true)
            .setMinValue(1)
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Motivul pentru adăugarea coins')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('removecoins')
        .setDescription('Elimină coins de la un utilizator')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('Utilizatorul de la care să se elimine coins')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Cantitatea de coins de eliminat')
            .setRequired(true)
            .setMinValue(1)
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Motivul pentru eliminarea coins')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setcoins')
        .setDescription('Setează coins-urile unui utilizator la o valoare specifică')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('Utilizatorul căruia să i se seteze coins')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Noua valoare pentru coins')
            .setRequired(true)
            .setMinValue(0)
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Motivul pentru setarea coins')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('resetuser')
        .setDescription('Resetează toate datele unui utilizator')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('Utilizatorul de resetat')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Motivul pentru reset')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('economystats')
        .setDescription('Afișează statistici despre economy-ul serverului')
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;

      if (subcommand === 'addcoins') {
        await this.addCoins(interaction, guildId);
      } else if (subcommand === 'removecoins') {
        await this.removeCoins(interaction, guildId);
      } else if (subcommand === 'setcoins') {
        await this.setCoins(interaction, guildId);
      } else if (subcommand === 'resetuser') {
        await this.resetUser(interaction, guildId);
      } else if (subcommand === 'economystats') {
        await this.economyStats(interaction, guildId);
      }
    } catch (error) {
      console.error('Error in admin command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la executarea comenzii administrative.', 
        ephemeral: true 
      });
    }
  },

  async addCoins(interaction, guildId) {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'Admin addition';

    // Obține utilizatorul
    let user = await getOrCreateUser(targetUser.id, guildId, targetUser.username);

    // Adaugă coins
    user = await prisma.user.update({
      where: { id: user.id },
      data: { coins: { increment: amount } }
    });

    // Adaugă tranzacția
    await addTransaction(user.id, 'ADMIN_ADD', amount, reason);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Coins adăugate cu succes!')
      .setDescription(`Ai adăugat **${amount} coins** utilizatorului **${targetUser.username}**!`)
      .addFields(
        { name: '👤 Utilizator', value: targetUser.username, inline: true },
        { name: '💰 Coins adăugate', value: `${amount}`, inline: true },
        { name: '🏦 Soldul nou', value: `${user.coins}`, inline: true },
        { name: '👨‍💼 Admin', value: interaction.user.username, inline: true },
        { name: '📝 Motiv', value: reason, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async removeCoins(interaction, guildId) {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'Admin removal';

    // Obține utilizatorul
    let user = await getOrCreateUser(targetUser.id, guildId, targetUser.username);

    // Verifică dacă are suficienți coins
    if (user.coins < amount) {
      await interaction.reply({ 
        content: `Utilizatorul **${targetUser.username}** are doar **${user.coins} coins**, nu poți elimina **${amount} coins**.`, 
        ephemeral: true 
      });
      return;
    }

    // Elimină coins
    user = await prisma.user.update({
      where: { id: user.id },
      data: { coins: { decrement: amount } }
    });

    // Adaugă tranzacția
    await addTransaction(user.id, 'ADMIN_REMOVE', -amount, reason);

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('✅ Coins eliminate cu succes!')
      .setDescription(`Ai eliminat **${amount} coins** de la utilizatorul **${targetUser.username}**!`)
      .addFields(
        { name: '👤 Utilizator', value: targetUser.username, inline: true },
        { name: '💰 Coins eliminate', value: `${amount}`, inline: true },
        { name: '🏦 Soldul nou', value: `${user.coins}`, inline: true },
        { name: '👨‍💼 Admin', value: interaction.user.username, inline: true },
        { name: '📝 Motiv', value: reason, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async setCoins(interaction, guildId) {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'Admin set';

    // Obține utilizatorul
    let user = await getOrCreateUser(targetUser.id, guildId, targetUser.username);
    const oldAmount = user.coins;

    // Setează coins
    user = await prisma.user.update({
      where: { id: user.id },
      data: { coins: amount }
    });

    // Adaugă tranzacția
    const difference = amount - oldAmount;
    if (difference !== 0) {
      await addTransaction(user.id, difference > 0 ? 'ADMIN_ADD' : 'ADMIN_REMOVE', Math.abs(difference), reason);
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Coins setate cu succes!')
      .setDescription(`Ai setat coins-urile utilizatorului **${targetUser.username}** la **${amount}**!`)
      .addFields(
        { name: '👤 Utilizator', value: targetUser.username, inline: true },
        { name: '💰 Soldul vechi', value: `${oldAmount}`, inline: true },
        { name: '🏦 Soldul nou', value: `${amount}`, inline: true },
        { name: '👨‍💼 Admin', value: interaction.user.username, inline: true },
        { name: '📝 Motiv', value: reason, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async resetUser(interaction, guildId) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Admin reset';

    // Obține utilizatorul
    const user = await getOrCreateUser(targetUser.id, guildId, targetUser.username);

    // Resetează utilizatorul
    await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: 0,
        bank: 0,
        level: 1,
        xp: 0,
        lastDaily: null,
        lastWork: null,
        lastRob: null
      }
    });

    // Șterge tranzacțiile
    await prisma.transaction.deleteMany({
      where: { userId: user.id }
    });

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🔄 Utilizator resetat cu succes!')
      .setDescription(`Ai resetat toate datele utilizatorului **${targetUser.username}**!`)
      .addFields(
        { name: '👤 Utilizator', value: targetUser.username, inline: true },
        { name: '👨‍💼 Admin', value: interaction.user.username, inline: true },
        { name: '📝 Motiv', value: reason, inline: true },
        { name: '⚠️ Atenție', value: 'Toate datele au fost resetate la valorile implicite!', inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async economyStats(interaction, guildId) {
    // Obține statistici despre economy
    const totalUsers = await prisma.user.count({ where: { guildId } });
    const totalCoins = await prisma.user.aggregate({
      where: { guildId },
      _sum: { coins: true }
    });
    const totalBank = await prisma.user.aggregate({
      where: { guildId },
      _sum: { bank: true }
    });
    const avgCoins = totalUsers > 0 ? Math.round((totalCoins._sum.coins || 0) / totalUsers) : 0;
    const avgBank = totalUsers > 0 ? Math.round((totalBank._sum.bank || 0) / totalUsers) : 0;

    // Top 5 utilizatori
    const topUsers = await prisma.user.findMany({
      where: { guildId },
      orderBy: { coins: 'desc' },
      take: 5
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('📊 Statistici Economy Server')
      .setDescription(`Statistici despre economy-ul **${interaction.guild.name}**`)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👥 Total utilizatori', value: `${totalUsers}`, inline: true },
        { name: '💰 Total coins', value: `${totalCoins._sum.coins || 0}`, inline: true },
        { name: '🏦 Total bancă', value: `${totalBank._sum.bank || 0}`, inline: true },
        { name: '📈 Media coins', value: `${avgCoins}`, inline: true },
        { name: '📊 Media bancă', value: `${avgBank}`, inline: true }
      )
      .setTimestamp();

    // Adaugă top utilizatori
    if (topUsers.length > 0) {
      let topList = '';
      topUsers.forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        topList += `${medal} **${user.username}** - ${user.coins} coins\n`;
      });
      
      embed.addFields({
        name: '🏆 Top 5 Utilizatori',
        value: topList,
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
