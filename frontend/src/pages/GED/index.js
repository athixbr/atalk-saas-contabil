import React, { useState, useEffect, useCallback, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Chip,
  InputAdornment,
  Box,
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import {
  CloudUpload as UploadIcon,
  CreateNewFolder as NewFolderIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GetApp as DownloadIcon,
  FileCopy as CopyIcon,
  DriveFileMove as MoveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Home as HomeIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
} from "@material-ui/icons";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";
import FilePreviewDialog from "./FilePreviewDialog";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  breadcrumbs: {
    marginBottom: theme.spacing(2),
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  searchField: {
    minWidth: 300,
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  actionsBar: {
    display: "flex",
    gap: theme.spacing(1),
  },
  uploadZone: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    backgroundColor: theme.palette.background.default,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.dark,
    },
    "&.active": {
      backgroundColor: theme.palette.primary.light,
      borderColor: theme.palette.primary.dark,
    },
  },
  uploadIcon: {
    fontSize: 64,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  gridView: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  folderCard: {
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[8],
    },
  },
  fileCard: {
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[8],
    },
  },
  cardContent: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  folderIcon: {
    fontSize: 64,
    color: theme.palette.primary.main,
  },
  fileIcon: {
    fontSize: 64,
  },
  fileImage: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
  },
  fileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  fileSize: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  listView: {
    marginTop: theme.spacing(2),
  },
  listItem: {
    backgroundColor: theme.palette.background.paper,
    marginBottom: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(8),
    color: theme.palette.text.secondary,
  },
  favoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    color: theme.palette.warning.main,
  },
  statsBar: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  statChip: {
    fontWeight: 500,
  },
  tagChip: {
    margin: theme.spacing(0.5),
  },
}));

// Função para obter ícone por extensão
const getFileIcon = (extension, mimeType) => {
  const ext = extension?.toLowerCase();
  
  // Imagens
  if (mimeType?.startsWith("image/")) {
    return { icon: "🖼️", color: "#4CAF50" };
  }
  
  // PDFs
  if (ext === "pdf") {
    return { icon: "📄", color: "#F44336" };
  }
  
  // Word
  if (["doc", "docx"].includes(ext)) {
    return { icon: "📝", color: "#2196F3" };
  }
  
  // Excel
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return { icon: "📊", color: "#4CAF50" };
  }
  
  // PowerPoint
  if (["ppt", "pptx"].includes(ext)) {
    return { icon: "📊", color: "#FF9800" };
  }
  
  // Compactados
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return { icon: "📦", color: "#9C27B0" };
  }
  
  // Vídeos
  if (mimeType?.startsWith("video/") || ["mp4", "avi", "mkv", "mov"].includes(ext)) {
    return { icon: "🎥", color: "#E91E63" };
  }
  
  // Áudios
  if (mimeType?.startsWith("audio/") || ["mp3", "wav", "ogg"].includes(ext)) {
    return { icon: "🎵", color: "#9C27B0" };
  }
  
  // Textos
  if (["txt", "md", "log"].includes(ext)) {
    return { icon: "📃", color: "#607D8B" };
  }
  
  // Código
  if (["js", "ts", "jsx", "tsx", "html", "css", "php", "py", "java"].includes(ext)) {
    return { icon: "💻", color: "#009688" };
  }
  
  // XML/JSON
  if (["xml", "json", "yaml"].includes(ext)) {
    return { icon: "🔧", color: "#FF5722" };
  }
  
  return { icon: "📄", color: "#757575" };
};

