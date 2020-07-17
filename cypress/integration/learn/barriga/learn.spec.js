/// <reference types="cypress"/>

import loc from '../../../support/locators'
import '../../../support/commandsContas'

describe('Barriga', () => {
    describe('Should test at a functional level', () => {
        before(() => {
            cy.login('a@a', 'a')
        })

        beforeEach(() => {
            cy.get(loc.MENU.HOME).click()
            cy.resetApp()
        })

        it('Should create an account', () => {
            cy.acessarMenuConta()
            cy.inserirConta('Conta de teste')
            cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
        })

        it('Should update an account', () => {
            cy.acessarMenuConta()

            cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Conta para alterar')).click()
            cy.get(loc.CONTAS.NOME)
                .clear()
                .type('Conta alterada')
            cy.get(loc.CONTAS.BTN_SALVAR).click()
            cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso')
        })

        it('Should not create an account with same name', () => {
            cy.acessarMenuConta()

            cy.inserirConta('Conta mesmo nome')
            cy.get(loc.MESSAGE).should('contain', 'code 400')
        })

        it('Should create a transaction', () => {
            cy.get(loc.MENU.MOVIMENTACAO).click()

            cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Desc')
            cy.get(loc.MOVIMENTACAO.VALOR).type('123')
            cy.get(loc.MOVIMENTACAO.INTERESSADO).type('Inter')
            cy.get(loc.MOVIMENTACAO.CONTA).select('Conta para movimentacoes')
            cy.get(loc.MOVIMENTACAO.STATUS).click()
            cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
            cy.get(loc.MESSAGE).should('contain', 'sucesso')

            cy.get(loc.EXTRATO.LINHAS).should('have.length', '7')
            cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Desc', '123')).should('exist')
        })

        it('Should get balance', () => {
            cy.get(loc.MENU.HOME).click()
            cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Conta para saldo')).should('contain', '534,00')

            cy.get(loc.MENU.EXTRATO).click()
            cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click()
            // cy.wait(1000)
            cy.get(loc.MOVIMENTACAO.DESCRICAO).should('have.value', 'Movimentacao 1, calculo saldo')
            cy.get(loc.MOVIMENTACAO.STATUS).click()
            cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
            cy.get(loc.MESSAGE).should('contain', 'sucesso')

            cy.get(loc.MENU.HOME).click()
            cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Conta para saldo')).should('contain', '4.034,00')
        })

        it('Should remove a transaction', () => {
            cy.get(loc.MENU.EXTRATO).click()
            cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click()
            cy.get(loc.MESSAGE).should('contain', 'sucesso')
        })
    })

    describe.only('Should test at a backend level', () => {
        before(() => {
            // cy.login('a@a', 'a')
        })

        beforeEach(() => {
            // cy.resetApp()
        })

        it('Should create an account', () => {
            cy.request({
                method: 'POST',
                url: 'https://barrigarest.wcaquino.me/signin',
                body: {
                    email: "a@a",
                    redirecionar: false,
                    senha: "a"
                }
            }).its('body.token').should('not.be.empty')
                .then(token => {
                    cy.request({
                        url: 'https://barrigarest.wcaquino.me/contas',
                        method: 'POST',
                        headers: { Authorization: `JWT ${token}` },
                        body: {
                            nome: "Conta via rest"
                        }
                    }).then(res => console.log)
                })
        })

        it('Should update an account', () => {
        })

        it('Should not create an account with same name', () => {
        })

        it('Should create a transaction', () => {
        })

        it('Should get balance', () => {
        })

        it('Should remove a transaction', () => {
        })
    })
})
