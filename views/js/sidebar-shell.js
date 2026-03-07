(function () {
  const OPEN_CLASS = 'is-open';
  const BODY_LOCK_CLASS = 'sidebar-shell-lock';

  const init = function () {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('hamburgerBtn');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (!sidebar || !toggleBtn || !backdrop) return;

    if (sidebar.dataset.sidebarBound === 'true') return;

    const open = function () {
      sidebar.classList.add(OPEN_CLASS);
      backdrop.classList.add(OPEN_CLASS);
      document.body.classList.add(BODY_LOCK_CLASS);
      toggleBtn.setAttribute('aria-expanded', 'true');
    };

    const close = function () {
      sidebar.classList.remove(OPEN_CLASS);
      backdrop.classList.remove(OPEN_CLASS);
      document.body.classList.remove(BODY_LOCK_CLASS);
      toggleBtn.setAttribute('aria-expanded', 'false');
    };

    const toggle = function () {
      if (sidebar.classList.contains(OPEN_CLASS)) {
        close();
        return;
      }
      open();
    };

    toggleBtn.addEventListener('click', function (event) {
      event.preventDefault();
      toggle();
    });

    backdrop.addEventListener('click', function () {
      close();
    });

    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        close();
      });
    });

    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1280) {
        close();
      }
    });

    sidebar.dataset.sidebarBound = 'true';
    toggleBtn.setAttribute('aria-controls', 'sidebar');
    toggleBtn.setAttribute('aria-expanded', 'false');

    close();
  };

  window.PhysioSidebar = {
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
