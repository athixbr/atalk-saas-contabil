'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tabela de Pastas do GED
    await queryInterface.createTable('GedFolders', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      parentId: {
        type: Sequelize.INTEGER,
        references: { model: 'GedFolders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
        comment: 'Criador da pasta'
      },
      type: {
        type: Sequelize.ENUM('root', 'department', 'personal', 'shared', 'client', 'custom'),
        defaultValue: 'custom',
        allowNull: false
      },
      clientId: {
        type: Sequelize.INTEGER,
        references: { model: 'Clientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true,
        comment: 'Vinculo com cliente se type=client'
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Vinculo com departamento se type=department'
      },
      permissions: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Permissões específicas da pasta: {userId: role, departmentId: role}'
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Se true, todos da empresa podem ver'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Cor da pasta em hex'
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Ícone personalizado'
      },
      path: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Path completo ex: /root/dept/subfolder'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tabela de Arquivos do GED
    await queryInterface.createTable('GedFiles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      folderId: {
        type: Sequelize.INTEGER,
        references: { model: 'GedFolders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
        comment: 'Quem fez upload'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      originalName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nome original do arquivo'
      },
      extension: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Tamanho em bytes'
      },
      path: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Path no storage (Digital Ocean)'
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL pública se aplicável'
      },
      thumbnailPath: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Path do thumbnail para imagens/PDFs'
      },
      currentVersion: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Hash MD5/SHA256 para detectar duplicatas'
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: [],
        comment: 'Tags/categorias do arquivo'
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Metadados extras: dimensions, duration, pages, etc'
      },
      isFavorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      downloads: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Contador de downloads'
      },
      lastAccessedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Soft delete - arquivo na lixeira'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deletedBy: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      restoreUntil: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data limite para restaurar da lixeira'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tabela de Versões de Arquivos
    await queryInterface.createTable('GedFileVersions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      fileId: {
        type: Sequelize.INTEGER,
        references: { model: 'GedFiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      versionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Comentário sobre a versão'
      },
      isCurrent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tabela de Log de Atividades
    await queryInterface.createTable('GedActivityLogs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      entityType: {
        type: Sequelize.ENUM('file', 'folder', 'version'),
        allowNull: false
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      action: {
        type: Sequelize.ENUM(
          'create', 'upload', 'update', 'rename', 'move', 'copy',
          'delete', 'restore', 'download', 'share', 'unshare',
          'version_create', 'version_restore', 'permission_change',
          'favorite', 'unfavorite', 'tag_add', 'tag_remove'
        ),
        allowNull: false
      },
      details: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Detalhes da ação: oldName, newName, fromFolder, toFolder, etc'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tabela de Compartilhamentos
    await queryInterface.createTable('GedShares', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      fileId: {
        type: Sequelize.INTEGER,
        references: { model: 'GedFiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true
      },
      folderId: {
        type: Sequelize.INTEGER,
        references: { model: 'GedFolders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true
      },
      sharedBy: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      shareType: {
        type: Sequelize.ENUM('user', 'department', 'link', 'public'),
        allowNull: false
      },
      sharedWithUserId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true
      },
      sharedWithDepartmentId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      shareToken: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        comment: 'Token único para compartilhamento por link'
      },
      permissions: {
        type: Sequelize.ENUM('view', 'download', 'edit', 'full'),
        defaultValue: 'view',
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Senha para acesso via link (hash)'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      maxDownloads: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Limite de downloads para links'
      },
      downloadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Tabela de Comentários
    await queryInterface.createTable('GedComments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      fileId: {
        type: Sequelize.INTEGER,
        references: { model: 'GedFiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      parentId: {
        type: Sequelize.INTEGER,
        references: { model: 'GedComments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true,
        comment: 'Para respostas a comentários'
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      mentions: {
        type: Sequelize.JSON,
        defaultValue: [],
        comment: 'IDs de usuários mencionados'
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      editedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Índices para melhor performance
    await queryInterface.addIndex('GedFolders', ['companyId']);
    await queryInterface.addIndex('GedFolders', ['parentId']);
    await queryInterface.addIndex('GedFolders', ['userId']);
    await queryInterface.addIndex('GedFolders', ['type']);
    await queryInterface.addIndex('GedFolders', ['clientId']);
    await queryInterface.addIndex('GedFolders', ['departmentId']);

    await queryInterface.addIndex('GedFiles', ['companyId']);
    await queryInterface.addIndex('GedFiles', ['folderId']);
    await queryInterface.addIndex('GedFiles', ['userId']);
    await queryInterface.addIndex('GedFiles', ['isDeleted']);
    await queryInterface.addIndex('GedFiles', ['hash']);
    await queryInterface.addIndex('GedFiles', ['name']);

    await queryInterface.addIndex('GedFileVersions', ['fileId']);
    await queryInterface.addIndex('GedFileVersions', ['companyId']);
    await queryInterface.addIndex('GedFileVersions', ['isCurrent']);

    await queryInterface.addIndex('GedActivityLogs', ['companyId']);
    await queryInterface.addIndex('GedActivityLogs', ['userId']);
    await queryInterface.addIndex('GedActivityLogs', ['entityType', 'entityId']);
    await queryInterface.addIndex('GedActivityLogs', ['action']);
    await queryInterface.addIndex('GedActivityLogs', ['createdAt']);

    await queryInterface.addIndex('GedShares', ['companyId']);
    await queryInterface.addIndex('GedShares', ['fileId']);
    await queryInterface.addIndex('GedShares', ['folderId']);
    await queryInterface.addIndex('GedShares', ['shareToken']);
    await queryInterface.addIndex('GedShares', ['sharedWithUserId']);
    await queryInterface.addIndex('GedShares', ['isActive']);

    await queryInterface.addIndex('GedComments', ['fileId']);
    await queryInterface.addIndex('GedComments', ['companyId']);
    await queryInterface.addIndex('GedComments', ['userId']);
    await queryInterface.addIndex('GedComments', ['parentId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GedComments');
    await queryInterface.dropTable('GedShares');
    await queryInterface.dropTable('GedActivityLogs');
    await queryInterface.dropTable('GedFileVersions');
    await queryInterface.dropTable('GedFiles');
    await queryInterface.dropTable('GedFolders');
  }
};
