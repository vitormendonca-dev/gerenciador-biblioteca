from rest_framework import status
from django.shortcuts import render
from .services import buscarMusica
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Musica
from .serializeres import  MusicaSerializer
import json


def index(request):
    musicas = Musica.objects.all()
    return render(request, 'biblioteca/index.html', {'musicas': musicas})

def buscar_musica(request):
    return render(request, 'biblioteca/pagina_busca.html')      

#api de busca de musicas
@api_view(['GET'])
def pagina_busca(request):
    termo = request.GET.get('termo', '')
    if termo:
        resultado = buscarMusica(termo)
        if resultado:
            return Response(resultado)
        
        return Response({'error': 'Erro ao buscar a música'}, status=500)
    
    else:
        return Response({'error': 'Termo de busca não fornecido'}, status=400)

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
    

