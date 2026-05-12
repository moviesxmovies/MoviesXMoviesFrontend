
Cypress.Commands.add('acceptCookies', () => {
    cy.get('body').then(($body) => {
        if ($body.find('.iubenda-cs-accept-btn').length > 0) {
            cy.get('.iubenda-cs-accept-btn').click();
        }
    });
});

declare global {
    namespace Cypress {
        interface Chainable {
            acceptCookies(): Chainable<void>;
        }
    }
}