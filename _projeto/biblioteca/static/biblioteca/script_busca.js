const searchInput = document.getElementById('search');
const listContainer = document.getElementById('list');

searchInput.addEventListener('keypress', async function(e) {
    if (e.key === 'Enter') {
        const termo = searchInput.value.trim();

        if (termo.length < 2) return;

        listContainer.innerHTML = '<li style="grid-column: 1 / -1; text-align: center;">Buscando...</li>';

        try {
            const resposta = await fetch(`/api/pesquisa/?termo=${encodeURIComponent(termo)}`); 
            const dados = await resposta.json();

            listContainer.innerHTML = '';

            if (dados.items && dados.items.length > 0) {
                dados.items.forEach(livro => {
                    const info = livro.volumeInfo;
                    const titulo = info.title || 'Título desconhecido';
                    const autor = info.authors ? info.authors.join(', ') : 'Autor desconhecido';
                    const capa = info.imageLinks && info.imageLinks.thumbnail ? info.imageLinks.thumbnail : '';

                    const li = document.createElement('li');
                    li.className = 'card-livro';

                    li.innerHTML = `
                        <div>
                            ${capa 
                                ? `<img src="${capa}" alt="Capa do livro">` 
                                : '<div class="sem-capa-box">Sem capa</div>'
                            }
                            <h4>${titulo}</h4>
                            <p>${autor}</p>
                        </div>
                        <button onclick="salvarLivro('${titulo.replace(/'/g, "\\'")}', '${autor.replace(/'/g, "\\'")}', '${capa}')">Adicionar à Estante</button>
                    `;

                    listContainer.appendChild(li);
                });
            } else {
                listContainer.innerHTML = '<li style="grid-column: 1 / -1; text-align: center;">Nenhum livro encontrado.</li>';
            }
        } catch (erro) {
            console.error('Erro ao buscar os livros:', erro);
            listContainer.innerHTML = '<li style="grid-column: 1 / -1; text-align: center; color: red;">Erro ao buscar livros.</li>';
        }
    }
});

function salvarLivro(titulo, autor, capa) {
    alert(`Em breve: Salvar o livro "${titulo}" no banco de dados!`);
}