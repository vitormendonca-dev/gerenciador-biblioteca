import requests

def buscarMusica(termo):
  termo_formatado = termo.replace(' ', '+')
  url = f'https://api.deezer.com/search?q={termo_formatado}'

  try:
    resposta = requests.get(url, timeout=5)
    if resposta.status_code == 200:
      dados = resposta.json()
      musicas_formatadas = []

      # O Deezer guarda os resultados dentro da chave 'data'
      for item in dados.get('data', []):
        musica = {
            'titulo': item.get('title'),
            'artista': item.get('artist', {}).get('name'),
            'capa': item.get('album', {}).get('cover_medium'),
            'preview': item.get('preview'),
            'link': item.get('link'),
        }
        musicas_formatadas.append(musica)

      return musicas_formatadas

    print(f'Deezer respondeu com status: {resposta.status_code}')
    return []
  except Exception as error:
    print(f'ERRO EXATO NO PYTHON: {error}')
    return []