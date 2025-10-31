const getPokemonUrl = id => `https://pokeapi.co/api/v2/pokemon/${id}`
const totalPokemons = 151
const pokemonsPerPage = 20
let allPokemons = []
let currentPage = 1

// Busca todos os Pokémon da Pokédex
const fetchAllPokemons = async () => {
  const promises = Array(totalPokemons).fill().map((_, index) =>
    fetch(getPokemonUrl(index + 1)).then(res => res.json())
  )
  allPokemons = await Promise.all(promises)
  renderPage()
}

// Gera o HTML dos cards
const generateHTML = pokemons => {
  return pokemons.reduce((acc, { name, id, types }) => {
    const elementTypes = types.map(t => t.type.name)
    acc += `
      <li class="card ${elementTypes[0]}">
        <img class="card-image" alt="${name}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png" />
        <h2 class="card-title">${id}. ${name}</h2>
        <p class="card-subtitle">${elementTypes.join(" | ")}</p>
      </li>
    `
    return acc
  }, "")
}

// Insere os cards na página
const insertPokemonsIntoPage = html => {
  const ul = document.querySelector('[data-js="pokedex"]')
  ul.innerHTML = html
  attachCardClickEvents()
}

// Adiciona som ao clicar nos cards
const playSound = () => {
  const audio = new Audio('https://play.pokemonshowdown.com/audio/cries/pikachu.mp3')
  audio.play()
}

const attachCardClickEvents = () => {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', playSound)
  })
}

// Filtra por tipo
const filterByType = (list) => {
  const type = document.getElementById('typeFilter').value
  if (!type) return list
  return list.filter(p => p.types.some(t => t.type.name === type))
}

// Renderiza a página atual
const renderPage = () => {
  const start = (currentPage - 1) * pokemonsPerPage
  const end = start + pokemonsPerPage
  const filtered = filterByType(allPokemons)
  const paginated = filtered.slice(start, end)
  const html = generateHTML(paginated)
  insertPokemonsIntoPage(html)
  document.getElementById('pageIndicator').textContent = `Página ${currentPage}`
}

// Busca por nome ou número
const searchPokemon = async () => {
  const input = document.getElementById('searchInput').value.trim().toLowerCase()
  if (!input) return
  try {
    const res = await fetch(getPokemonUrl(input))
    if (!res.ok) throw new Error('Pokémon não encontrado')
    const pokemon = await res.json()
    const html = generateHTML([pokemon])
    insertPokemonsIntoPage(html)
    document.getElementById('pageIndicator').textContent = `Resultado da busca`
  } catch (err) {
    insertPokemonsIntoPage(`<li class="card"><p>${err.message}</p></li>`)
  }
}

// Eventos
document.getElementById('searchButton').addEventListener('click', searchPokemon)
document.getElementById('resetButton').addEventListener('click', () => {
  currentPage = 1
  renderPage()
})
document.getElementById('typeFilter').addEventListener('change', () => {
  currentPage = 1
  renderPage()
})
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--
    renderPage()
  }
})
document.getElementById('nextPage').addEventListener('click', () => {
  const filtered = filterByType(allPokemons)
  const maxPage = Math.ceil(filtered.length / pokemonsPerPage)
  if (currentPage < maxPage) {
    currentPage++
    renderPage()
  }
})

// Inicialização
fetchAllPokemons()


