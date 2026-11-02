from rest_framework import status
from django.shortcuts import render
from .services import buscarMusica
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Musica
from .serializeres import  MusicaSerializer
import json
import requests

def home(request):
    return render(request, 'biblioteca/index.html')

def playlist(request):
    musicas = Musica.objects.all()
    return render(request, 'biblioteca/playlist.html', {'musicas': musicas})

def buscar_musica(request):
    return render(request, 'biblioteca/pagina_busca.html')      

#api de busca de musicas
# API de busca de músicas
@api_view(['GET'])
def pagina_busca(request):
  termo = request.GET.get('termo', '').strip()

  if termo:
    resultado = buscarMusica(termo)
  else:
    # 1. Puxa 50 músicas do Chart principal do Deezer
    url_chart = 'https://api.deezer.com/chart/0/tracks?limit=50'
    response_chart = requests.get(url_chart)
    
    # 2. Puxa também um lote de músicas populares de uma busca geral para enriquecer
    url_mix = 'https://api.deezer.com/search?q=hits&limit=50'
    response_mix = requests.get(url_mix)

    resultado = []
    vistos = set() # Para evitar músicas repetidas

    # Processa o chart
    if response_chart.status_code == 200:
      for item in response_chart.json().get('data', []):
        titulo = item.get('title')
        if titulo not in vistos:
          vistos.add(titulo)
          resultado.append({
              'titulo': titulo,
              'artista': item.get('artist', {}).get('name'),
              'capa': item.get('album', {}).get('cover_medium'),
              'preview': item.get('preview'),
              'link': item.get('link'),
          })

    # Processa o mix de hits
    if response_mix.status_code == 200:
      for item in response_mix.json().get('data', []):
        titulo = item.get('title')
        if titulo not in vistos:
          vistos.add(titulo)
          resultado.append({
              'titulo': titulo,
              'artista': item.get('artist', {}).get('name'),
              'capa': item.get('album', {}).get('cover_medium'),
              'preview': item.get('preview'),
              'link': item.get('link'),
          })

  if resultado is not None:
    return Response(resultado)

  return Response({'error': 'Erro ao buscar a música'}, status=500)
#api de salvar música

@api_view(['POST'])
def salvar_musica(request):
    data = json.loads(request.body)
    titulo = data.get('titulo')
    preview = data.get('preview')
    link = data.get('link')
    if Musica.objects.filter(titulo=titulo).exists():
        return Response({'error': 'Música já existe'}, status=400)
    serializer = MusicaSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#deletar música
@api_view(['DELETE'])
def remover_musica(request, musica_id):
    try:
        musica = Musica.objects.get(id=musica_id)
        musica.delete()
        return Response({'message': 'Música removida com sucesso'}, status=200)
    except Musica.DoesNotExist:
        return Response({'error': 'Música não encontrada'}, status=404)
    

