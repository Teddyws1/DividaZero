document.addEventListener('DOMContentLoaded', () => {

            // [-021St] Estado Global
            const state = {
                debts: JSON.parse(localStorage.getItem('dz_debts')) || [],
                logs: JSON.parse(localStorage.getItem('dz_logs')) || [],
                currentDate: new Date(2026, 7, 1),
                filterQuery: '',
                sortOption: 'recent',
                theme: localStorage.getItem('dz_theme') || getSystemTheme()
            };

            function getSystemTheme() {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                }
                return 'light';
            }
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('dz_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

// [-022Dm] Mapeamento dos Elementos do DOM
const dom = {
  appContainer: document.getElementById('app-container'),
  debtsContainer: document.getElementById('debts-container'),
  currentMonthDisplay: document.getElementById('current-month-display'),
  
  footerTotal: document.getElementById('footer-total'),
  footerBalance: document.getElementById('footer-balance'),
  footerPaidValue: document.getElementById('footer-paid-value'),
  statCountTotal: document.getElementById('stat-count-total'),
  statCountPaid: document.getElementById('stat-count-paid'),
  statCountPending: document.getElementById('stat-count-pending'),
  
  searchInput: document.getElementById('search-input'),
  
  btnOpenSidebar: document.getElementById('btn-open-sidebar'),
  btnOpenAddModal: document.getElementById('btn-open-add-modal'),
  btnSortMenu: document.getElementById('btn-sort-menu'),
  sortDropdown: document.getElementById('sort-dropdown'),
  sortOptions: document.querySelectorAll('.sort-option'),
  btnPrevMonth: document.getElementById('btn-prev-month'),
  btnNextMonth: document.getElementById('btn-next-month'),
  
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  menuItemHistory: document.getElementById('menu-item-history'),
  menuItemUpdates: document.getElementById('menu-item-updates'),
  menuItemTheme: document.getElementById('menu-item-theme'),
  menuItemExport: document.getElementById('menu-item-export'),
  menuItemImport: document.getElementById('menu-item-import'),
  menuItemDeveloper: document.getElementById('menu-item-developer'),
  importFileInput: document.getElementById('import-file-input'),
  themeIcon: document.getElementById('theme-icon'),
  themeText: document.getElementById('theme-text'),
  
  modalExpense: document.getElementById('modal-add-expense'),
  btnCloseModalExpense: document.getElementById('btn-close-modal-expense'),
  formExpense: document.getElementById('form-expense'),
  expenseCompany: document.getElementById('expense-company'),
  customCompanyGroup: document.getElementById('custom-company-group'),
  expenseCustomCompany: document.getElementById('expense-custom-company'),
  expenseDescription: document.getElementById('expense-description'),
  expenseValue: document.getElementById('expense-value'),
  expenseDate: document.getElementById('expense-date'),
  charCounter: document.getElementById('char-counter'),
  
  modalEditExpense: document.getElementById('modal-edit-expense'),
  btnCloseModalEdit: document.getElementById('btn-close-modal-edit'),
  formEditExpense: document.getElementById('form-edit-expense'),
  editExpenseId: document.getElementById('edit-expense-id'),
  editExpenseCompany: document.getElementById('edit-expense-company'),
  editCustomCompanyGroup: document.getElementById('edit-custom-company-group'),
  editExpenseCustomCompany: document.getElementById('edit-expense-custom-company'),
  editExpenseDescription: document.getElementById('edit-expense-description'),
  editExpenseValue: document.getElementById('edit-expense-value'),
  editExpenseDate: document.getElementById('edit-expense-date'),
  editPaidTrue: document.getElementById('edit-paid-true'),
  editPaidFalse: document.getElementById('edit-paid-false'),
  editCharCounter: document.getElementById('edit-char-counter'),
  btnShareExpense: document.getElementById('btn-share-expense'),
  btnDeleteExpense: document.getElementById('btn-delete-expense'),
  
  modalHistory: document.getElementById('modal-history'),
  btnCloseModalHistory: document.getElementById('btn-close-modal-history'),
  historyListContainer: document.getElementById('history-list-container'),
  btnClearLogs: document.getElementById('btn-clear-logs'),
  
  modalUpdates: document.getElementById('modal-updates'),
  btnCloseModalUpdates: document.getElementById('btn-close-modal-updates'),
  
  modalDeveloper: document.getElementById('modal-developer'),
  btnCloseModalDeveloper: document.getElementById('btn-close-modal-developer'),
  btnCopyDevContact: document.getElementById('btn-copy-dev-contact')
};

function generateRandomID() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let id = "";
  for (let i = 0; i < 3; i++) id += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 3; i++) id += numbers.charAt(Math.floor(Math.random() * numbers.length));
  return id;
}

