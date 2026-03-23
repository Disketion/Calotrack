class Navigation {
  constructor() {
    this.initMobileMenu();
    this.initQuickActions();
  }

  initMobileMenu() {
    if (window.innerWidth > 768) return;
    
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    var hamburger = document.createElement('button');
    hamburger.className = 'hamburger-menu';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    document.body.insertBefore(hamburger, document.body.firstChild);
    
    var overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    
    hamburger.onclick = function() {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
      hamburger.classList.toggle('active');
      document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
    };
    
    overlay.onclick = function() {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    };
    
    var links = sidebar.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].onclick = function() {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      };
    }
  }
  
  initQuickActions() {
    var container = document.querySelector('.quick-actions');
    if (!container) return;
    
    var isCalc = window.location.pathname.includes('calculator.html');
    
    var html = '<div class="quick-actions-title">⚡ Быстрые действия</div>';
    html += '<div class="quick-actions-buttons">';
    html += '<button class="quick-action-btn" id="quick-calc">⚡ Быстрый расчет</button>';
    html += '<button class="quick-action-btn" id="quick-menu">🍽️ Случайное меню</button>';
    html += '<button class="quick-action-btn" id="quick-saved">💾 Сохраненные</button>';
    html += '<button class="quick-action-btn" id="quick-share">📤 Поделиться</button>';
    html += '</div>';
    
    container.innerHTML = html;
    
    document.getElementById('quick-calc').onclick = function() {
      if (isCalc) {
        document.getElementById('calorie-form')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'calculator.html';
      }
    };
    
    document.getElementById('quick-menu').onclick = function() {
      if (isCalc) {
        document.getElementById('show-menu-btn')?.click();
      } else {
        window.location.href = 'calculator.html';
      }
    };
    
    var self = this;
    document.getElementById('quick-saved').onclick = function() {
      self.showSavedMenus();
    };
    
    document.getElementById('quick-share').onclick = function() {
      self.shareResults();
    };
  }
  
  showSavedMenus() {
    var saved = JSON.parse(localStorage.getItem('savedMenus') || '[]');
    if (saved.length === 0) {
      this.showNotif('Нет сохраненных меню', 'info');
      return;
    }
    
    var modal = document.createElement('div');
    modal.className = 'saved-menus-modal';
    modal.innerHTML = '<div class="modal-content"><div class="modal-header"><h3>💾 Сохраненные меню</h3><button class="close-modal-btn">✖</button></div><div class="modal-body"></div></div>';
    document.body.appendChild(modal);
    
    var body = modal.querySelector('.modal-body');
    
    for (var i = 0; i < saved.length; i++) {
      var item = saved[i];
      var div = document.createElement('div');
      div.className = 'saved-menu-item';
      
      var dateStr = new Date(item.date).toLocaleDateString('ru-RU');
      div.innerHTML = '<div class="saved-menu-date">📅 ' + dateStr + '</div><div class="saved-menu-calories">🔥 ' + item.menu.totalCalories + ' ккал</div><button class="load-menu-btn" data-idx="' + i + '">Загрузить</button>';
      
      body.appendChild(div);
    }
    
    var self = this;
    var loadButtons = modal.querySelectorAll('.load-menu-btn');
    for (var j = 0; j < loadButtons.length; j++) {
      loadButtons[j].onclick = function(e) {
        var idx = parseInt(this.getAttribute('data-idx'));
        var menu = saved[idx].menu;
        
        var event = new CustomEvent('loadSavedMenu', { detail: menu });
        document.dispatchEvent(event);
        
        modal.remove();
        
        if (!window.location.pathname.includes('calculator.html')) {
          window.location.href = 'calculator.html';
        }
      };
    }
    
    var closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.onclick = function() { modal.remove(); };
    
    modal.onclick = function(e) {
      if (e.target === modal) modal.remove();
    };
    
    setTimeout(function() {
      modal.classList.add('active');
    }, 10);
  }
  
  shareResults() {
    var result = document.getElementById('result');
    if (!result || result.innerText.includes('Здесь появится')) {
      this.showNotif('Сначала выполните расчет', 'warning');
      return;
    }
    
    var text = result.innerText;
    var self = this;
    
    if (navigator.share) {
      navigator.share({ title: 'Мои результаты', text: text }).catch(function() {
        navigator.clipboard.writeText(text);
        self.showNotif('Скопировано', 'success');
      });
    } else {
      navigator.clipboard.writeText(text);
      this.showNotif('Скопировано', 'success');
    }
  }
  
  showNotif(msg, type) {
    var toast = document.createElement('div');
    toast.className = 'toast-notification ' + type;
    toast.innerHTML = '<div class="toast-icon">' + (type === 'success' ? '✅' : 'ℹ️') + '</div><div class="toast-message">' + msg + '</div>';
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() { toast.classList.remove('show'); setTimeout(function() { toast.remove(); }, 300); }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  new Navigation();
});
