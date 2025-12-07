import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploaderService {
  private readonly logger = new Logger(UploaderService.name);
  private readonly githubToken: string;
  private readonly githubOwner: string;
  private readonly githubRepo: string;
  private readonly githubBranch: string;

  constructor(private configService: ConfigService) {
    this.githubToken = this.configService.get<string>('GITHUB_TOKEN') || process.env.GITHUB_TOKEN || '';
    this.githubOwner = this.configService.get<string>('GITHUB_OWNER') || process.env.GITHUB_OWNER || 'yannhallage';
    this.githubRepo = this.configService.get<string>('GITHUB_REPO') || process.env.GITHUB_REPO || 'uploade';
    this.githubBranch = this.configService.get<string>('GITHUB_BRANCH') || process.env.GITHUB_BRANCH || 'main';

    if (!this.githubToken) {
      this.logger.warn('GITHUB_TOKEN manquant. Vérifiez la variable d\'environnement.');
    }
    
    this.logger.log(`Configuration GitHub: ${this.githubOwner}/${this.githubRepo} (branch: ${this.githubBranch})`);
  }

  /**
   * Upload un fichier PDF sur GitHub
   * @param file - Le fichier à uploader
   * @param folder - Le dossier de destination (optionnel)
   * @returns L'URL du fichier sur GitHub
   */
  // async uploadPdfToGitHub(file: Express.Multer.File, folder?: string): Promise<string> {
  //   if (!file) {
  //     throw new BadRequestException('Aucun fichier fourni');
  //   }

  //   // Vérifier que c'est un PDF
  //   if (file.mimetype !== 'application/pdf') {
  //     throw new BadRequestException('Le fichier doit être un PDF');
  //   }

  //   if (!this.githubToken) {
  //     throw new BadRequestException('GITHUB_TOKEN manquant. Vérifiez les variables d\'environnement.');
  //   }

  //   try {
  //     // Générer un nom de fichier unique
  //     const timestamp = Date.now();
  //     const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  //     const fileName = `${timestamp}_${originalName}`;
  //     // Enregistrer à la racine du repository si aucun folder n'est spécifié
  //     const filePath = folder ? `${folder}/${fileName}` : fileName;


  //     // Convertir le buffer en base64
  //     const content = file.buffer.toString('base64');

  //     // Obtenir le SHA du fichier s'il existe déjà (pour mise à jour)
  //     let sha: string | null = null;
  //     try {
  //       const existingFile = await this.getFileFromGitHub(filePath);
  //       sha = existingFile.sha;
  //     } catch (error) {
  //       // Le fichier n'existe pas, on va le créer
  //       this.logger.log(`Création d'un nouveau fichier: ${filePath}`);
  //     }

  //     // Préparer les données pour l'API GitHub
  //     const apiUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/contents/${filePath}`;

  //     const body: any = {
  //       message: `Upload PDF: ${fileName}`,
  //       content: content,
  //       branch: this.githubBranch,
  //     };

  //     if (sha) {
  //       body.sha = sha;
  //     }

  //     // Uploader sur GitHub
  //     const response = await fetch(apiUrl, {
  //       method: sha ? 'PUT' : 'POST',
  //       headers: {
  //         'Authorization': `token ${this.githubToken}`,
  //         'Accept': 'application/vnd.github.v3+json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(body),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       this.logger.error(`Erreur GitHub API: ${JSON.stringify(errorData)}`);
  //       throw new BadRequestException(`Erreur lors de l'upload sur GitHub: ${errorData.message || response.statusText}`);
  //     }

  //     const data = await response.json();

  //     // Construire l'URL de téléchargement
  //     const downloadUrl = data.content.download_url ||
  //       `https://raw.githubusercontent.com/${this.githubOwner}/${this.githubRepo}/${this.githubBranch}/${filePath}`;

  //     this.logger.log(`Fichier uploadé avec succès: ${downloadUrl}`);

  //     return downloadUrl;
  //   } catch (error: any) {
  //     this.logger.error(`Erreur lors de l'upload: ${error.message}`);
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
  //   }
  // }

  async uploadPdfToGitHub(file: Express.Multer.File): Promise<string> {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Le fichier doit être un PDF');
    if (!this.githubToken) throw new BadRequestException('GITHUB_TOKEN manquant. Vérifiez les variables d\'environnement.');
  
    try {
      // Nom de fichier unique
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${originalName}`;
  
      // On met directement à la racine
      const filePath = fileName;
  
      // Convertir en base64
      const content = file.buffer.toString('base64');
  
      // Vérifier si le fichier existe déjà
      let sha: string | null = null;
      try {
        const existingFile = await this.getFileFromGitHub(filePath);
        sha = existingFile.sha;
      } catch (err) {
        this.logger.log(`Création d'un nouveau fichier: ${filePath}`);
      }
  
      const apiUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/contents/${filePath}`;
      const body: any = {
        message: `Upload PDF: ${fileName}`,
        content,
        branch: this.githubBranch,
      };
      if (sha) body.sha = sha;
  
      const response = await fetch(apiUrl, {
        method: 'PUT', // PUT fonctionne pour créer ou mettre à jour
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Erreur GitHub API: ${JSON.stringify(errorData)}`);
        throw new BadRequestException(`Erreur lors de l'upload sur GitHub: ${errorData.message || response.statusText}`);
      }
  
      const data = await response.json();
      const downloadUrl = data.content.download_url || 
        `https://raw.githubusercontent.com/${this.githubOwner}/${this.githubRepo}/${this.githubBranch}/${filePath}`;
  
      this.logger.log(`Fichier uploadé avec succès: ${downloadUrl}`);
      return downloadUrl;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'upload: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }
  
  /**
   * Récupère les informations d'un fichier depuis GitHub
   * @param filePath - Le chemin du fichier
   * @returns Les informations du fichier
   */
  private async getFileFromGitHub(filePath: string): Promise<{ sha: string }> {
    const apiUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/contents/${filePath}?ref=${this.githubBranch}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Fichier non trouvé');
    }

    return await response.json();
  }

  /**
   * Supprime un fichier de GitHub
   * @param filePath - Le chemin du fichier à supprimer
   */
  async deleteFileFromGitHub(filePath: string): Promise<void> {
    if (!this.githubToken) {
      throw new BadRequestException('GITHUB_TOKEN manquant. Vérifiez les variables d\'environnement.');
    }

    try {
      const fileInfo = await this.getFileFromGitHub(filePath);

      const apiUrl = `https://api.github.com/repos/${this.githubOwner}/${this.githubRepo}/contents/${filePath}`;

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Suppression du fichier: ${filePath}`,
          sha: fileInfo.sha,
          branch: this.githubBranch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new BadRequestException(`Erreur lors de la suppression: ${errorData.message}`);
      }

      this.logger.log(`Fichier supprimé avec succès: ${filePath}`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de la suppression: ${error.message}`);
      throw new BadRequestException(`Erreur lors de la suppression: ${error.message}`);
    }
  }
}

