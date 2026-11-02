from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import index, buscar_livro


urlpatterns = [
path('', index, name='index'),    
path('api/buscar/', buscar_livro, name='buscar_livro'),
]