// Função para formatar tamanho de arquivo
const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const GED = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  // Estados principais
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid ou list
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInContent, setSearchInContent] = useState(false);

  // Estados de modals
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [editFolderDialog, setEditFolderDialog] = useState(false);
  const [editFileDialog, setEditFileDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Estados temporários
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null); // 'folder' ou 'file'
  const [anchorEl, setAnchorEl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Dropzone config
  const onDrop = useCallback(async (acceptedFiles) => {
    if (!currentFolder && !folders.length) {
      toast.error("Crie uma pasta primeiro!");
      return;
    }

    const folderId = currentFolder?.id || folders[0]?.id;
    if (!folderId) {
      toast.error("Selecione uma pasta!");
      return;
    }

    await handleUpload(acceptedFiles, folderId);
  }, [currentFolder, folders]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: uploadDialog === false,
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [currentFolder]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar pastas (não carregar durante busca)
      if (!searchTerm) {
        const foldersRes = await api.get("/ged/folders", {
          params: {
            parentId: currentFolder?.id || null,
          },
        });
        setFolders(foldersRes.data);
      } else {
        setFolders([]);
      }

      // Carregar arquivos
      if (currentFolder || searchTerm) {
        const filesRes = await api.get("/ged/files", {
          params: {
            folderId: searchTerm ? undefined : currentFolder?.id,
            search: searchTerm || undefined,
            searchInContent: searchInContent && searchTerm ? true : undefined,
          },
        });
        setFiles(filesRes.data.files || filesRes.data || []);
      } else {
        setFiles([]);
      }

      // Carregar breadcrumb
      if (currentFolder && !searchTerm) {
        const breadcrumbRes = await api.get(`/ged/folders/${currentFolder.id}/breadcrumb`);
        setBreadcrumb(breadcrumbRes.data);
      } else {
        setBreadcrumb([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Função de busca
  const handleSearch = () => {
    loadData();
  };

  // Limpar busca
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchInContent(false);
    loadData();
  };

  // Criar pasta
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Digite um nome para a pasta");
      return;
    }

    try {
      await api.post("/ged/folders", {
        name: folderName,
        parentId: currentFolder?.id || null,
        description: folderDescription,
        type: "custom",
        isPublic: true,
      });

      toast.success("Pasta criada com sucesso!");
      setNewFolderDialog(false);
      setFolderName("");
      setFolderDescription("");
      loadData();
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
      toast.error(error.response?.data?.message || "Erro ao criar pasta");
    }
  };

  // Upload de arquivos
  const handleUpload = async (files, folderId) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("folderId", folderId);

    try {
      await api.post("/ged/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      setUploadDialog(false);
      loadData();
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error(error.response?.data?.message || "Erro ao fazer upload");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Abrir pasta
  const handleOpenFolder = (folder) => {
    setCurrentFolder(folder);
    setSearchTerm("");
  };

  // Voltar para pasta anterior
  const handleGoToFolder = (folder) => {
    if (folder) {
      setCurrentFolder(folder);
    } else {
      setCurrentFolder(null);
    }
  };

  // Download de arquivo
  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/ged/files/${file.id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao fazer download");
    }
  };

  // Abrir pré-visualização
  const handleOpenPreview = (file) => {
    setPreviewFile(file);
    setPreviewDialog(true);
  };

  const handleClosePreview = () => {
    setPreviewDialog(false);
    setPreviewFile(null);
  };

  // Favoritar arquivo
  const handleToggleFavorite = async (file) => {
    try {
      await api.post(`/ged/files/${file.id}/favorite`);
      loadData();
      toast.success(file.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
    } catch (error) {
      console.error("Erro ao favoritar:", error);
      toast.error("Erro ao favoritar arquivo");
    }
  };

  // Deletar item
  const handleDelete = async () => {
    try {
      if (selectedItemType === "folder") {
        await api.delete(`/ged/folders/${selectedItem.id}`);
        toast.success("Pasta deletada com sucesso!");
      } else {
        await api.delete(`/ged/files/${selectedItem.id}`);
        toast.success("Arquivo movido para lixeira!");
      }

      setConfirmDeleteDialog(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error(error.response?.data?.message || "Erro ao deletar");
    }
  };

  // Menu de contexto
  const handleOpenMenu = (event, item, type) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    setSelectedItemType(type);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>GED - Gestão Eletrônica de Documentos</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<NewFolderIcon />}
            onClick={() => setNewFolderDialog(true)}
          >
            Nova Pasta
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialog(true)}
            disabled={!currentFolder && folders.length === 0}
          >
            Enviar Arquivos
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper}>
        {/* Breadcrumbs */}
        <Breadcrumbs className={classes.breadcrumbs}>
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleGoToFolder(null);
            }}
            style={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon style={{ marginRight: 4 }} />
            Início
          </Link>
          {breadcrumb.map((folder) => (
            <Link
              key={folder.id}
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleGoToFolder(folder);
              }}
            >
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>

        {/* Barra superior */}
        <div className={classes.topBar}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <TextField
              className={classes.searchField}
              placeholder="Buscar arquivos e pastas..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={!searchTerm}
            >
              Buscar
            </Button>
            {searchTerm && (
              <Button variant="outlined" onClick={handleClearSearch}>
                Limpar
              </Button>
            )}
          </Box>

          <div className={classes.actionsBar}>
            <Tooltip title="Visualização em Grade">
              <IconButton
                color={viewMode === "grid" ? "primary" : "default"}
                onClick={() => setViewMode("grid")}
              >
                <GridViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Visualização em Lista">
              <IconButton
                color={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
              >
                <ListViewIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Estatísticas e opções de busca */}
        <div className={classes.statsBar}>
          <Chip
            label={`${folders.length} pasta(s)`}
            color="primary"
            variant="outlined"
            className={classes.statChip}
          />
          <Chip
            label={`${files.length} arquivo(s)`}
            color="secondary"
            variant="outlined"
            className={classes.statChip}
          />
          {searchTerm && (
            <Chip
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  <input
                    type="checkbox"
                    checked={searchInContent}
                    onChange={(e) => setSearchInContent(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  Buscar dentro dos arquivos
                </Box>
              }
              variant="outlined"
              onClick={() => {
                setSearchInContent(!searchInContent);
                if (searchTerm) {
                  setTimeout(handleSearch, 100);
                }
              }}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <Box display="flex" justifyContent="center" padding={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {viewMode === "grid" ? (
              // Visualização em grade
              <div className={classes.gridView}>
                {/* Pastas */}
                {folders.map((folder) => (
                  <Card
                    key={`folder-${folder.id}`}
                    className={classes.folderCard}
                    onClick={() => handleOpenFolder(folder)}
                  >
                    <CardContent className={classes.cardContent}>
                      <FolderIcon className={classes.folderIcon} />
                      <Typography className={classes.fileName} title={folder.name}>
                        {folder.name}
                      </Typography>
                      <Typography className={classes.fileSize}>
                        {folder.fileCount || 0} arquivo(s)
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, folder, "folder")}
                      >
                        <MoreIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}

                {/* Arquivos */}
                {files.map((file) => {
                  const fileInfo = getFileIcon(file.extension, file.mimeType);
                  return (
                    <Card
                      key={`file-${file.id}`}
                      className={classes.fileCard}
                      onClick={() => handleOpenPreview(file)}
                    >
                      <CardContent className={classes.cardContent}>
                        {file.isFavorite && (
                          <StarIcon className={classes.favoriteIcon} fontSize="small" />
                        )}
                        {file.thumbnailPath ? (
                          <img
                            src={`${process.env.REACT_APP_BACKEND_URL}/${file.thumbnailPath}`}
                            alt={file.name}
                            className={classes.fileImage}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: 64 }}>{fileInfo.icon}</div>
                        )}
                        <Typography className={classes.fileName} title={file.originalName}>
                          {file.name}
                        </Typography>
                        <Typography className={classes.fileSize}>
                          {formatFileSize(file.size)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMenu(e, file, "file");
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // Visualização em lista
              <List className={classes.listView}>
                {/* Pastas */}
                {folders.map((folder) => (
                  <ListItem
                    key={`folder-${folder.id}`}
                    className={classes.listItem}
                    button
                    onClick={() => handleOpenFolder(folder)}
                  >
                    <ListItemIcon>
                      <FolderIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={`${folder.fileCount || 0} arquivo(s)`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleOpenMenu(e, folder, "folder")}
                      >
                        <MoreIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}

                {/* Arquivos */}
                {files.map((file) => {
                  const fileInfo = getFileIcon(file.extension, file.mimeType);
                  return (
                    <ListItem
                      key={`file-${file.id}`}
                      className={classes.listItem}
                      button
                      onClick={() => handleOpenPreview(file)}
                    >
                      <ListItemIcon>
                        <div style={{ fontSize: 32 }}>{fileInfo.icon}</div>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {file.originalName}
                            {file.isFavorite && (
                              <StarIcon fontSize="small" color="action" />
                            )}
                          </Box>
                        }
                        secondary={`${formatFileSize(file.size)} • ${format(
                          new Date(file.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => handleOpenMenu(e, file, "file")}
                        >
                          <MoreIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )}

            {/* Estado vazio */}
            {folders.length === 0 && files.length === 0 && !loading && (
              <div className={classes.emptyState}>
                <FolderOpenIcon style={{ fontSize: 80, marginBottom: 16 }} />
                <Typography variant="h6">Nenhum item encontrado</Typography>
                <Typography variant="body2">
                  {currentFolder
                    ? "Esta pasta está vazia"
                    : "Crie uma pasta para começar a organizar seus arquivos"}
                </Typography>
              </div>
            )}
          </>
        )}

        {/* Menu de contexto */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          {selectedItemType === "file" && (
            <>
              <MenuItem
                onClick={() => {
                  handleDownload(selectedItem);
                  handleCloseMenu();
                }}
              >
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Download" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleToggleFavorite(selectedItem);
                  handleCloseMenu();
                }}
              >
                <ListItemIcon>
                  {selectedItem?.isFavorite ? (
                    <StarBorderIcon fontSize="small" />
                  ) : (
                    <StarIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={selectedItem?.isFavorite ? "Desfavoritar" : "Favoritar"}
                />
              </MenuItem>
              <Divider />
            </>
          )}
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setConfirmDeleteDialog(true);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Deletar" />
          </MenuItem>
        </Menu>

        {/* Dialog de nova pasta */}
        <Dialog open={newFolderDialog} onClose={() => setNewFolderDialog(false)}>
          <DialogTitle>Nova Pasta</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nome da Pasta"
              fullWidth
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Descrição (opcional)"
              fullWidth
              multiline
              rows={3}
              value={folderDescription}
              onChange={(e) => setFolderDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewFolderDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreateFolder} color="primary" variant="contained">
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de upload */}
        <Dialog
          open={uploadDialog}
          onClose={() => !uploading && setUploadDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Enviar Arquivos</DialogTitle>
          <DialogContent>
            {currentFolder && (
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Enviando para: <strong>{currentFolder.name}</strong>
                </Typography>
              </Box>
            )}
            <div
              {...getRootProps()}
              className={`${classes.uploadZone} ${isDragActive ? "active" : ""}`}
            >
              <input {...getInputProps()} />
              <UploadIcon className={classes.uploadIcon} />
              <Typography variant="h6">
                {isDragActive
                  ? "Solte os arquivos aqui..."
                  : "Arraste arquivos ou clique para selecionar"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Suporta qualquer tipo de arquivo
              </Typography>
            </div>
            {uploading && (
              <Box mt={2}>
                <CircularProgress variant="determinate" value={uploadProgress} />
                <Typography align="center">{uploadProgress}%</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialog(false)} disabled={uploading}>
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmação de exclusão */}
        <ConfirmationModal
          title={`Deletar ${selectedItemType === "folder" ? "Pasta" : "Arquivo"}`}
          open={confirmDeleteDialog}
          onClose={() => setConfirmDeleteDialog(false)}
          onConfirm={handleDelete}
        >
          Tem certeza que deseja deletar{" "}
          <strong>{selectedItem?.name || selectedItem?.originalName}</strong>?
          {selectedItemType === "file" && (
            <>
              <br />
              <br />
              O arquivo será movido para a lixeira e poderá ser recuperado nos próximos 30
              dias.
            </>
          )}
        </ConfirmationModal>

        {/* Preview Dialog */}
        <FilePreviewDialog
          open={previewDialog}
          onClose={handleClosePreview}
          file={previewFile}
        />
      </Paper>
    </MainContainer>
  );
};

export default GED;
