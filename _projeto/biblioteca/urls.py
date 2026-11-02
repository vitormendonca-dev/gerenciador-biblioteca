from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import playlist,buscar_musica,pagina_busca,salvar_musica,remover_musica,home


urlpatterns = [
path('', home, name='home'),
path('playlist/',playlist, name='playlist'),
path ('buscar/', buscar_musica, name='buscar_musica'),
path('api/pesquisa/', pagina_busca, name='api_pesquisa'),
path('api/salvar/', salvar_musica, name='api_salvar'),
path('api/remover/<int:musica_id>/', remover_musica, name='api_remover'),
]