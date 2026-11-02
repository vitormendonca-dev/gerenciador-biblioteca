from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import index,buscar_livro,pagina_busca,salvar_livro,remover_livro


urlpatterns = [
path('',index, name='home'),     
path ('buscar/', buscar_livro, name='buscar_livro'),
path('api/pesquisa/', pagina_busca, name='api_pesquisa'),
path('api/salvar/', salvar_livro, name='api_salvar'),
path('api/remover/<int:livro_id>/', remover_livro, name='api_remover'),
]