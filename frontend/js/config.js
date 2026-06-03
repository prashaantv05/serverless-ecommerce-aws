const BASE_URL = "https://n8jfqgmey7.execute-api.ap-southeast-1.amazonaws.com";
function getCurrentUserId() {
    return localStorage.getItem("customerId");
}
let compareProducts = [];
let currentPage = 1;
const productsPerPage = 4;


let _allProducts = [];
let _activeCategory = "all";
let _searchQuery = "";


const AWS_REGION = "ap-southeast-1";

const COGNITO_USER_POOL_ID =
    "ap-southeast-1_2tL2Hsvf7";

const COGNITO_CLIENT_ID =
    "6n32ckmcqid333518gieie6jjo";
const COGNITO_DOMAIN =
    "https://kart-ecommerce.auth.ap-southeast-1.amazoncognito.com";

const REDIRECT_URI =
    "https://dx4o02gcthxe4.cloudfront.net";