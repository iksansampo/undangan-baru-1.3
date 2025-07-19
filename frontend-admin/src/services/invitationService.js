import axios from 'axios';
const BASE = '/backend/api/invitations';
export default {
  async create(data){ const res = await axios.post(`${BASE}/create.php`, data); return res.data; },
  async readAll(){ const res = await axios.get(`${BASE}/read_all.php`); return res.data; },
  async readSingle(id){ const res = await axios.get(`${BASE}/read_single.php`, {params:{id}}); return res.data; },
  async update(id,data){ const res = await axios.post(`${BASE}/update.php?id=${id}`, data); return res.data; },
  async delete(id){ const res = await axios.get(`${BASE}/delete.php`, {params:{id}}); return res.data; }
};