function saveData() {
  localStorage.setItem('dz_debts', JSON.stringify(state.debts));
  localStorage.setItem('dz_logs', JSON.stringify(state.logs));
  localStorage.setItem('dz_theme', state.theme);
}

function addLog(action) {
  const newLog = {
    id: generateRandomID(),
    action: action,
    timestamp: new Date().toLocaleString('pt-BR')
  };
  state.logs.unshift(newLog);
  saveData();
}
function formatCurrency(val) {
                return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            }

            function updateMonthDisplay() {
                const monthNames = [
                    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
                    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
                ];
                const month = monthNames[state.currentDate.getMonth()];
                const year = state.currentDate.getFullYear();
                dom.currentMonthDisplay.textContent = `${month} / ${year}`;
            }

            function renderDebts() {
                updateMonthDisplay();
                dom.debtsContainer.innerHTML = '';

                const currentMonth = state.currentDate.getMonth();
                const currentYear = state.currentDate.getFullYear();

                let mappedDebts = state.debts.map((d, index) => ({ ...d, originalIndex: index }));

                let filteredDebts = mappedDebts.filter(debt => {
                    const debtDate = new Date(debt.date + 'T00:00:00');
                    const matchesDate = debtDate.getMonth() === currentMonth && debtDate.getFullYear() === currentYear;
                    
                    const query = state.filterQuery.toLowerCase();
                    const company = (debt.company || 'Outros').toLowerCase();
                    const matchesQuery = debt.description.toLowerCase().includes(query) || 
                                         debt.id.toLowerCase().includes(query) ||
                                         company.includes(query);

                    return matchesDate && matchesQuery;
                });

                filteredDebts.sort((a, b) => {
                    if (state.sortOption === 'recent') {
                        return b.originalIndex - a.originalIndex;
                    } else if (state.sortOption === 'oldest') {
                        return a.originalIndex - b.originalIndex;
                    }
                    return 0;
                });

                let totalVal = 0;
                let paidVal = 0;
                let pendingVal = 0;
                let paidCount = 0;
                let pendingCount = 0;

                if (filteredDebts.length === 0) {
                    dom.debtsContainer.innerHTML = `
                        <div class="empty-state">
                            <ion-icon name="document-text-outline"></ion-icon>
                            <p>Nenhuma despesa cadastrada para este mês.</p>
                        </div>
                    `;
                } else {
                    filteredDebts.forEach(debt => {
                        totalVal += debt.value;

                        if (debt.paid) {
                            paidVal += debt.value;
                            paidCount++;
                        } else {
                            pendingVal += debt.value;
                            pendingCount++;
                        }

                        const dateObj = new Date(debt.date + 'T00:00:00');
                        const formattedDate = dateObj.toLocaleDateString('pt-BR');
                        const companyName = debt.company || 'Outros';

                        const card = document.createElement('div');
                        card.className = 'debt-card';
                        card.innerHTML = `
                            <div class="debt-info">
                                <div class="debt-header-info">
                                    <span class="debt-tag-id">#${debt.id}</span>
                                    <span class="debt-company-badge"><ion-icon name="business-outline"></ion-icon>${companyName}</span>
                                </div>
                                <span class="debt-title">${debt.description}</span>
                                <div class="debt-date">
                                    <ion-icon name="calendar-outline"></ion-icon> ${formattedDate}
                                </div>
                            </div>
                            <div class="debt-values">
                                <span class="debt-amount">${formatCurrency(debt.value)}</span>
                                <span class="status-badge ${debt.paid ? 'status-paid' : 'status-pending'}" data-id="${debt.id}">
                                    <ion-icon name="${debt.paid ? 'checkmark-circle-outline' : 'time-outline'}"></ion-icon>
                                    ${debt.paid ? 'Pago' : 'Pendente'}
                                </span>
                            </div>
                        `;
card.addEventListener('click', (e) => {
                            if (!e.target.closest('.status-badge')) {
                                openEditModal(debt);
                            }
                        });

                        const badge = card.querySelector('.status-badge');
                        badge.addEventListener('click', (e) => {
                            e.stopPropagation();
                            toggleDebtStatus(debt.id);
                        });

                        dom.debtsContainer.appendChild(card);
                    });
                }

                dom.statCountTotal.textContent = filteredDebts.length;
                dom.statCountPaid.textContent = paidCount;
                dom.statCountPending.textContent = pendingCount;

                dom.footerPaidValue.textContent = formatCurrency(paidVal);
                dom.footerBalance.textContent = formatCurrency(pendingVal);
                dom.footerTotal.textContent = formatCurrency(totalVal);
            }

            function openEditModal(debt) {
                dom.editExpenseId.value = debt.id;
                
                const selectOptions = Array.from(dom.editExpenseCompany.options).map(o => o.value);
                if (selectOptions.includes(debt.company)) {
                    dom.editExpenseCompany.value = debt.company;
                    dom.editCustomCompanyGroup.style.display = 'none';
                    dom.editExpenseCustomCompany.value = '';
                } else {
                    dom.editExpenseCompany.value = 'custom';
                    dom.editCustomCompanyGroup.style.display = 'flex';
                    dom.editExpenseCustomCompany.value = debt.company || '';
                }

                dom.editExpenseDescription.value = debt.description;
                dom.editExpenseValue.value = debt.value;
                dom.editExpenseDate.value = debt.date;

                if (debt.paid) {
                    dom.editPaidTrue.checked = true;
                } else {
                    dom.editPaidFalse.checked = true;
                }

                dom.editCharCounter.textContent = `${debt.description.length} caracteres`;
                openModal(dom.modalEditExpense);
            }

            function toggleDebtStatus(id) {
                const debt = state.debts.find(d => d.id === id);
                if (debt) {
                    debt.paid = !debt.paid;
                    addLog(`Status da dívida #${debt.id} (${debt.description}) alterado para ${debt.paid ? 'Pago' : 'Pendente'}`);
                    saveData();
                    renderDebts();
                }
            }

            function openModal(modal) {
                modal.classList.add('active');
            }

            function closeModal(modal) {
                modal.classList.remove('active');
            }

            function toggleSidebar(open) {
                if (open) {
                    dom.sidebar.classList.add('active');
                    dom.sidebarOverlay.classList.add('active');
                } else {
                    dom.sidebar.classList.remove('active');
                    dom.sidebarOverlay.classList.remove('active');
                }
            }

            function toggleSortDropdown(open) {
                if (open === undefined) {
                    dom.sortDropdown.classList.toggle('active');
                } else if (open) {
                    dom.sortDropdown.classList.add('active');
                } else {
                    dom.sortDropdown.classList.remove('active');
                }
            }

            function handleOutsideClick(event) {
                if (dom.sidebar.classList.contains('active')) {
                    const isClickInsideSidebar = dom.sidebar.contains(event.target);
                    const isClickOnOpenBtn = dom.btnOpenSidebar.contains(event.target);
                    if (!isClickInsideSidebar && !isClickOnOpenBtn) {
                        toggleSidebar(false);
                    }
                }

                if (dom.sortDropdown.classList.contains('active')) {
                    const isClickInsideDropdown = dom.sortDropdown.contains(event.target);
                    const isClickOnSortBtn = dom.btnSortMenu.contains(event.target);
                    if (!isClickInsideDropdown && !isClickOnSortBtn) {
                        toggleSortDropdown(false);
                    }
                }

                if (event.target.classList.contains('modal-overlay')) {
                    closeModal(event.target);
                }
            }

            document.addEventListener('click', handleOutsideClick);
            document.addEventListener('touchstart', handleOutsideClick, { passive: true });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    toggleSidebar(false);
                    toggleSortDropdown(false);
                    closeModal(dom.modalExpense);
                    closeModal(dom.modalEditExpense);
                    closeModal(dom.modalHistory);
                    closeModal(dom.modalUpdates);
                    closeModal(dom.modalDeveloper);
                }
            });
