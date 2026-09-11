'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = async tableName => {
      try {
        await queryInterface.describeTable(tableName);
        return true;
      } catch (error) {
        return false;
      }
    };

    const createTableIfMissing = async (tableName, attributes) => {
      if (!(await tableExists(tableName))) {
        await queryInterface.createTable(tableName, attributes);
      }
    };

    const addIndexIfMissing = async (tableName, fields, name) => {
      const indexes = await queryInterface.showIndex(tableName);
      if (!indexes.some(index => index.name === name)) {
        await queryInterface.addIndex(tableName, fields, { name });
      }
    };

    // Tabela de Pastas do GED
    await createTableIfMissing('GedFolders', {
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
    await createTableIfMissing('GedFiles', {
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
    await createTableIfMissing('GedFileVersions', {
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
    await createTableIfMissing('GedActivityLogs', {
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
    await createTableIfMissing('GedShares', {
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
    await createTableIfMissing('GedComments', {
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
    await addIndexIfMissing('GedFolders', ['companyId'], 'ged_folders_company_id');
    await addIndexIfMissing('GedFolders', ['parentId'], 'ged_folders_parent_id');
    await addIndexIfMissing('GedFolders', ['userId'], 'ged_folders_user_id');
    await addIndexIfMissing('GedFolders', ['type'], 'ged_folders_type');
    await addIndexIfMissing('GedFolders', ['clientId'], 'ged_folders_client_id');
    await addIndexIfMissing('GedFolders', ['departmentId'], 'ged_folders_department_id');

    await addIndexIfMissing('GedFiles', ['companyId'], 'ged_files_company_id');
    await addIndexIfMissing('GedFiles', ['folderId'], 'ged_files_folder_id');
    await addIndexIfMissing('GedFiles', ['userId'], 'ged_files_user_id');
    await addIndexIfMissing('GedFiles', ['isDeleted'], 'ged_files_is_deleted');
    await addIndexIfMissing('GedFiles', ['hash'], 'ged_files_hash');
    await addIndexIfMissing('GedFiles', ['name'], 'ged_files_name');

    await addIndexIfMissing('GedFileVersions', ['fileId'], 'ged_file_versions_file_id');
    await addIndexIfMissing('GedFileVersions', ['companyId'], 'ged_file_versions_company_id');
    await addIndexIfMissing('GedFileVersions', ['isCurrent'], 'ged_file_versions_is_current');

    await addIndexIfMissing('GedActivityLogs', ['companyId'], 'ged_activity_logs_company_id');
    await addIndexIfMissing('GedActivityLogs', ['userId'], 'ged_activity_logs_user_id');
    await addIndexIfMissing('GedActivityLogs', ['entityType', 'entityId'], 'ged_activity_logs_entity_type_entity_id');
    await addIndexIfMissing('GedActivityLogs', ['action'], 'ged_activity_logs_action');
    await addIndexIfMissing('GedActivityLogs', ['createdAt'], 'ged_activity_logs_created_at');

    await addIndexIfMissing('GedShares', ['companyId'], 'ged_shares_company_id');
    await addIndexIfMissing('GedShares', ['fileId'], 'ged_shares_file_id');
    await addIndexIfMissing('GedShares', ['folderId'], 'ged_shares_folder_id');
    await addIndexIfMissing('GedShares', ['shareToken'], 'ged_shares_share_token');
    await addIndexIfMissing('GedShares', ['sharedWithUserId'], 'ged_shares_shared_with_user_id');
    await addIndexIfMissing('GedShares', ['isActive'], 'ged_shares_is_active');

    await addIndexIfMissing('GedComments', ['fileId'], 'ged_comments_file_id');
    await addIndexIfMissing('GedComments', ['companyId'], 'ged_comments_company_id');
    await addIndexIfMissing('GedComments', ['userId'], 'ged_comments_user_id');
    await addIndexIfMissing('GedComments', ['parentId'], 'ged_comments_parent_id');
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
