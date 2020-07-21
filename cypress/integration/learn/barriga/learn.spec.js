/// <reference types='cypress'/>

import loc from '../../../support/locators'
import '../../../support/commandsContas'
import buildEnv from '../../../support/buildEnv'

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

    describe('Should test at a backend level', () => {
        // let token

        before(() => {
            cy.getToken('a@a', 'a')
            // .then(tkn => {
            //     token = tkn
            // })
        })

        beforeEach(() => {
            cy.resetRest()
        })

        it('Should create an account', () => {
            cy.request({
                url: '/contas',
                method: 'POST',
                // headers: { Authorization: `JWT ${token}` },
                body: {
                    nome: 'Conta via rest'
                }
            }).as('response')

            cy.get('@response').then(res => {
                expect(res.status).be.equal(201)
                expect(res.body).have.property(id)
                expect(res.body).have.property('nome', 'Conta via rest')
            })
        })

        it('Should update an account', () => {
            cy.getContaByName('Conta para alterar')
                .then(contaId => {
                    cy.request({
                        url: `/contas/${contaId}`,
                        method: 'PUT',
                        // headers: { Authorization: `JWT ${token}` },
                        body: {
                            nome: 'Conta alterada via rest'
                        }
                    }).as('response')
                })
            cy.get('@response').its(status).should('be.equal', 200)
        })

        it('Should not create an account with same name', () => {
            cy.request({
                url: '/contas',
                method: 'POST',
                // headers: { Authorization: `JWT ${token}` },
                body: {
                    nome: 'Conta mesmo nome'
                },
                failOnStatusCode: false
            }).as('response')

            cy.get('@response').then(res => {
                expect(res.status).be.equal(400)
                expect(res.body.error).be.equal('Já existe uma conta com esse nome!')
            })
        })

        it('Should create a transaction', () => {
            cy.getContaByName('Conta para movimentacoes')
                .then(contaId => {
                    cy.request({
                        url: '/transacoes',
                        method: 'POST',
                        // headers: { Authorization: `JWT ${token}` },
                        body: {
                            conta_id: contaId,
                            data_pagamento: Cypress.moment().add({ days: 1 }).format('DD/MM/YYYY'),
                            data_transacao: Cypress.moment().format('DD/MM/YYYY'),
                            descricao: 'desc',
                            envolvido: 'inter',
                            status: true,
                            tipo: 'REC',
                            valor: '123'
                        }
                    }).as('response')
                })

            cy.get('@response').its(status).should('be.equal', 201)
            cy.get('@response').its('body.id').should('exist')
        })

        it('Should get balance', () => {
            cy.request({
                url: '/saldo',
                method: 'GET',
                // headers: { Authorization: `JWT ${token}` }
            }).then(res => {
                let saldoConta = null
                res.body.forEach(c => {
                    if (c.conta === 'Conta para saldo') saldoConta = c.saldo
                })
                expect(saldoConta).be.equal('534.00')
            })

            cy.request({
                method: 'GET',
                url: '/transacoes',
                // headers: { Authorization: `JWT ${token}` },
                qs: { descricao: 'Movimentacao 1, calculo saldo' }
            }).then(res => {
                cy.request({
                    url: `/transacoes/${res.body[0].id}`,
                    method: 'PUT',
                    // headers: { Authorization: `JWT ${token}` },
                    body: {
                        status: true,
                        data_transacao: Cypress.moment(res.body[0].data_transacao).format('DD/MM/YYYY'),
                        data_pagamento: Cypress.moment(res.body[0].data_pagamento).format('DD/MM/YYYY'),
                        descricao: res.body[0].descricao,
                        envolvido: res.body[0].envolvido,
                        valor: res.body[0].valor,
                        conta_id: res.body[0].conta_id
                    }
                }).its(status).should('be.equal', 200)
            })

            cy.request({
                url: '/saldo',
                method: 'GET',
                // headers: { Authorization: `JWT ${token}` }
            }).then(res => {
                let saldoConta = null
                res.body.forEach(c => {
                    if (c.conta === 'Conta para saldo') saldoConta = c.saldo
                })
                expect(saldoConta).be.equal('4034.00')
            })
        })

        it('Should remove a transaction', () => {
            cy.request({
                method: 'GET',
                url: '/transacoes',
                // headers: { Authorization: `JWT ${token}` },
                qs: { descricao: 'Movimentacao para exclusao' }
            }).then(res => {
                cy.request({
                    url: `/transacoes/${res.body[0].id}`,
                    method: 'DELETE',
                    // headers: { Authorization: `JWT ${token}` }
                }).its(status).should('be.equal', 204)
            })
        })
    })

    describe.only('Should test at a frontend level', () => {
        after(() => {
            cy.clearLocalStorage()
        })

        before(() => {
            buildEnv()
            cy.login('a@a', 'senha errada')
        })

        beforeEach(() => {
            buildEnv()
            cy.get(loc.MENU.HOME).click()
            // cy.resetApp()
        })

        it('Should test the responsiveness', () => {
            cy.get('[data-test=menu-home]').should('exist')
                .and('be.visible')
            cy.viewport(500, 700)
            cy.get('[data-test=menu-home]').should('exist')
                .and('be.not.visible')
            cy.viewport('iphone-5')
            cy.get('[data-test=menu-home]').should('exist')
                .and('be.not.visible')
            cy.viewport('ipad-2')
            cy.get('[data-test=menu-home]').should('exist')
                .and('be.visible')
        })

        it('Should create an account', () => {
            cy.route({
                method: 'POST',
                url: '/contas',
                response: { id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1 }
            }).as('saveConta')

            cy.acessarMenuConta()

            cy.route({
                method: 'GET',
                url: '/contas',
                response: [
                    { id: 1, nome: 'Carteira', visivel: true, usuario_id: 1 },
                    { id: 2, nome: 'Banco', visivel: true, usuario_id: 1 },
                    { id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1 },
                ]
            }).as('contasSave')

            cy.inserirConta('Conta de teste')
            cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
        })

        it('Should update an account', () => {
            cy.route({
                method: 'PUT',
                url: '/contas/**',
                response: { id: 1, nome: 'Conta alterada', visivel: true, usuario_id: 1 }
            })

            // cy.get(':nth-child(7) > :nth-child(2) > .fa-edit')
            cy.acessarMenuConta()

            cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Banco')).click()
            cy.get(loc.CONTAS.NOME)
                .clear()
                .type('Conta alterada')
            cy.get(loc.CONTAS.BTN_SALVAR).click()
            cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso')
        })

        it('Should not create an account with same name', () => {
            cy.route({
                method: 'POST',
                url: '/contas',
                response: { 'error': 'Já existe uma conta com esse nome!' },
                status: 400
            }).as('saveContaMesmoNome')

            cy.acessarMenuConta()

            cy.get(loc.CONTAS.NOME).type('Conta mesmo nome')
            cy.get(loc.CONTAS.BTN_SALVAR).click()
            cy.get(loc.MESSAGE).should('contain', 'code 400')
        })

        it('Should create a transaction', () => {
            cy.route({
                method: 'POST',
                url: '/transacoes',
                response: { id: 31433, descricao: 'asdasd', envolvido: 'sdfsdfs', observacao: null, tipo: 'DESP', data_transacao: '2019-11-13T03:00:00.000Z', data_pagamento: '2019-11-13T03:00:00.000Z', valor: '232.00', status: false, conta_id: 42069, usuario_id: 1, transferencia_id: null, parcelamento_id: null }
            })

            cy.route({
                method: 'GET',
                url: '/extrato/**',
                response: 'fixture:movimentacaoSalva'
            })

            cy.get(loc.MENU.MOVIMENTACAO).click();

            cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Desc')
            cy.get(loc.MOVIMENTACAO.VALOR).type('123')
            cy.get(loc.MOVIMENTACAO.INTERESSADO).type('Inter')
            cy.get(loc.MOVIMENTACAO.CONTA).select('Banco')
            cy.get(loc.MOVIMENTACAO.STATUS).click()
            cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
            cy.get(loc.MESSAGE).should('contain', 'sucesso')

            cy.get(loc.EXTRATO.LINHAS).should('have.length', 7)
            cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Desc', '123')).should('exist')
        })

        it('Should get balance', () => {
            cy.route({
                method: 'GET',
                url: '/transacoes/**',
                response: {
                    conta: 'Conta para saldo',
                    id: 31436,
                    descricao: 'Movimentacao 1, calculo saldo',
                    envolvido: 'CCC',
                    observacao: null,
                    tipo: 'REC',
                    data_transacao: '2019-11-13T03:00:00.000Z',
                    data_pagamento: '2019-11-13T03:00:00.000Z',
                    valor: '3500.00',
                    status: false,
                    conta_id: 42079,
                    usuario_id: 1,
                    transferencia_id: null,
                    parcelamento_id: null
                }
            })

            cy.route({
                method: 'PUT',
                url: '/transacoes/**',
                response: {
                    conta: 'Conta para saldo',
                    id: 31436,
                    descricao: 'Movimentacao 1, calculo saldo',
                    envolvido: 'CCC',
                    observacao: null,
                    tipo: 'REC',
                    data_transacao: '2019-11-13T03:00:00.000Z',
                    data_pagamento: '2019-11-13T03:00:00.000Z',
                    valor: '3500.00',
                    status: false,
                    conta_id: 42079,
                    usuario_id: 1,
                    transferencia_id: null,
                    parcelamento_id: null
                }
            })

            cy.get(loc.MENU.HOME).click()
            cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '100,00')

            cy.get(loc.MENU.EXTRATO).click()
            cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click()
            // cy.wait(1000)
            cy.get(loc.MOVIMENTACAO.DESCRICAO).should('have.value', 'Movimentacao 1, calculo saldo')
            cy.get(loc.MOVIMENTACAO.STATUS).click()
            cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
            cy.get(loc.MESSAGE).should('contain', 'sucesso')

            cy.route({
                method: 'GET',
                url: '/saldo',
                response: [{
                    conta_id: 999,
                    conta: 'Carteira',
                    saldo: '4034.00'
                },
                {
                    conta_id: 9909,
                    conta: 'Banco',
                    saldo: '10000000.00'
                },
                ]
            }).as('saldoFinal')

            cy.get(loc.MENU.HOME).click()
            cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '4.034,00')
        })

        it('Should remove a transaction', () => {
            cy.route({
                method: 'DELETE',
                url: '/transacoes/**',
                response: {},
                status: 204
            }).as('del')

            cy.get(loc.MENU.EXTRATO).click()
            cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click()
            cy.get(loc.MESSAGE).should('contain', 'sucesso')
        })

        it.skip('Should validate data send to create an account', () => {
            const reqStub = cy.stub()
            cy.route({
                method: 'POST',
                url: '/contas',
                response: { id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1 },
                // onRequest: req => {
                //     expect(req.request.body.nome).be.empty
                //     expect(req.request.headers).have.property('Authorization')
                // }
                onRequest: reqStub
            }).as('saveConta')

            cy.acessarMenuConta()

            cy.route({
                method: 'GET',
                url: '/contas',
                response: [
                    { id: 1, nome: 'Carteira', visivel: true, usuario_id: 1 },
                    { id: 2, nome: 'Banco', visivel: true, usuario_id: 1 },
                    { id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1 },
                ]
            }).as('contasSave')

            cy.inserirConta('{CONTROL}')
            // cy.wait('@saveConta').its('request.body.nome').should('not.be.empty')
            cy.wait('@saveConta').then(() => {
                expect(reqStub.args[0][0].request.body.nome).be.empty
                expect(reqStub.args[0][0].request.headers).have.property('Authorization')
            })
            cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
        })

        it('Should test colors', () => {
            cy.route({
                method: 'GET',
                url: '/extrato/**',
                response: [
                    { conta: 'Conta para movimentacoes', id: 31434, descricao: 'Receita paga', envolvido: 'AAA', observacao: null, tipo: 'REC', data_transacao: '2019-11-13T03:00:00.000Z', data_pagamento: '2019-11-13T03:00:00.000Z', valor: '-1500.00', status: true, conta_id: 42077, usuario_id: 1, transferencia_id: null, parcelamento_id: null },
                    { conta: 'Conta com movimentacao', id: 31435, descricao: 'Receita pendente', envolvido: 'BBB', observacao: null, tipo: 'REC', data_transacao: '2019-11-13T03:00:00.000Z', data_pagamento: '2019-11-13T03:00:00.000Z', valor: '-1500.00', status: false, conta_id: 42078, usuario_id: 1, transferencia_id: null, parcelamento_id: null },
                    { conta: 'Conta para saldo', id: 31436, descricao: 'Despesa paga', envolvido: 'CCC', observacao: null, tipo: 'DESP', data_transacao: '2019-11-13T03:00:00.000Z', data_pagamento: '2019-11-13T03:00:00.000Z', valor: '3500.00', status: true, conta_id: 42079, usuario_id: 1, transferencia_id: null, parcelamento_id: null },
                    { conta: 'Conta para saldo', id: 31437, descricao: 'Despesa pendente', envolvido: 'DDD', observacao: null, tipo: 'DESP', data_transacao: '2019-11-13T03:00:00.000Z', data_pagamento: '2019-11-13T03:00:00.000Z', valor: '-1000.00', status: false, conta_id: 42079, usuario_id: 1, transferencia_id: null, parcelamento_id: null }
                ]
            })

            cy.get(loc.MENU.EXTRATO).click()
            cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita paga')).should('have.class', 'receitaPaga')
            cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita pendente')).should('have.class', 'receitaPendente')
            cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa paga')).should('have.class', 'despesaPaga')
            cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa pendente')).should('have.class', 'despesaPendente')
        })
    })
})
