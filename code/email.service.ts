// async invitePersonnel(chef: Personnel, inviteDto: InvitePersonnelDto) {
//   this.logger.log(`Invitation d'un nouveau personnel par le chef ${chef.email_travail}`);

//   // Vérifier que l'email n'existe pas déjà
//   const existingPersonnel = await this.prisma.personnel.findFirst({
//     where: {
//       OR: [
//         { email_travail: inviteDto.email_travail },
//         { email_personnel: inviteDto.email_personnel },
//       ],
//     },
//   });

//   if (existingPersonnel) {
//     throw new BadRequestException('Un personnel avec cet email existe déjà');
//   }

//   // Générer un mot de passe temporaire
//   const temporaryPassword = await this.authService.generateTemporaryPassword();

//   // Créer le personnel
//   const newPersonnel = await this.prisma.personnel.create({
//     data: {
//       nom_personnel: inviteDto.nom_personnel,
//       prenom_personnel: inviteDto.prenom_personnel,
//       email_travail: inviteDto.email_travail,
//       email_personnel: inviteDto.email_personnel,
//       password: await bcrypt.hash(temporaryPassword, 10),
//       matricule_personnel: inviteDto.matricule_personnel,
//       telephone_travail: inviteDto.telephone_travail,
//       telephone_personnel: inviteDto.telephone_personnel,
//       type_personnel: inviteDto.type_personnel,
//       role_personnel: RolePersonnel.EMPLOYE,
//       id_service: chef.id_service,
//     },
//   });

//   // Envoyer l'email d'invitation
//   await this.emailService.sendInvitationEmail(
//     inviteDto.email_travail,
//     temporaryPassword,
//     inviteDto.nom_personnel,
//     inviteDto.prenom_personnel,
//   );

//   // Mettre à jour le nombre de personnel du service
//   await this.prisma.service.update({
//     where: { id_service: chef.id_service },
//     data: {
//       nb_personnel: {
//         increment: 1,
//       },
//     },
//   });

//   this.logger.log(`Personnel invité avec succès: ${newPersonnel.email_travail}`);
//   return {
//     message: 'Personnel invité avec succès',
//     personnel: {
//       id: newPersonnel.id_personnel,
//       nom: newPersonnel.nom_personnel,
//       prenom: newPersonnel.prenom_personnel,
//       email: newPersonnel.email_travail,
//     },
//   };
// }


// -----------------------------
// Inviter un personnel
// -----------------------------
