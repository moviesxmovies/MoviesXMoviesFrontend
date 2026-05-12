describe('welcome page tests', () => {
  it('presses cookie continue button', () => {
    cy.visit('/')
    cy.get('.iubenda-cs-accept-btn').click()
  })
  beforeEach(() => {
    cy.clearLocalStorage()
  })
  it('change lang to langs', () => {
    cy.visit('/')
    // ES
    cy.get('.p-select-dropdown').click()
    cy.get('#pv_id_0_0').click()
    cy.get('.signup-label').should('contain.text', '¡Bienvenido a MoviesXMovies!')
    cy.get('html').should('have.attr', 'lang', 'es')
    // EN
    cy.get('.p-select-dropdown').click()
    cy.get('#pv_id_0_1').click()
    cy.get('.signup-label').should('contain.text', 'Welcome to MoviesXMovies')
    cy.get('html').should('have.attr', 'lang', 'en')

    // FR
    cy.get('.p-select-dropdown').click()
    cy.get('#pv_id_0_2').click()
    cy.get('.signup-label').should('contain.text', 'Bienvenue sur MoviesXMovies !')
    cy.get('html').should('have.attr', 'lang', 'fr')


    // DE
    cy.get('.p-select-dropdown').click()
    cy.get('#pv_id_0_3').click()
    cy.get('.signup-label').should('contain.text', 'Willkommen bei MoviesXMovies!')
    cy.get('html').should('have.attr', 'lang', 'de')
  })

  it('change theme to dark', () => {
    cy.visit('/')
    cy.get('.theme-btn').click()
    cy.get('html').should('not.have.class', 'dark')

    cy.get('.theme-btn').click()
    cy.get('html').should('have.class', 'dark')
  })

  it('change theme to light', () => {
    cy.visit('/')
    cy.get('.theme-btn').click()

    cy.get('html').should('not.have.class', 'dark')
  })

  it('signup button without email', () => {
    cy.visit('/')
    cy.acceptCookies()
    cy.get('.btn-signup').click()
    cy.get('.email-input').should('have.class', 'email-input--error')
  })

  it('signup button with email', () => {
    cy.visit('/')
    cy.acceptCookies()
    cy.get('.email-input').type('example@email.com')
    cy.get('.btn-signup').click()
    cy.url().should('include', '/signup')
  })

  it('login button', () => {
    cy.visit('/')
    cy.acceptCookies()
    cy.get('.btn-ghost').click()
    cy.url().should('include', '/login')
  })

  it('google oauth button', () => {
    cy.visit('/')
    cy.acceptCookies()
    cy.get('[aria-label="Sign in with Google"]').click()
    cy.url().should('include', '/signin/oauth/')
  })

  it('go to search page no auth', () => {
    cy.visit('/')
    cy.acceptCookies()
    cy.get('#search-btn').click()
    cy.url().should('include', '/login')
  })
})
