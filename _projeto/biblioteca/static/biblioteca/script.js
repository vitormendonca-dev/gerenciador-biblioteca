const API = '/api/livros/';

const $ = (id) => document.getElementById(id);
let livros = [];
let editingId = null;

function showError(msg) {
  $('error').textContent = msg;
  $('error').hidden = !msg;
}

// Transforma a resposta de erro do DRF em texto legível.
// O DRF devolve algo como {"titulo": ["Este campo é obrigatório."]}
function formatError(status, text) {
  try {
    const data = JSON.parse(text);
    if (data && typeof data === 'object') {
      const linhas = Object.entries(data).map(([campo, msgs]) =>
        `${campo}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`);
      return `Erro ${status}\n${linhas.join('\n')}`;
    }
  } catch (e) { /* não era JSON */ }
  return `Erro ${status}`;
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(formatError(res.status, text));
  }
  return res.status === 204 ? null : res.json();
}

async function load() {
  try {
    const data = await api(API);
    // Se você ativar paginação no DRF, a lista vem dentro de "results"
    livros = Array.isArray(data) ? data : data.results || [];
    showError('');
  } catch (e) {
    livros = [];
    showError(e instanceof TypeError
      ? 'Não consegui falar com a API. O servidor Django está rodando?'
      : e.message);
  }
  render();
}

async function run(action) {
  try {
    await action();
    showError('');
    await load();
    return true;
  } catch (e) {
    showError(e instanceof TypeError ? 'Não consegui falar com a API.' : e.message);
    return false;
  }
}

function formData() {
  const body = {
    titulo: $('titulo').value.trim(),
    autor: $('autor').value.trim(),
    isbn: $('isbn').value.trim(),
  };
  const data = $('dataPublicacao').value;
  if (data) body.dataPublicacao = data;
  return JSON.stringify(body);
}

function resetForm() {
  editingId = null;
  $('form').reset();
  $('formTitle').textContent = 'Novo livro';
  $('submitBtn').textContent = 'Adicionar livro';
  $('cancelBtn').hidden = true;
}

function startEdit(livro) {
  editingId = livro.id;
  $('titulo').value = livro.titulo || '';
  $('autor').value = livro.autor || '';
  $('isbn').value = livro.isbn || '';
  $('dataPublicacao').value = livro.dataPublicacao || '';
  $('formTitle').textContent = 'Editar livro';
  $('submitBtn').textContent = 'Salvar alterações';
  $('cancelBtn').hidden = false;
  $('titulo').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  const termo = $('search').value.trim().toLowerCase();
  const visiveis = livros.filter((l) =>
    (l.titulo || '').toLowerCase().includes(termo) ||
    (l.autor || '').toLowerCase().includes(termo));
  const list = $('list');
  list.innerHTML = '';

  if (!visiveis.length) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'msg';
    span.textContent = livros.length
      ? 'Nenhum livro encontrado para essa busca.'
      : 'Nenhum livro ainda. Preencha o formulário acima para adicionar o primeiro.';
    li.appendChild(span);
    list.appendChild(li);
  }

  visiveis.forEach((l) => {
    const li = document.createElement('li');

    const info = document.createElement('div');
    info.className = 'info';
    const titulo = document.createElement('div');
    titulo.className = 'titulo';
    titulo.textContent = l.titulo;
    const detalhe = document.createElement('div');
    detalhe.className = 'detalhe';
    detalhe.textContent = [l.autor, 'ISBN ' + l.isbn, l.dataPublicacao]
      .filter(Boolean).join('  |  ');
    info.appendChild(titulo);
    info.appendChild(detalhe);
    li.appendChild(info);

    const edit = document.createElement('button');
    edit.className = 'small';
    edit.textContent = 'Editar';
    edit.onclick = () => startEdit(l);
    li.appendChild(edit);

    const del = document.createElement('button');
    del.className = 'small danger';
    del.textContent = 'Excluir';
    del.onclick = () => {
      if (!confirm(`Excluir o livro "${l.titulo}"?`)) return;
      if (editingId === l.id) resetForm();
      run(() => api(`${API}${l.id}/`, { method: 'DELETE' }));
    };
    li.appendChild(del);

    list.appendChild(li);
  });

  $('count').textContent = livros.length
    ? `${visiveis.length} de ${livros.length} livros`
    : '';
}

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ok = editingId === null
    ? await run(() => api(API, { method: 'POST', body: formData() }))
    : await run(() => api(`${API}${editingId}/`, { method: 'PUT', body: formData() }));
  if (ok) resetForm();
});

$('cancelBtn').addEventListener('click', resetForm);
$('search').addEventListener('input', render);
load();