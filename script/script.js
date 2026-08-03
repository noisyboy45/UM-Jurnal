const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

function getUser() {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function removeUser() {
  localStorage.removeItem('user');
}

function isLoggedIn() {
  return !!getToken();
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

async function apiGet(url) {
  const res = await fetch(API_BASE + url, {
    headers: { ...authHeaders() },
  });
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(API_BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function apiPostForm(url, formData) {
  const res = await fetch(API_BASE + url, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  return res.json();
}

async function apiPutForm(url, formData) {
  const res = await fetch(API_BASE + url, {
    method: 'PUT',
    headers: { ...authHeaders() },
    body: formData,
  });
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(API_BASE + url, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return res.json();
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function updateNavAuth() {
  const navContainers = document.querySelectorAll('.flex.flex-row.items-center.gap-5');
  navContainers.forEach(container => {
    if (isLoggedIn()) {
      const user = getUser();
      container.innerHTML = `
        <a href="/pages/user/dashboard.html" class="bg-[#FFF840] flex justify-center items-center rounded-[6px] w-auto px-3 h-6 font-bold text-sm">Dashboard</a>
        <span class="text-white text-sm font-semibold hidden md:block">${escapeHtml(user ? user.name : '')}</span>
        <button onclick="doLogout()" class="bg-white/20 text-white cursor-pointer flex justify-center items-center rounded-[6px] w-23 h-6 font-bold text-sm">Logout</button>
      `;
    }
  });
}

async function doLogout() {
  try {
    await apiPost('/auth/logout', {});
  } catch (e) {}
  removeToken();
  removeUser();
  window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', function() {
  updateNavAuth();
});
