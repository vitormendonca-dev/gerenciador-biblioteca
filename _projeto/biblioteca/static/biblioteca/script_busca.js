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


function criarCard(livro) {
    const titulo = livro.title || 'Título desconhecido';
    const autor = livro.author_name ? livro.author_name.join(', ') : 'Autor desconhecido';
    const capa = livro.cover_i
        ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
        : '';

    const li = document.createElement('li');
    li.className = 'card-livro';

    const div = document.createElement('div');

    if (capa) {
        const img = document.createElement('img');
        img.src = capa;
        img.alt = 'Capa do livro';
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
    p.textContent = autor;
    div.appendChild(p);

    const botao = document.createElement('button');
    botao.textContent = 'Adicionar à Estante';
    botao.addEventListener('click', () => salvarLivro(titulo, autor, capa));

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

        if (dados.docs && dados.docs.length > 0) {
            listContainer.innerHTML = '';
            dados.docs.forEach(livro => {
                listContainer.appendChild(criarCard(livro));
            });
        } else {
            mostrarMensagem('Nenhum livro encontrado.');
        }
    } catch (erro) {
        console.error('Erro ao buscar os livros:', erro);
        mostrarMensagem('Erro ao buscar livros.', true);
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

function salvarLivro(titulo, autor, capa) {
    alert(`Em breve: Salvar o livro "${titulo}" no banco de dados!`);
}