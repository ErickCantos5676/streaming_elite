const API_KEY = 'd87155296b18362cf48f0fcea81e71a6';
let currentPage = 1;

const ul = document.getElementById('estrenos');
const btnAnterior = document.getElementById('btnAnterior');
const btnSiguiente = document.getElementById('btnSiguiente');

function actualizarBotones() {
  btnAnterior.disabled = currentPage === 1;
  btnAnterior.classList.toggle('bg-gray-400', currentPage === 1);
  btnAnterior.classList.toggle('cursor-not-allowed', currentPage === 1);
  btnAnterior.classList.toggle('bg-indigo-600', currentPage > 1);
  btnAnterior.classList.toggle('hover:bg-indigo-700', currentPage > 1);
}

function cargarPeliculas(page) {
  const API_URL = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=es-ES&page=${page}`;
  ul.innerHTML = '<li class="text-gray-600 italic">Cargando estrenos...</li>';

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      ul.innerHTML = '';

      data.results.slice(0, 5).forEach(peli => {
        const li = document.createElement('li');
        li.className = "border-b pb-6 mb-6";

        const poster = peli.poster_path
          ? `https://image.tmdb.org/t/p/w185${peli.poster_path}`
          : 'https://via.placeholder.com/100x150?text=No+Image';

        li.innerHTML = `
          <div class="flex flex-col md:flex-row gap-4">
            <img src="${poster}" alt="${peli.title}" class="w-32 rounded shadow">
            <div>
              <h3 class="text-xl font-semibold">${peli.title}</h3>
              <p class="text-sm text-gray-500 mb-1">🎬 Estreno: ${peli.release_date}</p>
              <p class="text-sm text-gray-700 mb-2">${peli.overview || "Sin sinopsis disponible."}</p>
              <div class="text-sm italic text-gray-400">Buscando plataformas...</div>
              <div class="mt-2">
                <button class="ver-trailer px-3 py-1 mt-2 text-white bg-blue-600 hover:bg-blue-700 rounded text-sm" data-id="${peli.id}">
                  ▶️ Ver tráiler
                </button>
                <div class="trailer-container mt-2 hidden"></div>
              </div>
            </div>
          </div>
        `;
        ul.appendChild(li);

        // Buscar plataformas
        fetch(`https://api.themoviedb.org/3/movie/${peli.id}/watch/providers?api_key=${API_KEY}`)
          .then(res => res.json())
          .then(provData => {
            const contenedor = li.querySelector('div.text-sm.italic');
            const plataformas = provData.results?.ES?.flatrate || [];

            if (plataformas.length > 0) {
              const logos = plataformas.map(p => `
                <img src="https://image.tmdb.org/t/p/w45${p.logo_path}" 
                     alt="${p.provider_name}" 
                     title="${p.provider_name}" 
                     class="inline-block mx-1 h-6">
              `).join('');
              contenedor.innerHTML = `<span class="text-green-600">Disponible en:</span><div class="mt-1">${logos}</div>`;
            } else {
              contenedor.innerHTML = `<span class="text-red-500">No disponible en plataformas conocidas.</span>`;
            }
          })
          .catch(() => {
            li.querySelector('div.text-sm.italic').innerText = 'Error al cargar plataformas.';
          });
      });

      actualizarBotones();
    })
    .catch(() => {
      ul.innerHTML = '<li class="text-red-600">Error al cargar estrenos.</li>';
    });
}

// Evento para tráileres
ul.addEventListener('click', e => {
  if (e.target.classList.contains('ver-trailer')) {
    const movieId = e.target.dataset.id;
    const container = e.target.nextElementSibling;

    if (!container.classList.contains('hidden')) {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=es-ES`)
      .then(res => res.json())
      .then(data => {
        const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) {
          container.innerHTML = `
            <iframe class="w-full md:w-96 aspect-video rounded shadow"
                    src="https://www.youtube.com/embed/${trailer.key}" 
                    frameborder="0" allowfullscreen></iframe>
          `;
        } else {
          container.innerHTML = '<p class="text-gray-500">Tráiler no disponible.</p>';
        }
        container.classList.remove('hidden');
      })
      .catch(() => {
        container.innerHTML = '<p class="text-red-500">Error al cargar el tráiler.</p>';
        container.classList.remove('hidden');
      });
  }
});

// Botones de navegación
btnSiguiente.addEventListener('click', () => {
  currentPage++;
  cargarPeliculas(currentPage);
});

btnAnterior.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    cargarPeliculas(currentPage);
  }
});

// Cargar primera página
cargarPeliculas(currentPage);
