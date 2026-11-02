from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import index,buscar_musica,pagina_busca,salvar_musica,remover_musica


urlpatterns = [
path('',index, name='home'),     
path ('buscar/', buscar_musica, name='buscar_musica'),
path('api/pesquisa/', pagina_busca, name='api_pesquisa'),
path('api/salvar/', salvar_musica, name='api_salvar'),
path('api/remover/<int:musica_id>/', remover_musica, name='api_remover'),
]