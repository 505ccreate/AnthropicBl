/**
 * Pentagon / Claude AI — Intel Briefing
 * main.js — Modal control, accessibility, keyboard traps
 */

'use strict';

(function () {
    const OPEN_CLASS = 'is-open';
    const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), audio';
    let previouslyFocused = null;

    /* ── Open modal ─────────────────────────────────────── */
    function openModal(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;
        previouslyFocused = document.activeElement;
        overlay.removeAttribute('hidden');
        void overlay.offsetWidth;
        overlay.classList.add(OPEN_CLASS);
        const first = overlay.querySelector(FOCUSABLE);
        if (first) first.focus();
        pauseAllAudioExcept(modalId);
        document.body.style.overflow = 'hidden';
    }

    /* ── Close modal ────────────────────────────────────── */
    function closeModal(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;
        overlay.classList.remove(OPEN_CLASS);
        overlay.addEventListener('transitionend', function h() {
            overlay.setAttribute('hidden', '');
            overlay.removeEventListener('transitionend', h);
        }, { once: true });
        const audio = overlay.querySelector('audio');
        if (audio) { audio.pause(); audio.currentTime = 0; }
        if (previouslyFocused) { previouslyFocused.focus(); previouslyFocused = null; }
        document.body.style.overflow = '';
    }

    /* ── Pause other audio ─────────────────────────────── */
    function pauseAllAudioExcept(exceptId) {
        document.querySelectorAll('.modal-overlay audio').forEach(function (a) {
            const parent = a.closest('.modal-overlay');
            if (parent && parent.id !== exceptId) { a.pause(); a.currentTime = 0; }
        });
    }

    /* ── Focus trap ─────────────────────────────────────── */
    function trapFocus(e, overlay) {
        if (e.key !== 'Tab') return;
        const all = Array.from(overlay.querySelectorAll(FOCUSABLE));
        if (!all.length) return;
        const first = all[0], last = all[all.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }

    /* ── Wire: "Click to Unlock" buttons ───────────────── */
    document.querySelectorAll('.t-btn-unlock').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            openModal('modal-card-' + btn.getAttribute('data-card'));
        });
    });

    /* ── Wire: clicking anywhere on a card ─────────────── */
    document.querySelectorAll('.t-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.t-btn-unlock')) return;
            openModal(card.getAttribute('data-modal'));
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(card.getAttribute('data-modal'));
            }
        });
    });

    /* ── Wire: close buttons ────────────────────────────── */
    document.querySelectorAll('.modal-close').forEach(function (btn) {
        btn.addEventListener('click', function () { closeModal(btn.getAttribute('data-close')); });
    });

    /* ── Wire: backdrop click + Escape ─────────────────── */
    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal(overlay.id);
        });
        overlay.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeModal(overlay.id); return; }
            if (overlay.classList.contains(OPEN_CLASS)) trapFocus(e, overlay);
        });
    });

})();


/* ── Timeline node hover ─────────────────────────────────── */
document.querySelectorAll('.t-tnode').forEach(function (node) {
    const dot = node.querySelector('.t-tnode__dot');
    node.addEventListener('mouseenter', function () {
        dot.style.background = 'var(--teal-bright, #2bbcd4)';
        dot.style.boxShadow = '0 0 14px rgba(43,188,212,0.8)';
    });
    node.addEventListener('mouseleave', function () {
        if (!dot.classList.contains('t-tnode__dot--active')) {
            dot.style.background = '';
            dot.style.boxShadow = '';
        }
    });
});
