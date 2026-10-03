document.addEventListener('DOMContentLoaded', () => {
    
    // • 001SC — EVENTOS BLOQUEADOS
    const eventosBloqueados = [
        'contextmenu',
        'copy',
        'cut',
        'paste',
        'dragstart',
        'selectstart'
    ];
    
    eventosBloqueados.forEach(evento => {
        
        document.body.addEventListener(evento, (e) => {
            
            // • 002SC — IDENTIFICAÇÃO SEGURA DO ELEMENTO
            const tag = e.target?.tagName?.toLowerCase?.() || '';
            
            // • 003SC — PERMITE CAMPOS DE TEXTO
            if (
                tag === 'input' ||
                tag === 'textarea' ||
                tag === 'select' ||
                e.target?.isContentEditable
            ) {
                return;
            }
            
            // • 004SC — BLOQUEIA A AÇÃO
            e.preventDefault();
            
        });
        
    });
    
    // • 005SC — BLOQUEIO DE SELEÇÃO
    Object.assign(document.body.style, {
        webkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        webkitTouchCallout: 'none'
    });
    
});