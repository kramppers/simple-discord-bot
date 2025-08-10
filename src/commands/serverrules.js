const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('serverrules')
    .setDescription('Afișează regulile serverului'),
  
  async execute(interaction) {
    const guild = interaction.guild;
    
    const embed = new EmbedBuilder()
      .setTitle(`📜 Regulile Serverului ${guild.name}`)
      .setColor(0xff6b6b)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '1️⃣ Respectul Reciproc', value: 'Tratează pe toată lumea cu respect. Nu tolerăm hărțuirea, bullying-ul sau comportamentul toxic.', inline: false },
        { name: '2️⃣ Conținutul Potrivit', value: 'Nu posta conținut NSFW, violent sau ilegal. Păstrează conversațiile potrivite pentru toate vârstele.', inline: false },
        { name: '3️⃣ Spam și Reclame', value: 'Nu face spam sau nu face reclame fără permisiune. Nu posta link-uri suspecte sau scam-uri.', inline: false },
        { name: '4️⃣ Canalele Corecte', value: 'Folosește canalele pentru scopul lor destinat. Nu posta muzică în canalele de text, etc.', inline: false },
        { name: '5️⃣ Discord ToS', value: 'Respectă Termenii de Serviciu Discord. Nu folosi bot-uri self-bot sau alte încălcări.', inline: false },
        { name: '6️⃣ Staff-ul', value: 'Respectă deciziile staff-ului. Dacă ai o problemă, contactează un moderator.', inline: false },
        { name: '7️⃣ Invitațiile', value: 'Invită doar oameni de încredere. Ești responsabil pentru acțiunile invitaților tăi.', inline: false },
        { name: '8️⃣ Limba Română', value: 'Încearcă să folosești limba română în conversații. Engleza este acceptată doar când este necesar.', inline: false }
      )
      .addFields(
        { name: '⚠️ Consecințe', value: 'Încălcarea regulilor poate duce la:\n• Avertisment\n• Timeout temporar\n• Kick din server\n• Ban permanent', inline: false },
        { name: '📞 Contact', value: 'Dacă ai întrebări despre reguli sau vrei să raportezi o încălcare, contactează un moderator.', inline: false }
      )
      .setFooter({ text: 'Regulile pot fi actualizate oricând. Verifică periodic pentru modificări.' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
