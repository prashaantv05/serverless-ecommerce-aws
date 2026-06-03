const BASE_URL = "https://n8jfqgmey7.execute-api.ap-southeast-1.amazonaws.com";
const USER_ID = "u1";
let compareProducts = [];
let currentPage = 1;
const productsPerPage = 4;


let _allProducts = [];   // cache from last fetch
let _activeCategory = "all";
let _searchQuery = "";