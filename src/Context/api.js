import axios from "axios";

const API = {
  async search(term, limit = 20) {
    const q = encodeURIComponent(term);
    const url = `https://itunes.apple.com/search?term=${q}&entity=song&limit=${limit}`;
    const res = await axios.get(url);
    return res.data.results || [];
  },
};

export default API;