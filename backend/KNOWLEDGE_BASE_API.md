# Base de Conhecimento - API Documentation

## Visão Geral

A Base de Conhecimento é um sistema interno tipo wiki que permite aos usuários criar, organizar e compartilhar tutoriais, artigos e documentação com texto, imagens e vídeos.

## Estrutura do Banco de Dados

### Tabelas Criadas

1. **KnowledgeBaseCategories** - Categorias para organizar artigos
2. **KnowledgeBaseArticles** - Artigos/tutoriais
3. **KnowledgeBaseAttachments** - Anexos (imagens, vídeos, documentos)
4. **KnowledgeBaseVideos** - Links de vídeos externos (YouTube, Vimeo)
5. **KnowledgeBaseTags** - Tags para categorização
6. **KnowledgeBaseArticleTags** - Relacionamento artigos-tags
7. **KnowledgeBaseComments** - Comentários nos artigos
8. **KnowledgeBaseRatings** - Avaliações dos artigos

## Endpoints da API

### Categorias

#### Listar Categorias
```
GET /knowledge-base/categories
Query Params: searchParam, pageNumber
Response: { categories: [], count: number, hasMore: boolean }
```

#### Criar Categoria
```
POST /knowledge-base/categories
Body: {
  name: string (obrigatório),
  description: string,
  parentId: number,
  icon: string,
  color: string,
  order: number
}
Response: categoria criada
```

#### Visualizar Categoria
```
GET /knowledge-base/categories/:categoryId
Response: categoria com detalhes completos
```

#### Atualizar Categoria
```
PUT /knowledge-base/categories/:categoryId
Body: campos a atualizar
Response: categoria atualizada
```

#### Deletar Categoria
```
DELETE /knowledge-base/categories/:categoryId
Response: { message: "Category deleted" }
Nota: Não permite deletar se houver artigos ou subcategorias
```

### Artigos

#### Listar Artigos
```
GET /knowledge-base/articles
Query Params: 
  - searchParam: string
  - pageNumber: number
  - categoryId: number
  - status: "draft" | "published" | "archived"
  - userId: number
  - featured: boolean
Response: { articles: [], count: number, hasMore: boolean }
```

#### Buscar Artigos
```
GET /knowledge-base/articles/search
Query Params: 
  - q: string (obrigatório)
  - categoryId: number
Response: { articles: [] }
```

#### Artigos em Destaque
```
GET /knowledge-base/articles/featured
Response: { articles: [] }
```

#### Criar Artigo
```
POST /knowledge-base/articles
Body: {
  title: string (obrigatório),
  content: string (obrigatório),
  summary: string,
  categoryId: number,
  status: "draft" | "published" | "archived",
  featured: boolean,
  tags: string[],
  videos: [{
    videoUrl: string,
    videoType: "youtube" | "vimeo" | "direct",
    thumbnail: string,
    title: string,
    order: number
  }]
}
Response: artigo criado com relacionamentos
```

#### Visualizar Artigo
```
GET /knowledge-base/articles/:articleId
Response: artigo completo com:
  - categoria
  - autor
  - tags
  - anexos
  - vídeos
  - comentários
```

#### Atualizar Artigo
```
PUT /knowledge-base/articles/:articleId
Body: campos a atualizar
Response: artigo atualizado
```

#### Deletar Artigo
```
DELETE /knowledge-base/articles/:articleId
Response: { message: "Article deleted" }
Nota: Remove também os arquivos físicos dos anexos
```

#### Incrementar Visualizações
```
POST /knowledge-base/articles/:articleId/view
Response: { message: "View incremented" }
```

### Anexos (Arquivos)

#### Listar Anexos
```
GET /knowledge-base/articles/:articleId/attachments
Response: { attachments: [] }
```

#### Upload de Arquivo
```
POST /knowledge-base/articles/:articleId/attachments
Content-Type: multipart/form-data
Body: file (arquivo)
Tipos aceitos:
  - Imagens: jpeg, jpg, png, gif, webp
  - Vídeos: mp4, webm, ogg
  - Documentos: pdf, doc, docx, xls, xlsx
Tamanho máximo: 50MB
Response: attachment criado
```

#### Deletar Anexo
```
DELETE /knowledge-base/attachments/:attachmentId
Response: { message: "Attachment deleted" }
Nota: Remove o arquivo físico também
```

### Vídeos (Links Externos)

#### Listar Vídeos
```
GET /knowledge-base/articles/:articleId/videos
Response: { videos: [] }
```

#### Adicionar Vídeo
```
POST /knowledge-base/articles/:articleId/videos
Body: {
  videoUrl: string (obrigatório),
  videoType: "youtube" | "vimeo" | "direct",
  thumbnail: string,
  title: string,
  order: number
}
Response: vídeo criado
```

#### Deletar Vídeo
```
DELETE /knowledge-base/videos/:videoId
Response: { message: "Video deleted" }
```

## Recursos Implementados

### Backend ✅
- ✅ 8 Migrations criadas e executadas
- ✅ 8 Models com relacionamentos
- ✅ 4 Controllers (Category, Article, Attachment, Video)
- ✅ 20+ Services para lógica de negócio
- ✅ Rotas REST configuradas
- ✅ Upload de arquivos com Multer
- ✅ Validações e tratamento de erros
- ✅ WebSocket para atualizações em tempo real
- ✅ Busca full-text
- ✅ Sistema de tags
- ✅ Contador de visualizações
- ✅ Artigos em destaque
- ✅ Suporte a categorias aninhadas

### Segurança
- Autenticação obrigatória (isAuth middleware)
- Validação de empresa (companyId)
- Validação de tipos de arquivo
- Limite de tamanho de arquivo (50MB)
- Slugs únicos para URLs amigáveis

### Armazenamento
- Arquivos salvos em: `/public/knowledge-base/articles/:articleId/`
- Organização automática por artigo
- Limpeza automática ao deletar artigos

## Próximos Passos

### Frontend (a implementar)
1. Página de listagem de categorias
2. Página de listagem de artigos
3. Visualizador de artigos com suporte a:
   - Renderização de HTML/Markdown
   - Galeria de imagens
   - Embed de vídeos do YouTube
   - Download de anexos
4. Editor de artigos com:
   - Editor WYSIWYG (Rich Text)
   - Upload de imagens (drag & drop)
   - Adicionar vídeos do YouTube
   - Gerenciar tags
   - Pré-visualização
5. Gerenciamento de categorias (Admin)
6. Sistema de busca
7. Comentários (opcional)
8. Avaliações (opcional)

## Exemplo de Uso

### Criar um artigo completo
```javascript
POST /knowledge-base/articles
{
  "title": "Como cadastrar produto com NCM no Domínio",
  "content": "<h1>Tutorial Completo</h1><p>Passo a passo...</p>",
  "summary": "Aprenda a cadastrar produtos com NCM",
  "categoryId": 1,
  "status": "published",
  "featured": true,
  "tags": ["tutorial", "domínio", "ncm", "produtos"],
  "videos": [{
    "videoUrl": "https://www.youtube.com/watch?v=xxxxx",
    "videoType": "youtube",
    "title": "Vídeo explicativo NCM"
  }]
}
```

### Fazer upload de imagem
```javascript
POST /knowledge-base/articles/1/attachments
Content-Type: multipart/form-data
file: [arquivo de imagem]
```

## Status da Implementação

- ✅ Banco de dados estruturado e criado
- ✅ Backend completo funcionando
- ⏳ Frontend (próxima etapa)

Todas as tabelas foram criadas com sucesso no banco de dados e a API está pronta para uso!
