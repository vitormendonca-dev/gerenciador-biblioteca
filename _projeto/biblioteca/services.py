import requests
from django.conf import settings

def buscarLivro(termo):
  termo_formatado = termo.replace(' ', '+')
  url = f'https://openlibrary.org/search.json?q={termo_formatado}'
  
  
  try:
    # Mantém o verify=False caso seja problema de certificado SSL local
    resposta = requests.get(url, timeout=5)
    if resposta.status_code == 200:
      return resposta.json()
    print(f'Google Books respondeu com status: {resposta.status_code}')
    return None
  except Exception as error:
    # Isto vai mostrar o erro exato em letras vermelhas gigantes no terminal!
    print(f'ERRO EXATO NO PYTHON: {error}')
    return None