const searchInput = document.getElementById('search');
const listContainer = document.getElementById('list');

function mostrarMensagem(texto, erro = false) {
    listContainer.innerHTML = '';
    const li = document.createElement('li');
    li.style.gridColumn = '1 / -1';
    li.style.textAlign = 'center';
    if (erro) li.style.color = 'red';
    li.textContent = texto;
    listContainer.appendChild(li);
}

function criarCard(musica) {
    const titulo = musica.titulo || 'Título desconhecido';
    const artista = musica.artista || 'Artista desconhecido';
    const capa = musica.capa || '';
    const preview = musica.preview || '';
    const link = musica.link || '';

    const li = document.createElement('li');
    li.className = 'card-livro'; // Podes manter a classe do CSS para aproveitar o estilo do cartão

    const div = document.createElement('div');

    if (capa) {
        const img = document.createElement('img');
        img.src = capa;
        img.alt = 'Capa da musica';
        div.appendChild(img);
    } else {
        const semCapa = document.createElement('div');
        semCapa.className = 'sem-capa-box';
        semCapa.textContent = 'Sem capa';
        div.appendChild(semCapa);
    }

    const h4 = document.createElement('h4');
    h4.textContent = titulo;
    div.appendChild(h4);

    const p = document.createElement('p');
    p.textContent = artista;
    div.appendChild(p);

    if(preview) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = preview;
        audio.style.width = '100%';
        audio.style.marginTop = '10px';
        div.appendChild(audio);
    }

    const botao = document.createElement('button');
    botao.textContent = 'Adicionar à Playlist';
    botao.addEventListener('click', () => salvarMusica(titulo, artista, capa, preview, link));

    li.appendChild(div);
    li.appendChild(botao);

    return li;
}

async function buscar(termo, atualizarUrl = true) {
    if (atualizarUrl) {
        const params = new URLSearchParams({ termo });
        history.pushState({}, '', `?${params}`);
    }

    mostrarMensagem('Buscando...');

    try {
        const resposta = await fetch(`/api/pesquisa/?termo=${encodeURIComponent(termo)}`);
        if (!resposta.ok) throw new Error('Falha na busca');
        const dados = await resposta.json();

        // Verifica se 'dados' é uma lista (array) e se tem itens
        if (Array.isArray(dados) && dados.length > 0) {
            listContainer.innerHTML = '';
            dados.forEach(musica => {
                listContainer.appendChild(criarCard(musica));
            });
        } else {
            mostrarMensagem('Nenhuma música encontrada.');
        }
    } catch (erro) {
        console.error('Erro ao buscar as músicas:', erro);
        mostrarMensagem('Erro ao buscar músicas.', true);
    }
}

// Busca ao apertar Enter
searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const termo = searchInput.value.trim();
        if (termo.length < 2) return;
        buscar(termo);
    }
});

window.addEventListener('popstate', () => {
    const termo = new URLSearchParams(window.location.search).get('termo') || '';
    searchInput.value = termo;
    if (termo.length >= 2) {
        buscar(termo, false);
    } else {
        listContainer.innerHTML = '';
    }
});

const termoDaUrl = new URLSearchParams(window.location.search).get('termo');
if (termoDaUrl && termoDaUrl.length >= 2) {
    searchInput.value = termoDaUrl;
    buscar(termoDaUrl, false);
}

async function salvarMusica(titulo, artista, capa, preview,link) {
    try {
        const resposta = await fetch('/api/salvar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': obterCookie('csrftoken') 
            },
            body: JSON.stringify({ titulo, artista, capa, preview, link})
        });

        const resultado = await resposta.json();
        
        if (resposta.ok) {
            alert(`Sucesso: "${titulo}" foi adicionado à tua Playlist!`);
        } else {
            alert(`Erro ao salvar: ${resultado.mensagem}`);
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert('Erro de conexão ao tentar salvar a música.');
    }
}

function obterCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function removerMusica(id) {
    try {
        const resposta = await fetch(`/api/remover/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': obterCookie('csrftoken') 
            }
        });
        if (resposta.ok) {
            window.location.reload();
        } else {
            alert('Erro ao remover a música. Por favor, tente novamente.');
        }

    } catch (erro) {
        console.error('Erro:', erro);
    }
}