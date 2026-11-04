Gerenciador de Musicas

Playlist pessoal de músicas desenvolvida para praticar Django e a integração com APIs externas. O sistema busca músicas na API do Deezer, mostra capa, artista e uma prévia em áudio, e permite salvar as favoritas no banco de dados e removê-las depois. O front-end consome o backend usando fetch.

Sobre o desenvolvimento: o front-end foi gerado com auxílio de IA (Claude), já que o foco deste projeto era praticar o backend e a integração com uma API externa. O backend, em Django, foi desenvolvido por mim.

Funcionalidades
Buscar músicas por título ou artista (consulta feita pelo backend na API do Deezer)
Ouvir a prévia da música direto na página
Salvar músicas na playlist (banco de dados SQLite)
Listar a playlist com capa, título e artista
Remover músicas da playlist
Termo da busca na URL (/buscar/?termo=...), para recarregar ou compartilhar
Tecnologias
Python 3
Django
Django REST Framework
Requests (consulta à API do Deezer)
SQLite
HTML, CSS e JavaScript (front-end)
Como rodar
Clone o repositório e entre na pasta do projeto.
Crie e ative um ambiente virtual:
   python -m venv .venv
   source .venv/Scripts/activate
Instale as dependências:
   pip install django djangorestframework requests
Entre na pasta que contém o manage.py e crie o banco de dados:
   python manage.py migrate
Inicie o servidor:
   python manage.py runserver
Abra http://127.0.0.1:8000 no navegador.
Estrutura do projeto
Minha-Playlist/
├── manage.py
├── _projeto/              # Configurações do Django
│   ├── settings.py
│   └── urls.py
└── biblioteca/            # App principal
    ├── models.py          # Tabela de músicas
    ├── serializers.py     # Conversão para JSON e validação
    ├── services.py        # Consulta à API do Deezer (requests)
    ├── views.py           # Páginas e rotas da API
    ├── urls.py            # Rotas do app
    ├── templates/
    │   └── biblioteca/
    │       ├── index.html          # Playlist salva
    │       └── pagina_busca.html   # Busca de músicas
    └── static/
        └── biblioteca/
            ├── playlist.css
            ├── script_playlist.js  # Remover músicas
            └── script_busca.js     # Busca e resultados
Rotas
Método	Rota	Descrição
GET	/	Página da playlist
GET	/buscar/	Página de busca
GET	/api/pesquisa/?termo=...	Busca músicas na API do Deezer
POST	/api/musicas/	Salva uma música na playlist
DELETE	/api/musicas/<id>/	Remove uma música da playlist
Exemplo de música
json
{
  "id": 1,
  "titulo": "Nome da música",
  "artista": "Nome do artista",
  "capa": "https://...",
  "preview": "https://...",
  "link": "https://..."
}