dom.sortOptions.forEach(option => {
  option.addEventListener('click', () => {
    dom.sortOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    state.sortOption = option.getAttribute('data-sort');
    toggleSortDropdown(false);
    renderDebts();
  });
});

dom.expenseCompany.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    dom.customCompanyGroup.style.display = 'flex';
    dom.expenseCustomCompany.focus();
  } else {
    dom.customCompanyGroup.style.display = 'none';
    dom.expenseCustomCompany.value = '';
  }
});

dom.editExpenseCompany.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    dom.editCustomCompanyGroup.style.display = 'flex';
    dom.editExpenseCustomCompany.focus();
  } else {
    dom.editCustomCompanyGroup.style.display = 'none';
    dom.editExpenseCustomCompany.value = '';
  }
});

dom.expenseDescription.addEventListener('input', (e) => {
  dom.charCounter.textContent = `${e.target.value.length} caracteres`;
});

dom.editExpenseDescription.addEventListener('input', (e) => {
  dom.editCharCounter.textContent = `${e.target.value.length} caracteres`;
});

function renderHistory() {
  dom.historyListContainer.innerHTML = '';
  if (state.logs.length === 0) {
    dom.historyListContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px 0;">Nenhum histórico registrado.</p>';
    return;
  }
  state.logs.forEach(log => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
                        <div style="font-size: 0.85rem; font-weight: bold; color: var(--primary-color);">${log.action}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${log.timestamp} - ID Log: ${log.id}</div>
                    `;
    dom.historyListContainer.appendChild(item);
  });
}

function applyTheme(theme) {
  state.theme = theme;
  if (theme === 'dark') {
    document.documentElement.classList.remove('theme-light');
    document.documentElement.classList.add('theme-dark');
    dom.themeIcon.setAttribute('name', 'sun-outline');
    dom.themeText.textContent = 'Modo Claro';
  } else {
    document.documentElement.classList.remove('theme-dark');
    document.documentElement.classList.add('theme-light');
    dom.themeIcon.setAttribute('name', 'moon-outline');
    dom.themeText.textContent = 'Modo Escuro';
  }
  saveData();
}

dom.btnOpenSidebar.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSidebar(true);
});

dom.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

dom.btnSortMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSortDropdown();
});

dom.btnOpenAddModal.addEventListener('click', () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dom.expenseDate.value = `${yyyy}-${mm}-${dd}`;
  dom.charCounter.textContent = '0 caracteres';
  dom.customCompanyGroup.style.display = 'none';
  dom.expenseCustomCompany.value = '';
  dom.expenseCompany.value = 'Outros';
  openModal(dom.modalExpense);
});

dom.btnCloseModalExpense.addEventListener('click', () => closeModal(dom.modalExpense));
dom.btnCloseModalEdit.addEventListener('click', () => closeModal(dom.modalEditExpense));

dom.btnClearLogs.addEventListener('click', () => {
  if (state.logs.length === 0) return;
  if (confirm('Deseja limpar todo o histórico de ações?')) {
    state.logs = [];
    saveData();
    renderHistory();
  }
});

dom.menuItemDeveloper.addEventListener('click', () => {
  toggleSidebar(false);
  openModal(dom.modalDeveloper);
});

dom.btnCloseModalDeveloper.addEventListener('click', () => closeModal(dom.modalDeveloper));

dom.btnCopyDevContact.addEventListener('click', () => {
  const devContactInfo = "Desenvolvedor: Teddy Machado\nAplicação: DívidaZero 2026™";
  const tempTextArea = document.createElement('textarea');
  tempTextArea.value = devContactInfo;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextArea);
  alert('Contato do desenvolvedor copiado para a área de transferência!');
});

dom.menuItemUpdates.addEventListener('click', () => {
  toggleSidebar(false);
  openModal(dom.modalUpdates);
});

dom.menuItemHistory.addEventListener('click', () => {
  toggleSidebar(false);
  renderHistory();
  openModal(dom.modalHistory);
});

dom.btnCloseModalHistory.addEventListener('click', () => closeModal(dom.modalHistory));
dom.btnCloseModalUpdates.addEventListener('click', () => closeModal(dom.modalUpdates));

dom.btnPrevMonth.addEventListener('click', () => {
  state.currentDate.setMonth(state.currentDate.getMonth() - 1);
  renderDebts();
});

dom.btnNextMonth.addEventListener('click', () => {
  state.currentDate.setMonth(state.currentDate.getMonth() + 1);
  renderDebts();
});

dom.searchInput.addEventListener('input', (e) => {
  state.filterQuery = e.target.value;
  renderDebts();
});

dom.menuItemTheme.addEventListener('click', () => {
  const newTheme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
});
dom.formExpense.addEventListener('submit', (e) => {
  e.preventDefault();
  
  let company = dom.expenseCompany.value;
  if (company === 'custom') {
    company = dom.expenseCustomCompany.value.trim() || 'Outros';
  }
  
  const desc = dom.expenseDescription.value.trim();
  const val = parseFloat(dom.expenseValue.value);
  const date = dom.expenseDate.value;
  
  if (!desc || isNaN(val) || !date) return;
  
  const newDebt = {
    id: generateRandomID(),
    company: company,
    description: desc,
    value: val,
    date: date,
    paid: false
  };
  
  state.debts.push(newDebt);
  addLog(`Nova dívida criada: [${company}] ${desc.substring(0, 25)}... (#${newDebt.id}) - ${formatCurrency(val)}`);
  saveData();
  
  dom.expenseDescription.value = '';
  dom.expenseValue.value = '';
  dom.expenseCustomCompany.value = '';
  closeModal(dom.modalExpense);
  
  const createdDate = new Date(date + 'T00:00:00');
  state.currentDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1);
  
  renderDebts();
});

