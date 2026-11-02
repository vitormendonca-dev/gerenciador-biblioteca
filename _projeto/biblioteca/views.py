from django.shortcuts import render
from .services import buscarLivro
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Livro
from .serializeres import LivroSerializer
import json


def index(request):
    livros = Livro.objects.all()
    return render(request, 'biblioteca/index.html', {'livros': livros})

def buscar_livro(request):
    return render(request, 'biblioteca/pagina_busca.html')      

#api de busca de livros
@api_view(['GET'])
def pagina_busca(request):
    termo = request.GET.get('termo', '')
    if termo:
        resultado = buscarLivro(termo)
        if resultado:
            return Response(resultado)
        
        return Response({'error': 'Erro ao buscar o livro'}, status=500)
    
    else:
        return Response({'error': 'Termo de busca não fornecido'}, status=400)

#api de salvar livro

@api_view(['POST'])
def salvar_livro(request):
    data = json.loads(request.body)
    titulo = data.get('titulo')
    if Livro.objects.filter(titulo=titulo).exists():
        return Response({'error': 'Livro já existe'}, status=400)
    serializer = LivroSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

#deletar livro
@api_view(['DELETE'])
def remover_livro(request, livro_id):
    try:
        livro = Livro.objects.get(id=livro_id)
        livro.delete()
        return Response({'message': 'Livro removido com sucesso'}, status=200)
    except Livro.DoesNotExist:
        return Response({'error': 'Livro não encontrado'}, status=404)
    

