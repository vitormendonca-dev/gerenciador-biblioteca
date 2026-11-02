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
    li.className = 'bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group transition-all duration-300 hover:border-slate-700 hover:shadow-xl';

    li.innerHTML = `
        <div class="space-y-3">
            <!-- Capa com Botão Circular Flutuante -->
            <div class="relative overflow-hidden rounded-xl aspect-square bg-slate-800 flex items-center justify-center">
                ${capa ? `<img src="${capa}" alt="Capa" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : '<span class="text-slate-500 text-sm">Sem capa</span>'}
                
                <!-- Botão Circular de Adicionar (Aparece ao passar o rato) -->
                <button type="button" class="absolute bottom-3 right-3 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10" title="Adicionar à Playlist">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            <div>
                <h4 class="font-bold text-slate-100 text-base truncate" title="${titulo}">${titulo}</h4>
                <p class="text-sm text-slate-400 truncate mt-0.5" title="${artista}">${artista}</p>
            </div>

            ${link ? `
                <a href="${link}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    <span>🎵</span> Ouvir música inteira no Deezer
                </a>
            ` : ''}

            <!-- Player de Áudio Compacto -->
            ${preview ? `
                <div class="pt-1">
                    <audio controls src="${preview}" class="w-full h-8 rounded-lg accent-indigo-500 bg-slate-800/60 opacity-80 hover:opacity-100 transition-opacity"></audio>
                </div>
            ` : ''}
        </div>
    `;

    // Atribui o evento de clique corretamente ao botão circular criado
    const botaoAdicionar = li.querySelector('button');
    botaoAdicionar.addEventListener('click', () => salvarMusica(titulo, artista, capa, preview, link));

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

async function removerMusica(id, botaoElemento) {
    if (!confirm('Tem certeza de que deseja remover esta música da playlist?')) return;

    try {
        const resposta = await fetch(`/api/remover/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': obterCookie('csrftoken')
            }
        });

        if (resposta.ok) {
            // Encontra o <li> do cartão e aplica animação de sumir
            const card = botaoElemento.closest('li');
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';

            setTimeout(() => {
                card.remove();

                // Se a lista ficar vazia após remover, mostra a mensagem de playlist vazia
                const lista = document.getElementById('list');
                if (lista && lista.children.length === 0) {
                    window.location.reload();
                }
            }, 300);
        } else {
            alert('Erro ao tentar remover a música.');
        }
    } catch (erro) {
        console.error('Erro ao remover:', erro);
        alert('Erro de conexão ao remover a música.');
    }
}

function criarCardResultado(musica) {
    const li = document.createElement('li');
    li.className = 'bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group transition-all duration-300 hover:border-slate-700 hover:shadow-xl';

    li.innerHTML = `
        <div class="space-y-3">
            <!-- Capa com Botão Circular Flutuante -->
            <div class="relative overflow-hidden rounded-xl aspect-square bg-slate-800 flex items-center justify-center">
                ${musica.capa ? `<img src="${musica.capa}" alt="Capa" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : '<span class="text-slate-500 text-sm">Sem capa</span>'}
                
                <!-- Botão Circular de Adicionar (Aparece no Hover) -->
                <button onclick="salvarMusica('${musica.titulo.replace(/'/g, "\\'")}', '${musica.artista.replace(/'/g, "\\'")}', '${musica.capa}', '${musica.preview}', '${musica.link}')" 
                    class="absolute bottom-3 right-3 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10"
                    title="Adicionar à Playlist">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            <div>
                <h4 class="font-bold text-slate-100 text-base truncate" title="${musica.titulo}">${musica.titulo}</h4>
                <p class="text-sm text-slate-400 truncate mt-0.5" title="${musica.artista}">${musica.artista}</p>
            </div>

            ${musica.link ? `
                <a href="${musica.link}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    <span>🎵</span> Ouvir música inteira no Deezer
                </a>
            ` : ''}

            <!-- Player de Áudio Compacto -->
            ${musica.preview ? `
                <div class="pt-1">
                    <audio controls src="${musica.preview}" class="w-full h-8 rounded-lg accent-indigo-500 bg-slate-800/60 opacity-80 hover:opacity-100 transition-opacity"></audio>
                </div>
            ` : ''}
        </div>
    `;

    return li; 
}

document.addEventListener('DOMContentLoaded', () => {
    executarBusca(''); // Termo vazio traz o "Em Alta"

    const inputBusca = document.getElementById('search');
    if (inputBusca) {
        let timer;
        inputBusca.addEventListener('input', (e) => {
            clearTimeout(timer);
            const termo = e.target.value.trim();

            // Aguarda 300ms antes de fazer a busca em tempo real
            timer = setTimeout(() => {
                executarBusca(termo); // Se apagar tudo, volta a mostrar as em alta
            }, 300);
        });
    }
});


async function executarBusca(termo) {
    try {
        const resposta = await fetch(`/api/pesquisa/?termo=${encodeURIComponent(termo)}`);
        if (!resposta.ok) throw new Error('Erro na busca');
        
        const dados = await resposta.json();
        exibirResultados(dados);
    } catch (erro) {
        console.error('Erro ao buscar músicas:', erro);
    }
}

// Desenha os cartões na grelha com o botão circular flutuante
function exibirResultados(musicas) {
    const listaResultados = document.getElementById('list');
    if (!listaResultados) return;

    listaResultados.innerHTML = '';

    if (!musicas || musicas.length === 0) {
        listaResultados.innerHTML = '<li class="col-span-full text-center text-slate-400 py-10">Nenhuma música encontrada.</li>';
        return;
    }

    musicas.forEach(musica => {
        const titulo = musica.titulo || 'Título desconhecido';
        const artista = musica.artista || 'Artista desconhecido';
        const capa = musica.capa || '';
        const preview = musica.preview || '';
        const link = musica.link || '';

        const li = document.createElement('li');
        li.className = 'bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group transition-all duration-300 hover:border-slate-700 hover:shadow-xl';

        li.innerHTML = `
            <div class="space-y-3">
                <!-- Capa com Botão Circular Flutuante -->
                <div class="relative overflow-hidden rounded-xl aspect-square bg-slate-800 flex items-center justify-center">
                    ${capa ? `<img src="${capa}" alt="Capa" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : '<span class="text-slate-500 text-sm">Sem capa</span>'}
                    
                    <!-- Botão Circular de Adicionar -->
                    <button type="button" class="absolute bottom-3 right-3 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10" title="Adicionar à Playlist">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                <div>
                    <h4 class="font-bold text-slate-100 text-base truncate" title="${titulo}">${titulo}</h4>
                    <p class="text-sm text-slate-400 truncate mt-0.5" title="${artista}">${artista}</p>
                </div>

                ${link ? `
                    <a href="${link}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        🎵 Ouvir música inteira no Deezer
                    </a>
                ` : ''}

                ${preview ? `
                    <div class="pt-1">
                        <audio controls src="${preview}" class="w-full h-8 rounded-lg accent-indigo-500 bg-slate-800/60 opacity-80 hover:opacity-100 transition-opacity"></audio>
                    </div>
                ` : ''}
            </div>
        `;

        // Evento de clique para salvar a música ao clicar no botão circular
        const botaoAdicionar = li.querySelector('button');
        botaoAdicionar.addEventListener('click', () => salvarMusica(titulo, artista, capa, preview, link));

        listaResultados.appendChild(li);
    });
}