dom.formEditExpense.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const id = dom.editExpenseId.value;
  const debt = state.debts.find(d => d.id === id);
  
  if (debt) {
    let company = dom.editExpenseCompany.value;
    if (company === 'custom') {
      company = dom.editExpenseCustomCompany.value.trim() || 'Outros';
    }
    
    debt.company = company;
    debt.description = dom.editExpenseDescription.value.trim();
    debt.value = parseFloat(dom.editExpenseValue.value);
    debt.date = dom.editExpenseDate.value;
    debt.paid = dom.editPaidTrue.checked;
    
    addLog(`Dívida #${debt.id} atualizada: [${debt.company}] ${debt.description.substring(0, 25)}...`);
    saveData();
    closeModal(dom.modalEditExpense);
    renderDebts();
  }
});

dom.btnShareExpense.addEventListener('click', () => {
  const id = dom.editExpenseId.value;
  const debt = state.debts.find(d => d.id === id);
  
  if (debt) {
    const dateObj = new Date(debt.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('pt-BR');
    const statusText = debt.paid ? 'PAGO' : 'PENDENTE';
    
    const shareText = `📌 DívidaZero - Detalhes da Conta\n\n` +
      `• ID: #${debt.id}\n` +
      `• Empresa: ${debt.company || 'Outros'}\n` +
      `• Descrição: ${debt.description}\n` +
      `• Valor: ${formatCurrency(debt.value)}\n` +
      `• Vencimento: ${formattedDate}\n` +
      `• Status: ${statusText}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'DívidaZero - Detalhes da Dívida',
        text: shareText
      }).catch(() => {});
    } else {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = shareText;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      alert('Detalhes da dívida copiados para a área de transferência!');
    }
  }
});

dom.btnDeleteExpense.addEventListener('click', () => {
      const id = dom.editExpenseId.value;
      const debtIndex = state.debts.findIndex(d => d.id === id);
      
      if (debtIndex !== -1) {
        const deleted = state.debts.splice(debtIndex, 1)[0];
        addLog(`Dívida #${deleted.id} (${deleted.description.substring(0, 20)}...) foi excluída.`);
        saveData();
        closeModal(dom.modalEditExpense);
renderDebts();
}
});

dom.menuItemExport.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `DividaZero_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  addLog("Backup dos dados exportado com sucesso.");
});

dom.menuItemImport.addEventListener('click', () => {
  dom.importFileInput.click();
});

dom.importFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (importedData.debts && Array.isArray(importedData.debts)) {
        state.debts = importedData.debts;
        state.logs = importedData.logs || [];
        saveData();
        renderDebts();
        alert('Dados importados com sucesso!');
        addLog("Dados importados via arquivo JSON.");
      } else {
        alert('Formato de arquivo JSON inválido.');
      }
    } catch (err) {
      alert('Erro ao ler o arquivo JSON.');
    }
  };
  reader.readAsText(file);
});

document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

document.addEventListener('dblclick', function(e) {
  e.preventDefault();
}, { passive: false });

applyTheme(state.theme);
renderDebts();
});

//////////////////////////////////////
// 
//-001PA : Instalação PWA
//
/////////////////////////////////////

let deferredPrompt = null;

const installApp = document.getElementById("installApp");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  
  deferredPrompt = event;
  
  if (installApp) {
    installApp.hidden = false;
  }
});

if (installApp) {
  installApp.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    await deferredPrompt.userChoice;
    
    deferredPrompt = null;
    installApp.hidden = true;
  });
}

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  
  if (installApp) {
    installApp.hidden = true;
  }
});