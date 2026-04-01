const API_URL = 'http://localhost:5087/movies';

// READ: Cargar películas al iniciar
async function loadMovies() {
    try {
        const res = await fetch(API_URL);
        const movies = await res.json();
        renderMovies(movies);
    } catch (err) {
        console.error("Error cargando BD:", err);
    }
}

function renderMovies(movies) {
    const list = document.getElementById('movieList');
    const counter = document.getElementById('counter');

    // --- Lógica del contador ---
    const total = movies.length;
    const watchedCount = movies.filter(m => m.watched).length;
    const pendingCount = total - watchedCount;

    if (total === 0) {
        counter.innerHTML = "No hay pelis aún. ¡Agrega una!";
    } else {
        counter.innerHTML = `Total: ${total} | Vistas: ${watchedCount} | Pendientes: ${pendingCount}`;
    }

    // --- Dibujar la lista ---
    list.innerHTML = '';

    if (total === 0) {
        list.innerHTML = '<p style="text-align:center; color:#999;">Vacío...</p>';
        return; 
    }

    movies.forEach(m => {
        list.innerHTML += `
            <div class="movie-item">
                <div class="movie-info">
                    <input type="checkbox" ${m.watched ? 'checked' : ''} 
                           onchange="toggleWatched(${m.id}, '${m.title}', ${m.watched})">
                    <span class="movie-title ${m.watched ? 'completed' : ''}">${m.title}</span>
                </div>
                <button class="btn-delete" onclick="deleteMovie(${m.id})">🗑️</button>
            </div>`;
    });
}

// CREATE: Añadir nueva
async function addMovie() {
    const input = document.getElementById('movieTitle');
    if (!input.value.trim()) return;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.value, watched: false })
    });
    
    input.value = '';
    loadMovies();

    Swal.fire({
        icon: 'success',
        title: '¡Añadida!',
        text: 'Película guardada en el backlog',
        showConfirmButton: false,
        timer: 1500,
        width: '300px',
        padding: '2em',
        color: '#716add',
        backdrop: `rgba(0,0,123,0.1)`
    });
}

// UPDATE: Cambiar estado Vista/Pendiente
async function toggleWatched(id, title, currentStatus) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, title: title, watched: !currentStatus })
    });
    loadMovies();
}

// DELETE: Eliminar con SweetAlert
async function deleteMovie(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#6200ee',
        cancelButtonColor: '#cf6679',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                Swal.fire({
                    title: '¡Borrada!',
                    text: 'La película ha sido eliminada.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                loadMovies();
            } catch (err) {
                Swal.fire('Error', 'No se pudo borrar la peli', 'error');
            }
        }
    });
}

// Ejecutar al cargar la página
loadMovies();