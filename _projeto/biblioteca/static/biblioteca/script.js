const API = '/api/buscar/';

const searchInput = document.getElementById('search');
const listContainer = document.getElementById('list');

// Ouve o que o utilizador está a escrever na barra de pesquisa
searchInput.addEventListener('input', async function(e) {
    const termo = e.target.value.trim();

    // Se o texto tiver menos de 2 letras, limpa a lista e não faz nada
    if (termo.length < 2) {
        listContainer.innerHTML = '';
        return;
    }

    try {
        const resposta = await fetch(`/api/buscar/?termo=${encodeURIComponent(termo)}`);
        const dados = await resposta.json();

        // Limpa os resultados anteriores da tela
        listContainer.innerHTML = '';

        // Verifica se o Google/Django retornou livros com sucesso
        if (dados.items && dados.items.length > 0) {
            dados.items.forEach(livro => {
                const info = livro.volumeInfo;
                const titulo = info.title || 'Título desconhecido';
                const autor = info.authors ? info.authors.join(', ') : 'Autor desconhecido';
                
                // Pega o link da capa (se existir)
                const capa = info.imageLinks && info.imageLinks.thumbnail 
                    ? info.imageLinks.thumbnail 
                    : '';

                // Cria o elemento visual para cada livro encontrado
                const li = document.createElement('li');
                li.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);";
                
                li.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        ${capa ? `<img src="${capa}" alt="Capa" style="width: 50px; height: 75px; object-fit: cover; border-radius: 4px;">` : '<div style="width:50px; height:75px; background:#ddd; display:flex; align-items:center; justify-content:center; font-size:10px; color:#666;">Sem capa</div>'}
                        <div>
                            <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${titulo}</h4>
                            <p style="margin: 0; font-size: 14px; color: #666;">${autor}</p>
                        </div>
                    </div>
                    <button class="primary" style="padding: 6px 12px; cursor: pointer;" onclick="alert('Funcionalidade de guardar em breve!')">Adicionar</button>
                `;

                listContainer.appendChild(li);
            });
        } else {
            listContainer.innerHTML = '<li style="padding: 10px; color: #666;">Nenhum livro encontrado.</li>';
        }

    } catch (erro) {
        console.error('Erro ao buscar os livros:', erro);
    }
});