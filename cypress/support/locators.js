const locators = {
    LOGIN: {
        USER: '[data-test=email]',
        PASSWORD: '[data-test=passwd]',
        BTN_LOGIN: '.btn'
    },
    MENU: {
        HOME: '[data-test=menu-home]',
        SETTINGS: '[data-test=menu-settings]',
        CONTAS: '[href="/contas"]',
        RESETAR: '[href="/reset"]',
        MOVIMENTACAO: '[data-test=menu-movimentacao]',
        EXTRATO: '[data-test=menu-extrato]'
    },
    CONTAS: {
        NOME: '[data-test=nome]',
        BTN_SALVAR: '.btn',
        FN_XP_BTN_ALTERAR: nome => `//table//td[contains(., "${nome}")]/..//i[@class="far fa-edit"]`
    },
    MOVIMENTACAO: {
        DESCRICAO: '[data-test=descricao]',
        VALOR: '[data-test=valor]',
        INTERESSADO: '[data-test=envolvido]',
        CONTA: '[data-test=conta]',
        STATUS: '[data-test=status]',
        BTN_SALVAR: '.btn-primary'
    },
    EXTRATO: {
        LINHAS: '.list-group > li',
        FN_XP_BUSCA_ELEMENTO: (nome, valor) => `//span[contains(., "${nome}")]/following-sibling::small[contains(., "${valor}")]`,
        FN_XP_REMOVER_ELEMENTO: nome => `//span[contains(., "${nome}")]/../../..//i[@class="far fa-trash-alt"]`,
        FN_XP_ALTERAR_ELEMENTO: nome => `//span[contains(., "${nome}")]/../../..//i[@class="fas fa-edit"]`
    },
    SALDO: {
        FN_XP_SALDO_CONTA: nome => `//td[contains(., "${nome}")]/../td[2]`
    },
    MESSAGE: '.toast-message'
}

export default locators;