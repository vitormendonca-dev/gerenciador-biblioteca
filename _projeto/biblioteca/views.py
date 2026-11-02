from django.shortcuts import render
from .services import buscarLivro
from rest_framework.decorators import api_view
from rest_framework.response import Response

def index(request):
    return render(request, 'biblioteca/index.html')


@api_view(['GET'])
def buscar_livro(request):
    termo = request.GET.get('termo', '')
    if termo:
        resultado = buscarLivro(termo)
        if resultado:
            return Response(resultado)
        
        return Response({'error': 'Erro ao buscar o livro'}, status=500)
    
    else:
        return Response({'error': 'Termo de busca não fornecido'}, status=400)

