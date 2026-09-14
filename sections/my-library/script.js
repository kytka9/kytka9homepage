// 1. Pri inicializácii premennej zotriedime pole podľa názvu (A-Z)
let currentData = [...booksData];
let sortDirection = {};

// Pomocná funkcia na odstránenie diakritiky z textu
function removeDiacritics(str) {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
}

// Pomocná funkcia na abecedné zotriedenie kníh
function sortBooksAlphabetically(arr) {
    return arr.sort((a, b) => 
        a.title.localeCompare(b.title, 'sk', { sensitivity: 'base' })
    );
}

// Inicializácia aplikácie
document.addEventListener("DOMContentLoaded", () => {
    // 2. Zotriedime hlavné dáta aj aktuálny výber abecedne podľa názvu
    sortBooksAlphabetically(booksData);
    currentData = [...booksData];

    // 3. Nastavíme stav ikony zoraďovania pre Názov na 'asc' (▲)
    sortDirection['title'] = 'asc';
    const activeIcon = document.getElementById('sort-title');
    if (activeIcon) {
        activeIcon.textContent = '▲';
    }

    populateFilters();
    renderTable(currentData);
    
    // Pridanie Event Listenerov...
    document.getElementById('search-input').addEventListener('input', filterData);
    document.getElementById('filter-category').addEventListener('change', filterData);
    document.getElementById('filter-language').addEventListener('change', filterData);
    document.getElementById('filter-binding').addEventListener('change', filterData);
    document.getElementById('btn-reset').addEventListener('click', resetFilters);
});

function populateFilters() {
    const categories = new Set();
    const languages = new Set();
    const bindings = new Set();

    booksData.forEach(book => {
        if (book.category) categories.add(book.category);
        if (book.language) languages.add(book.language);
        if (book.binding) bindings.add(book.binding);
    });

    populateSelect('filter-category', categories);
    populateSelect('filter-language', languages);
    populateSelect('filter-binding', bindings);
}

function populateSelect(elementId, uniqueValues) {
    const select = document.getElementById(elementId);
    Array.from(uniqueValues).sort().forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
    });
}

function renderTable(data) {
    const body = document.getElementById('books-body');
    body.innerHTML = '';

    data.forEach(book => {
        const tr = document.createElement('tr');

        // Poznámky badge
        let notesBadge = '';
        if (book.notes === 'poškodená') {
            notesBadge = `<span class="badge badge-damage">${book.notes}</span>`;
        } else if (book.notes) {
            notesBadge = `<span class="badge badge-fixed">${book.notes}</span>`;
        }

        // Väzba badge
        const bindingBadge = book.binding === 'brožovaná' 
            ? `<span class="badge badge-soft">${book.binding}</span>` 
            : `<span class="badge badge-fixed">${book.binding}</span>`;

        tr.innerHTML = `
            <td><strong>${book.title}</strong></td>
            <td>${book.titleEn || '-'}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td style="text-align: right;">${book.year || '-'}</td>
            <td>${book.publisher}</td>
            <td>${book.category}</td>
            <td>${book.language}</td>
            <td style="text-align: right; font-weight: bold;">${book.pageCount || '-'}</td>
            <td>${bindingBadge}</td>
            <td>${notesBadge}</td>
        `;
        body.appendChild(tr);
    });

    // Aktualizácia pätičky a štatistík
    const totalPagesSelected = data.reduce((sum, book) => sum + (Number(book.pageCount) || 0), 0);
    const totalPagesAll = booksData.reduce((sum, book) => sum + (Number(book.pageCount) || 0), 0);

    document.getElementById('stats-counter').textContent = `Celkom kníh: ${booksData.length} | Celkom strán: ${totalPagesAll}`;
    document.getElementById('rendered-count').textContent = `Zobrazené: ${data.length} z ${booksData.length} | Súčet strán výberu: ${totalPagesSelected}`;
}

function filterData() {
    const rawSearchVal = document.getElementById('search-input').value;
    const searchVal = removeDiacritics(rawSearchVal);

    const categoryVal = document.getElementById('filter-category').value;
    const languageVal = document.getElementById('filter-language').value;
    const bindingVal = document.getElementById('filter-binding').value;

    currentData = booksData.filter(book => {
        const matchesSearch = 
            removeDiacritics(book.title).includes(searchVal) ||
            removeDiacritics(book.titleEn).includes(searchVal) ||
            removeDiacritics(book.author).includes(searchVal) ||
            removeDiacritics(book.isbn).includes(searchVal) ||
            removeDiacritics(book.publisher).includes(searchVal);

        const matchesCategory = !categoryVal || book.category === categoryVal;
        const matchesLanguage = !languageVal || book.language === languageVal;
        const matchesBinding = !bindingVal || book.binding === bindingVal;

        return matchesSearch && matchesCategory && matchesLanguage && matchesBinding;
    });

    renderTable(currentData);
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-language').value = '';
    document.getElementById('filter-binding').value = '';
    
    filterData();
}

function sortTable(column) {
    // Prepínanie smeru zoraďovania (asc/desc)
    if (!sortDirection[column] || sortDirection[column] === 'desc') {
        sortDirection[column] = 'asc';
    } else {
        sortDirection[column] = 'desc';
    }

    // Reset ikoniek zoraďovania
    const icons = document.querySelectorAll('.sort-icon');
    icons.forEach(icon => icon.textContent = '↕');

    // Nastavenie aktívnej ikonky
    const activeIcon = document.getElementById(`sort-${column}`);
    if (activeIcon) {
        activeIcon.textContent = sortDirection[column] === 'asc' ? '▲' : '▼';
    }

    // Zoraďovacia logika
    currentData.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Číselné stĺpce
        if (column === 'year' || column === 'pageCount') {
            valA = Number(valA) || 0;
            valB = Number(valB) || 0;
        } else {
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection[column] === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection[column] === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable(currentData);
}