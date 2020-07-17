/// <reference types="cypress"/>

it.skip('A external test...', () => {

})

describe.only('Learn Cypress...', () => {
    describe.skip('Should group specific tests...', () => {
        it('A specific test...', () => {

        })
    })

    it.skip('A internal test...', () => {

    })

    describe('Asserts tests', () => {
        it('Equality', () => {
            const a = 1

            expect(a).equal(1)
            expect(a, 'Deveria ser 1').equal(1)
            expect(a).be.equal(1)
            expect('a').not.be.equal('b')
        })

        it('Truthy', () => {
            const a = true
            const b = null
            let c

            expect(a).equal(true)
            expect(a).be.true
            expect(true).be.true
            expect(b).be.null
            expect(a).be.not.null
            expect(c).be.undefined
        })

        it('Object Equality', () => {
            const obj = {
                a: 1,
                b: 2
            }

            expect(obj).equal(obj)
            expect(obj).equals(obj)
            expect(obj).eq(obj)
            expect(obj).be.deep.equal({ a: 1, b: 2 })
            expect(obj).eql({ a: 1, b: 2 })
            expect(obj).include({ a: 1 })
            expect(obj).have.property('b')
            expect(obj).have.property('b', 2)
            expect(obj).not.be.empty
            expect({}).be.empty
        })

        it('Arrays', () => {
            const arr = [1, 2, 3]

            expect(arr).have.members([1, 2, 3])
            expect(arr).include.members([1, 3])
            expect(arr).not.be.empty
            expect([]).be.empty
        })

        it('Types', () => {
            const num = 1
            const str = 'String'

            expect(num).be.a('number')
            expect(str).be.a('string')
            expect({}).be.an('object')
            expect([]).be.an('array')
        })

        it('String', () => {
            const str = 'String de teste'

            expect(str).be.eq('String de teste')
            expect(str).have.length(15)
            expect(str).contains('de')
            expect(str).match(/^String/)
            expect(str).match(/teste$/)
            expect(str).match(/.{15}/)
            expect(str).match(/\w+/)
            expect(str).match(/\D+/)
        })

        it('Numbers', () => {
            const number = 4
            const floatNumber = 5.2123

            expect(number).be.eq(4)
            expect(number).be.above(3)
            expect(number).be.below(7)
            expect(floatNumber).be.eq(5.2123)
            expect(floatNumber).be.closeTo(5.2, 0.1)
            expect(floatNumber).be.above(5)
        })
    })

    describe('Cypress basics', () => {
        it('Should visit a page and assert title', () => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')

            cy.title().should('be.equal', 'Campo de Treinamento')
            cy.title().should('contain', 'Campo')

            cy.title()
                .should('be.equal', 'Campo de Treinamento')
                .and('contain', 'Campo')

            let syncTitle

            cy.title().then(title => {
                console.log(title)

                cy.get('#formNome').type(title)

                syncTitle = title
            })

            cy.get('[data-cy=dataSobrenome]').then($el => {
                $el.val(syncTitle)
            })

            cy.get('#elementosForm\\:sugestoes').then($el => {
                cy.wrap($el).type(syncTitle)
            })
        })

        it('Should find and interact with an element', () => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')

            cy.get('#buttonSimple')
                .click()
                .should('have.value', 'Obrigado!')
        })
    })

    describe('Work with basic elements', () => {
        before(() => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
        })

        beforeEach(() => {
            cy.reload()
        })

        it('Text', () => {
            cy.get('body').should('contain', 'Cuidado')
            cy.get('span').should('contain', 'Cuidado')
            cy.get('.facilAchar').should('contain', 'Cuidado')
            cy.get('.facilAchar').should('have.text', 'Cuidado onde clica, muitas armadilhas...')
        })

        it('Links', () => {
            cy.get('[href="#"]').click()
            cy.get('#resultado').should('have.text', 'Voltou!')

            cy.reload()
            cy.get('#resultado').should('have.not.text', 'Voltou!')
            cy.contains('Voltar').click()
            cy.get('#resultado').should('have.text', 'Voltou!')
        })

        it('TextFields', () => {
            cy.get('#formNome').type('Cypress Test')
            cy.get('#formNome').should('have.value', 'Cypress Test')

            cy.get('#elementosForm\\:sugestoes')
                .type('textarea')
                .should('have.value', 'textarea')

            cy.get('#tabelaUsuarios > :nth-child(2) > :nth-child(1) > :nth-child(6) > input')
                .type('???')

            cy.get('[data-cy=dataSobrenome]')
                .type('Teste12345{backspace}{backspace}')
                .should('have.value', 'Teste123')

            cy.get('#elementosForm\\:sugestoes')
                .clear()
                .type('Erro{selectall}acerto', { delay: 100 })
                .should('have.value', 'acerto')
        })

        it('RadioButton', () => {
            cy.get('#formSexoFem')
                .click()
                .should('be.checked')

            cy.get('#formSexoMasc')
                .should('not.be.checked')

            cy.get('[name=formSexo]').should('have.length', 2)
        })

        it('Checkbox', () => {
            cy.get('#formComidaPizza')
                .click()
                .should('be.checked')

            cy.get('[name=formComidaFavorita]')
                .click({ multiple: true })

            cy.get('#formComidaPizza').should('not.be.checked')
            cy.get('#formComidaVegetariana').should('be.checked')
        })

        it('Combo', () => {
            cy.get('[data-test=dataEscolaridade]')
                .select('2o grau completo')
                .should('have.value', '2graucomp')

            cy.get('[data-test=dataEscolaridade]')
                .select('1graucomp')
                .should('have.value', '1graucomp')

            cy.get('[data-test=dataEscolaridade] option')
                .should('have.length', 8)
            cy.get('[data-test=dataEscolaridade] option').then($arr => {
                const values = []
                $arr.each(function () {
                    values.push(this.innerHTML)
                })
                expect(values).include.members(['Superior', 'Mestrado'])
            })
        })

        it('Multiple Combo', () => {
            cy.get('[data-testid=dataEsportes]')
                .select(['natacao', 'Corrida', 'nada'])
            // cy.get('[data-testid=dataEsportes]').should('have.value', ['natacao', 'Corrida', 'nada'])
            cy.get('[data-testid=dataEsportes]').then($el => {
                expect($el.val()).be.deep.equal(['natacao', 'Corrida', 'nada'])
                expect($el.val()).have.length(3)
            })

            cy.get('[data-testid=dataEsportes]').invoke('val')
                .should('eql', ['natacao', 'Corrida', 'nada'])
        })
    })

    describe('Syncronism', () => {
        before(() => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
        })

        beforeEach(() => {
            cy.reload()
        })

        it('Should wait element appear', () => {
            cy.get('#novoCampo').should('not.exist')
            cy.get('#buttonDelay').click()
            cy.get('#novoCampo').should('not.exist')
            cy.get('#novoCampo').should('exist')
            cy.get('#novoCampo').type('funciona')
        })

        it('Should retry', () => {
            cy.get('#buttonDelay').click()
            cy.get('#novoCampo')
                // .should('not.exist')
                .should('exist')
                .type('funciona')
        })

        it('Find use', () => {
            cy.get('#buttonList').click()
            cy.get('#lista li')
                .find('span')
                .should('contain', 'Item 1')
            // cy.get('#lista li')
            //     .find('span')
            //     .should('contain', 'Item 2')
            cy.get('#lista li span')
                .should('contain', 'Item 2')
        })

        it('Timeout use', () => {
            // cy.get('#buttonDelay').click()
            // cy.get('#novoCampo', { timeout: 5000 }).should('exist')
            // ou usando "defaultCommandTimeout": [ms] no cypress.conf

            // cy.get('#buttonListDOM').click()
            // cy.wait(5000)
            // cy.get('#lista li span', { timeout: 30000 })
            //     .should('contain', 'Item 2')

            cy.get('#buttonListDOM').click()
            cy.get('#lista li span')
                .should('have.length', 1)
            cy.get('#lista li span')
                .should('have.length', 2)
        })

        it('Click retry', () => {
            cy.get('#buttonCount')
                .click()
                .click()
                .should('have.value', '111')
        })

        it('Should vs Then', () => {
            cy.get('#buttonListDOM').click()
            cy.get('#lista li span').then($el => {
                expect($el).have.length(1)
                cy.get('#buttonList')
            })
        })
    })

    describe('Helpers...', () => {
        it('Wrap', () => {
            const obj = { nome: 'User', idade: 20 }
            expect(obj).have.property('nome')
            cy.wrap(obj).should('have.property', 'nome')

            cy.visit('https://wcaquino.me/cypress/componentes.html')
            // cy.get('#formNome').then($el => {
            //     // $el.val('funciona via jquery')
            //     cy.wrap($el).type('funciona via cypress')
            // })

            const promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(10)
                }, 500)
            })

            cy.get('#buttonSimple').then(() => console.log('Encontrei o primeiro botao'))
            // promise.then(num => console.log(num))
            cy.wrap(promise).then(ret => console.log(ret))
            cy.get('#buttonList').then(() => console.log('Encontrei o segundo botao'))

            cy.wrap(1).should(num => {
                return 2
            }).should('be.equal', 1)
        })

        it('Its...', () => {
            const obj = { nome: 'User', idade: 20 }
            cy.wrap(obj).should('have.property', 'nome', 'User')
            cy.wrap(obj).its('nome').should('be.equal', 'User')

            const obj2 = { nome: 'User', idade: 20, endereco: { rua: 'dos bobos' } }
            cy.wrap(obj2).its('endereco').should('have.property', 'rua')
            cy.wrap(obj2).its('endereco').its('rua').should('contain', 'bobos')
            cy.wrap(obj2).its('endereco.rua').should('contain', 'bobos')

            cy.visit('https://wcaquino.me/cypress/componentes.html')
            cy.title().its('length').should('be.equal', 20)
        })

        it('Invoke...', () => {
            const getValue = () => 1
            const soma = (a, b) => a + b

            cy.wrap({ fn: getValue }).invoke('fn').should('be.equal', 1)
            cy.wrap({ fn: soma }).invoke('fn', 2, 5).should('be.equal', 7)

            cy.visit('https://wcaquino.me/cypress/componentes.html')
            cy.get('#formNome').invoke('val', 'Texto via invoke')
            cy.window().invoke('alert', 'Da pra ver')
            cy.get('#resultado')
                .invoke('html', '<input type="button" value="hacked!"/>')
        })
    })

    describe('Work with alerts', () => {
        before(() => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
        })

        beforeEach(() => {
            cy.reload()
        })

        it('Alert', () => {
            // cy.get('#alert').click()
            // cy.on('window:alert', msg => {
            //     expect(msg).be.equal('Alert Simples')
            // })

            cy.clickAlert('#alert', 'Alert Simples')
        })

        it('Alert with mock', () => {
            const stub = cy.stub().as('alert')
            cy.on('window:alert', stub)
            cy.get('#alert').click().then(() => {
                expect(stub.getCall(0)).be.calledWith('Alert Simples')
            })
        })

        it('Confirm', () => {
            cy.on('window:confirm', msg => {
                expect(msg).be.equal('Confirm Simples')
            })
            cy.on('window:alert', msg => {
                expect(msg).be.equal('Confirmado')
            })
            cy.get('#confirm').click()
        })

        it('Deny', () => {
            cy.on('window:confirm', msg => {
                expect(msg).be.equal('Confirm Simples')
                return false
            })
            cy.on('window:alert', msg => {
                expect(msg).be.equal('Negado')
            })
            cy.get('#confirm').click()
        })

        it('Prompt', () => {
            cy.window().then(win => {
                cy.stub(win, 'prompt').returns('42')
            })
            cy.on('window:confirm', msg => {
                expect(msg).be.equal('Era 42?')
            })
            cy.on('window:alert', msg => {
                expect(msg).be.equal(':D')
            })
            cy.get('#prompt').click()
        })

        it('Messages validate', () => {
            const stub = cy.stub().as('alert')
            cy.on('window:alert', stub)
            cy.get('#formCadastrar').click()
                .then(() => {
                    expect(stub.getCall(0)).be.calledWith('Nome eh obrigatorio')
                })

            cy.get('#formNome').type('Wagner')
            cy.get('#formCadastrar').click()
                .then(() => {
                    expect(stub.getCall(1)).be.calledWith('Sobrenome eh obrigatorio')
                })

            cy.get('[data-cy=dataSobrenome]').type('Aquino')
            cy.get('#formCadastrar').click()
                .then(() => {
                    expect(stub.getCall(2)).be.calledWith('Sexo eh obrigatorio')
                })

            cy.get('#formSexoMasc').click()
            cy.get('#formCadastrar').click()

            cy.get('#resultado > :nth-child(1)').should('contain', 'Cadastrado!')
        })
    })

    describe('Work with iframes', () => {
        before(() => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
        })

        beforeEach(() => {
            cy.reload()
        })

        it('Should fill text field', () => {
            cy.get('#frame1').then(iframe => {
                const body = iframe.contents().find('body')
                cy.wrap(body).find('#tfield')
                    .type('funciona?')
                    .should('have.value', 'funciona?')

                cy.on('window:alert', msg => {
                    expect(msg).be.equal('Alert Simples')
                })
                //cy.wrap(body).find('#otherButton').click()
            })

        })

        it('Should test frame directly', () => {
            cy.visit('https://wcaquino.me/cypress/frame.html')
            cy.on('window:alert', msg => {
                expect(msg).be.equal('Click OK!')
            })
            cy.get('#otherButton').click()
        })
    })

    describe('Work with Popup', () => {
        it('Should fill text field', () => {
            cy.visit('https://wcaquino.me/cypress/frame.html')
            cy.on('window:alert', msg => {
                expect(msg).be.equal('Click OK!')
            })
            cy.get('#otherButton').click()
        })

        it('Should check if popup was invoked', () => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
            cy.window().then(win => {
                cy.stub(win, 'open').as('winOpen')
            })
            cy.get('#buttonPopUp').click()
            cy.get('@winOpen').should('be.called')
        })

        describe('With links...', () => {
            beforeEach(() => {
                cy.visit('https://wcaquino.me/cypress/componentes.html')
            })

            it('Check popup url', () => {
                cy.contains('Popup2')
                    .should('have.prop', 'href')
                    .and('equal', 'https://wcaquino.me/cypress/frame.html')
            })

            it('Should access popup dinamically', () => {
                cy.contains('Popup2').then($a => {
                    const href = $a.prop('href')
                    cy.visit(href)
                    cy.get('#tfield').type('funciona')
                })
            })

            it('Should force link on same page', () => {
                cy.contains('Popup2')
                    .invoke('removeAttr', 'target')
                    .click()
            })
        })
    })

    describe('Work with basic elements', () => {
        before(() => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
        })

        beforeEach(() => {
            cy.reload()
        })

        it('Using jQuery Selector', () => {
            cy.get(':nth-child(1) > :nth-child(3) > [type="button"]')
            cy.get('table#tabelaUsuarios tbody > tr:eq(0) td:nth-child(3) > input')
            cy.get('[onclick*="Francisco"]')
            cy.get('#tabelaUsuarios td:contains("Doutorado"):eq(0) ~ td:eq(3) > input')
            cy.get('#tabelaUsuarios tr:contains("Doutorado"):eq(0) td:eq(6) input')
        })

        it('Using XPath', () => {
            cy.xpath('//input[contains(@onclick, "Francisco")]')
            cy.xpath('//table[@id="tabelaUsuarios"]//td[contains(., "Francisco")]/..//input[@type="text"]')
            cy.xpath('//td[contains(., "Usuario A")]/following-sibling::td[contains(., "Mestrado")]/..//input[@type="text"]').type('funciona')
        })
    })

    describe('Fixtures tests', () => {
        it('Get data from fixture file', function () {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
            cy.fixture('userData').as('usuario').then(function () {
                cy.get('#formNome').type(this.usuario.nome)
                cy.get('[data-cy=dataSobrenome]').type(this.usuario.sobrenome)
                cy.get(`[name=formSexo][value=${this.usuario.sexo}]`).click()
                cy.get(`[name=formComidaFavorita][value=${this.usuario.comida}]`)
                cy.get('#formEscolaridade').select(this.usuario.escolaridade)
                cy.get('#formEsportes').select(this.usuario.esportes)
                cy.get('#formCadastrar').click()
                cy.get('#resultado > :nth-child(1)').should('contain', 'Cadastrado!')
            })
        })
    })

    describe('Dynamic test', () => {
        beforeEach(() => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
        })

        const foods = ['Carne', 'Frango', 'Pizza', 'Vegetariano']

        foods.forEach(food => {
            it(`Register food ${food}`, function () {
                cy.get('#formNome').type('Usuario')
                cy.get('[data-cy=dataSobrenome]').type('Qualquer')
                cy.get(`[name=formSexo][value=F]`).click()
                cy.xpath(`//label[contains(., "${food}")]/preceding-sibling::input`).click()
                cy.get('#formEscolaridade').select('Doutorado')
                cy.get('#formEsportes').select('Corrida')
                cy.get('#formCadastrar').click()
                cy.get('#resultado > :nth-child(1)').should('contain', 'Cadastrado!')
            })
        })

        it(`Should select all using each`, function () {
            cy.get('#formNome').type('Usuario')
            cy.get('[data-cy=dataSobrenome]').type('Qualquer')
            cy.get(`[name=formSexo][value=F]`).click()
            cy.get(`[name=formComidaFavorita]`).each($el => {
                if ($el.val() !== 'vegetariano') {
                    cy.wrap($el).click()
                }
            })
            cy.get('#formEscolaridade').select('Doutorado')
            cy.get('#formEsportes').select('Corrida')
            cy.get('#formCadastrar').click()
            cy.get('#resultado > :nth-child(1)').should('contain', 'Cadastrado!')
            // cy.clickAlert('#formCadastrar', 'Tem certeza que voce eh vegetariano?')
        })
    })

    describe('Time', () => {
        beforeEach(() => {
            cy.visit('https://wcaquino.me/cypress/componentes.html')
        })

        it(`Going back to the past`, () => {
            // cy.get('#buttonNow').click()
            // cy.get("#resultado > span").should('contain', '09/06/2020')

            // cy.clock()
            // cy.get('#buttonNow').click()
            // cy.get("#resultado > span").should('contain', '31/12/1969')

            const dt = new Date(2012, 3, 10, 15, 23, 50)
            cy.clock(dt.getTime())
            cy.get('#buttonNow').click()
            cy.get("#resultado > span").should('contain', '10/04/2012')
        })

        it(`Going to the future`, () => {
            // cy.get('#buttonTimePassed').click()
            // cy.get("#resultado > span").should('contain', '15731')
            // cy.get("#resultado > span").invoke('text').then(t => {
            //     const number = parseInt(t)
            //     cy.wrap(number).should('gt', 1573179702885)
            // })

            cy.clock()
            // cy.get('#buttonTimePassed').click()
            // cy.get("#resultado > span").invoke('text').then(t => {
            //     const number = parseInt(t)
            //     cy.wrap(number).should('lte', 0)
            // })
            // cy.wait(1000)
            // cy.get('#buttonTimePassed').click()
            // cy.get("#resultado > span").invoke('text').then(t => {
            //     const number = parseInt(t)
            //     cy.wrap(number).should('lte', 1000)
            // })

            cy.tick(5000)
            cy.get('#buttonTimePassed').click()
            cy.get("#resultado > span").invoke('text').then(t => {
                const number = parseInt(t)
                cy.wrap(number).should('gte', 5000)
            })
            cy.tick(10000)
            cy.get('#buttonTimePassed').click()
            cy.get("#resultado > span").invoke('text').then(t => {
                const number = parseInt(t)
                cy.wrap(number).should('gte', 15000)
            })
        })
    })
})