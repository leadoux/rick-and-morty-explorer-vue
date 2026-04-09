const graphQlFixture = (req: Cypress.Request) => {
  const query = String(req.body.query ?? '')

  if (query.includes('query Characters')) {
    req.reply({
      data: {
        characters: {
          info: { count: 1, pages: 1, next: null, prev: null },
          results: [
            {
              id: '1',
              name: 'Rick Sanchez',
              status: 'Alive',
              species: 'Human',
              gender: 'Male',
              image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
              type: '',
              origin: { id: '1', name: 'Earth (C-137)' },
              location: { id: '3', name: 'Citadel of Ricks' },
            },
            {
              id: '2',
              name: 'Morty Smith',
              status: 'Alive',
              species: 'Human',
              gender: 'Male',
              image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
              type: '',
              origin: { id: '1', name: 'Earth (C-137)' },
              location: { id: '20', name: 'Earth (Replacement Dimension)' },
            },
          ],
        },
      },
    })
    return
  }

  if (query.includes('query Episodes')) {
    req.reply({
      data: {
        episodes: {
          info: { count: 1, pages: 1, next: null, prev: null },
          results: [
            {
              id: '1',
              name: 'Pilot',
              air_date: 'December 2, 2013',
              episode: 'S01E01',
              characters: [{ id: '1', name: 'Rick Sanchez' }],
            },
          ],
        },
      },
    })
    return
  }

  if (query.includes('query Locations')) {
    req.reply({
      data: {
        locations: {
          info: { count: 1, pages: 1, next: null, prev: null },
          results: [
            {
              id: '20',
              name: 'Earth (Replacement Dimension)',
              type: 'Planet',
              dimension: 'Replacement Dimension',
              residents: [{ id: '1', name: 'Rick Sanchez' }],
            },
          ],
        },
      },
    })
    return
  }

  if (query.includes('query GlobalSearch')) {
    req.reply({
      data: {
        characters: {
          results: [
            {
              id: '1',
              name: 'Rick Sanchez',
              image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
              status: 'Alive',
              species: 'Human',
            },
          ],
        },
        episodes: {
          results: [{ id: '1', name: 'Pilot', episode: 'S01E01', air_date: 'December 2, 2013' }],
        },
        locations: {
          results: [
            {
              id: '20',
              name: 'Earth (Replacement Dimension)',
              type: 'Planet',
              dimension: 'Replacement Dimension',
            },
          ],
        },
      },
    })
  }
}

describe('Rick and Morty Explorer smoke tests', () => {
  beforeEach(() => {
    cy.intercept('POST', 'https://rickandmortyapi.com/graphql', graphQlFixture)
  })

  it('shows global search results', () => {
    cy.visit('/characters')
    cy.get('input[aria-label="Search characters, episodes and locations"]').type('Rick')
    cy.contains('Characters')
    cy.contains('Rick Sanchez')
  })

  it('syncs filters to URL query parameters', () => {
    cy.visit('/characters')
    cy.get('input[placeholder="Name"]').type('Rick')
    cy.url().should('include', 'name=Rick')
  })

  it('persists favorites across reload', () => {
    cy.visit('/characters')
    cy.contains('button', 'Favorite').first().click()
    cy.visit('/favorites')
    cy.contains('Rick Sanchez')
    cy.reload()
    cy.contains('Rick Sanchez')
  })

  it('supports compare workflow', () => {
    cy.visit('/characters')
    cy.contains('button', 'Compare').first().click()
    cy.visit('/compare')
    cy.contains('Add two characters to start comparing.')
  })

  it('persists dark mode preference', () => {
    cy.visit('/characters')
    cy.document()
      .its('documentElement.dataset.theme')
      .then((initialTheme) => {
        cy.contains('button', /mode/).click()
        cy.document()
          .its('documentElement.dataset.theme')
          .then((toggledTheme) => {
            expect(toggledTheme).not.to.eq(initialTheme)
            cy.reload()
            cy.document().its('documentElement.dataset.theme').should('eq', toggledTheme)
          })
      })
  })
})
